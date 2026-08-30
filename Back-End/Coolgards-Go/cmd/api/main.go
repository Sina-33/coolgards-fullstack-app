package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/config"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/httpapi"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/mailer"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/password"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/payment"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/store"
)

func main() {
	logger := log.New(os.Stdout, "coolgards-api ", log.LstdFlags|log.LUTC|log.Lmsgprefix)
	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("config: %v", err)
	}

	startupCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	db, err := store.Connect(startupCtx, cfg.DBAddress, cfg.DBName)
	cancel()
	if err != nil {
		logger.Fatalf("database: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	if err := db.EnsureIndexes(ctx); err != nil {
		cancel()
		_ = db.Close(context.Background())
		logger.Fatalf("indexes: %v", err)
	}
	if cfg.AdminEmail != "" && cfg.AdminPassword != "" {
		hash, err := password.Hash(cfg.AdminPassword)
		if err != nil {
			cancel()
			_ = db.Close(context.Background())
			logger.Fatalf("admin password: %v", err)
		}
		if err := db.EnsureAdmin(ctx, cfg.AdminEmail, cfg.AdminFullName, hash); err != nil {
			cancel()
			_ = db.Close(context.Background())
			logger.Fatalf("admin seed: %v", err)
		}
	}
	cancel()

	mail := mailer.Mailer{Host: cfg.SMTPHost, Port: cfg.SMTPPort, Username: cfg.SMTPUsername, Password: cfg.SMTPPassword, From: cfg.SMTPFrom}
	paypal := payment.NewPayPal(cfg.PayPalURL, cfg.PayPalClientID, cfg.PayPalSecret)
	handler := httpapi.New(cfg, db, mail, paypal, logger)
	server := &http.Server{Addr: ":" + cfg.Port, Handler: handler.Router(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 20 * time.Second, WriteTimeout: 30 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 1 << 20}

	errCh := make(chan error, 1)
	go func() {
		logger.Printf("listening port=%s env=%s", cfg.Port, cfg.AppEnv)
		errCh <- server.ListenAndServe()
	}()
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	select {
	case sig := <-sigCh:
		logger.Printf("shutdown signal=%s", sig)
	case err := <-errCh:
		if !errors.Is(err, http.ErrServerClosed) {
			logger.Printf("server stopped: %v", err)
		}
	}
	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Printf("http shutdown: %v", err)
	}
	if err := db.Close(shutdownCtx); err != nil {
		logger.Printf("database shutdown: %v", err)
	}
}

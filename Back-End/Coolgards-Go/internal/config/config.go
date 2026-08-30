package config

import (
	"bufio"
	"errors"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv          string
	Port            string
	DBAddress       string
	DBName          string
	JWTSecret       string
	FrontendBaseURL string
	AllowedOrigins  []string
	MediaDir        string
	CookieSecure    bool
	PayPalURL       string
	PayPalClientID  string
	PayPalSecret    string
	SMTPHost        string
	SMTPPort        string
	SMTPUsername    string
	SMTPPassword    string
	SMTPFrom        string
	AdminEmail      string
	AdminPassword   string
	AdminFullName   string
	ShutdownTimeout time.Duration
}

func Load() (Config, error) {
	_ = loadDotEnv(".env")

	cfg := Config{
		AppEnv:          getenv("APP_ENV", "development"),
		Port:            getenv("PORT", "4000"),
		DBAddress:       getenv("DB_ADDRESS", "mongodb://localhost:27017/coolgards"),
		FrontendBaseURL: strings.TrimRight(getenv("FRONTEND_BASE_URL", "http://localhost:3000"), "/"),
		AllowedOrigins:  splitCSV(getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://coolgards.com,https://coolgards.com")),
		MediaDir:        getenv("MEDIA_DIR", "media"),
		CookieSecure:    getenvBool("COOKIE_SECURE", false),
		PayPalURL:       strings.TrimRight(getenv("PAYPAL_URL", "https://api-m.sandbox.paypal.com"), "/"),
		PayPalClientID:  os.Getenv("CLIENT_ID"),
		PayPalSecret:    os.Getenv("APP_SECRET"),
		SMTPHost:        os.Getenv("SMTP_HOST"),
		SMTPPort:        getenv("SMTP_PORT", "587"),
		SMTPUsername:    os.Getenv("SMTP_USERNAME"),
		SMTPPassword:    os.Getenv("SMTP_PASSWORD"),
		SMTPFrom:        os.Getenv("SMTP_FROM"),
		AdminEmail:      strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL"))),
		AdminPassword:   os.Getenv("ADMIN_PASSWORD"),
		AdminFullName:   getenv("ADMIN_FULL_NAME", "Coolgards Admin"),
		ShutdownTimeout: 10 * time.Second,
	}

	cfg.JWTSecret = os.Getenv("SECRET")
	if len(cfg.JWTSecret) < 32 {
		return Config{}, errors.New("SECRET must be set to a random value of at least 32 characters")
	}

	cfg.DBName = os.Getenv("DB_NAME")
	if cfg.DBName == "" {
		cfg.DBName = dbNameFromURI(cfg.DBAddress)
	}
	if cfg.DBName == "" {
		cfg.DBName = "coolgards"
	}

	if cfg.MediaDir != "" {
		if abs, err := filepath.Abs(cfg.MediaDir); err == nil {
			cfg.MediaDir = abs
		}
	}

	return cfg, nil
}

func dbNameFromURI(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return ""
	}
	return strings.Trim(strings.TrimSpace(u.Path), "/")
}

func splitCSV(v string) []string {
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if s := strings.TrimSpace(p); s != "" {
			out = append(out, s)
		}
	}
	return out
}

func getenv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func getenvBool(key string, fallback bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return parsed
}

func loadDotEnv(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key != "" && os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}
	return scanner.Err()
}

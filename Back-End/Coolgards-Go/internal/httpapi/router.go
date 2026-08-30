package httpapi

import (
	"log"
	"net/http"
	"time"

	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/auth"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/config"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/mailer"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/payment"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/store"
)

const cookieName = "cookieToken"

type Handler struct {
	cfg            config.Config
	store          *store.Store
	tokens         *auth.Manager
	mailer         mailer.Mailer
	paypal         *payment.PayPal
	logger         *log.Logger
	allowedOrigins map[string]bool
	globalLimiter  *rateLimiter
	authLimiter    *rateLimiter
}

func New(cfg config.Config, store *store.Store, mail mailer.Mailer, paypal *payment.PayPal, logger *log.Logger) *Handler {
	origins := make(map[string]bool, len(cfg.AllowedOrigins))
	for _, origin := range cfg.AllowedOrigins {
		origins[origin] = true
	}
	if logger == nil {
		logger = newLogger()
	}
	return &Handler{
		cfg:            cfg,
		store:          store,
		tokens:         auth.NewManager(cfg.JWTSecret, 7*24*time.Hour),
		mailer:         mail,
		paypal:         paypal,
		logger:         logger,
		allowedOrigins: origins,
		globalLimiter:  newRateLimiter(300, time.Minute),
		authLimiter:    newRateLimiter(20, 10*time.Minute),
	}
}

func (h *Handler) Router() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", h.root)
	mux.HandleFunc("GET /healthz", h.health)
	mux.HandleFunc("POST /users", h.authRateLimit(h.signup))
	mux.HandleFunc("POST /users/login", h.authRateLimit(h.login))
	mux.HandleFunc("POST /users/logout", h.requireAuth(h.logout))
	mux.HandleFunc("POST /users/logoutAll", h.requireAuth(h.logoutAll))
	mux.HandleFunc("GET /users/me", h.requireAuth(h.me))
	mux.HandleFunc("PATCH /users/me", h.requireAuth(h.updateMe))
	mux.HandleFunc("POST /forgot", h.authRateLimit(h.forgot))
	mux.HandleFunc("GET /reset/{id}/{code}", h.authRateLimit(h.validateReset))
	mux.HandleFunc("POST /reset", h.authRateLimit(h.resetPassword))
	mux.HandleFunc("GET /panel/users", h.requireAdmin(h.panelUsersList))
	mux.HandleFunc("POST /panel/users", h.requireAdmin(h.panelUsersCreate))
	mux.HandleFunc("PATCH /panel/users", h.requireAdmin(h.panelUsersUpdate))
	mux.HandleFunc("DELETE /panel/users", h.requireAdmin(h.panelUsersDelete))
	mux.HandleFunc("GET /products", h.productsList)
	mux.HandleFunc("GET /products/{slug}", h.productBySlug)
	mux.HandleFunc("GET /panel/products", h.requireAdmin(h.panelProductsList))
	mux.HandleFunc("POST /panel/products", h.requireAdmin(h.panelProductsCreate))
	mux.HandleFunc("PATCH /panel/products", h.requireAdmin(h.panelProductsUpdate))
	mux.HandleFunc("DELETE /panel/products", h.requireAdmin(h.panelProductsDelete))
	mux.HandleFunc("GET /posts", h.postsList)
	mux.HandleFunc("GET /posts/{slug}", h.postBySlug)
	mux.HandleFunc("GET /panel/posts", h.requireAdmin(h.panelPostsList))
	mux.HandleFunc("POST /panel/posts", h.requireAdmin(h.panelPostsCreate))
	mux.HandleFunc("PATCH /panel/posts", h.requireAdmin(h.panelPostsUpdate))
	mux.HandleFunc("DELETE /panel/posts", h.requireAdmin(h.panelPostsDelete))
	mux.HandleFunc("GET /shipments", h.shipmentsList)
	mux.HandleFunc("GET /panel/shipments", h.requireAdmin(h.panelShipmentsList))
	mux.HandleFunc("POST /panel/shipments", h.requireAdmin(h.panelShipmentsCreate))
	mux.HandleFunc("PATCH /panel/shipments", h.requireAdmin(h.panelShipmentsUpdate))
	mux.HandleFunc("DELETE /panel/shipments", h.requireAdmin(h.panelShipmentsDelete))
	mux.HandleFunc("POST /panel/messages", h.createMessage)
	mux.HandleFunc("GET /panel/messages", h.requireAdmin(h.panelMessagesList))
	mux.HandleFunc("PATCH /panel/messages", h.requireAdmin(h.panelMessagesUpdate))
	mux.HandleFunc("DELETE /panel/messages", h.requireAdmin(h.panelMessagesDelete))
	mux.HandleFunc("GET /panel/orders", h.requireAdmin(h.panelOrdersList))
	mux.HandleFunc("POST /panel/orders", h.requireAdmin(h.panelOrdersCreate))
	mux.HandleFunc("PATCH /panel/orders", h.requireAdmin(h.panelOrdersUpdate))
	mux.HandleFunc("DELETE /panel/orders", h.requireAdmin(h.panelOrdersDelete))
	mux.HandleFunc("POST /orders", h.createOrder)
	mux.HandleFunc("POST /cart", h.refreshCart)
	mux.HandleFunc("GET /panel/general/dashboard", h.requireAdmin(h.dashboard))
	mux.HandleFunc("POST /media", h.requireAdmin(h.uploadMedia))
	mux.HandleFunc("GET /media/all", h.requireAdmin(h.mediaList))
	mux.HandleFunc("DELETE /media", h.requireAdmin(h.mediaDelete))
	mux.HandleFunc("GET /media/{name...}", h.serveMedia)
	mux.HandleFunc("POST /create-order", h.createPayPalOrder)
	mux.HandleFunc("POST /capture-order/{orderID}", h.capturePayPalOrder)
	return h.middleware(mux)
}

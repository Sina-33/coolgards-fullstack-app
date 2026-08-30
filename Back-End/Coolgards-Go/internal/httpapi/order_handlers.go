package httpapi

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/auth"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/commerce"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/domain"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/password"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type cartInput struct {
	ID       string `json:"_id"`
	Quantity int    `json:"quantity"`
}

type userInfoInput struct {
	ID          string `json:"_id"`
	FullName    string `json:"fullName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Country     string `json:"country"`
	City        string `json:"city"`
	Address     string `json:"address"`
	PostalCode  string `json:"postalCode"`
	MobilePhone string `json:"mobilePhone"`
}

type orderInput struct {
	Cart         []cartInput   `json:"cart"`
	ShipmentPlan string        `json:"shipmentPlan"`
	UserInfo     userInfoInput `json:"userInfo"`
}

func (h *Handler) hydrateCart(r *http.Request, cart []cartInput, shipmentID string) ([]domain.OrderItem, domain.Shipment, commerce.Totals, error) {
	if len(cart) == 0 || len(cart) > 100 {
		return nil, domain.Shipment{}, commerce.Totals{}, errors.New("cart must contain between 1 and 100 items")
	}
	ids := make([]primitive.ObjectID, 0, len(cart))
	for _, item := range cart {
		id, err := objectID(item.ID)
		if err != nil || item.Quantity < 1 || item.Quantity > 1000 {
			return nil, domain.Shipment{}, commerce.Totals{}, errors.New("invalid cart item")
		}
		ids = append(ids, id)
	}
	cur, err := h.store.DB.Collection("products").Find(r.Context(), bson.M{"_id": bson.M{"$in": ids}})
	if err != nil { return nil, domain.Shipment{}, commerce.Totals{}, err }
	defer cur.Close(r.Context())
	var products []domain.Product
	if err := cur.All(r.Context(), &products); err != nil { return nil, domain.Shipment{}, commerce.Totals{}, err }
	if len(products) != len(ids) { return nil, domain.Shipment{}, commerce.Totals{}, errors.New("one or more cart products no longer exist") }
	byID := make(map[primitive.ObjectID]domain.Product, len(products))
	for _, p := range products { byID[p.ID] = p }
	items := make([]domain.OrderItem, 0, len(cart))
	for _, raw := range cart {
		id, _ := objectID(raw.ID)
		p, ok := byID[id]
		if !ok { return nil, domain.Shipment{}, commerce.Totals{}, errors.New("product not found") }
		items = append(items, domain.OrderItem{ID: p.ID, Quantity: raw.Quantity, Price: p.Price, Slug: p.Slug, Title: p.Title, ImageURLs: p.ImageURLs})
	}
	sid, err := objectID(shipmentID)
	if err != nil { return nil, domain.Shipment{}, commerce.Totals{}, errors.New("invalid shipment plan") }
	var shipment domain.Shipment
	if err := h.store.DB.Collection("shipments").FindOne(r.Context(), bson.M{"_id": sid}).Decode(&shipment); err != nil { return nil, domain.Shipment{}, commerce.Totals{}, errors.New("shipment plan not found") }
	calcItems := make([]commerce.Line, 0, len(items))
	for _, item := range items { calcItems = append(calcItems, commerce.Line{Quantity: item.Quantity, Price: item.Price}) }
	totals := commerce.Calculate(calcItems, shipment.ShipmentPrice, shipment.VAT)
	return items, shipment, totals, nil
}

func (h *Handler) refreshCart(w http.ResponseWriter, r *http.Request) {
	var req struct { Cart []cartInput `json:"cart"`; ShipmentPlan string `json:"shipmentPlan"` }
	if err := decodeJSON(r, &req); err != nil { writeError(w, 400, "invalid request body"); return }
	items, _, totals, err := h.hydrateCart(r, req.Cart, req.ShipmentPlan)
	if err != nil { writeError(w, 400, err.Error()); return }
	writeJSON(w, 200, map[string]any{"cart": items, "orderInfo": map[string]any{"totalItems": totals.Items, "totalItemsPrice": totals.ItemsPrice, "totalShipmentPrice": totals.ShipmentPrice, "totalVatPrice": totals.VATPrice, "totalPrice": totals.TotalPrice}})
}

func (h *Handler) createOrder(w http.ResponseWriter, r *http.Request) {
	var req orderInput
	if err := decodeJSON(r, &req); err != nil { writeError(w, 400, "invalid request body"); return }
	req.UserInfo.Email = normalizeEmail(req.UserInfo.Email)
	if !validEmail(req.UserInfo.Email) { writeError(w, 400, "Email is invalid"); return }
	items, shipment, totals, err := h.hydrateCart(r, req.Cart, req.ShipmentPlan)
	if err != nil { writeError(w, 400, err.Error()); return }
	if strings.TrimSpace(req.UserInfo.FullName) == "" || strings.TrimSpace(req.UserInfo.City) == "" || strings.TrimSpace(req.UserInfo.Address) == "" || strings.TrimSpace(req.UserInfo.PostalCode) == "" { writeError(w, 400, "shipping address is incomplete"); return }

	users := h.store.DB.Collection("users")
	var createdUser *domain.User
	userID := strings.TrimSpace(req.UserInfo.ID)
	if userID == "" {
		hash, err := password.Hash(req.UserInfo.Password)
		if err != nil { writeError(w, 400, err.Error()); return }
		now := time.Now().UTC()
		u := domain.User{ID: primitive.NewObjectID(), FullName: strings.TrimSpace(req.UserInfo.FullName), Email: req.UserInfo.Email, Roles: []string{"customer"}, Password: hash, Country: strings.TrimSpace(req.UserInfo.Country), City: strings.TrimSpace(req.UserInfo.City), Address: strings.TrimSpace(req.UserInfo.Address), PostalCode: strings.TrimSpace(req.UserInfo.PostalCode), MobilePhone: strings.TrimSpace(req.UserInfo.MobilePhone), CreatedAt: now, UpdatedAt: now}
		token, session, err := h.newSession(u.ID, r.UserAgent())
		if err != nil { writeError(w, 500, "could not create session"); return }
		u.Sessions = []domain.Session{session}
		if _, err := users.InsertOne(r.Context(), u); err != nil {
			if mongo.IsDuplicateKeyError(err) { writeError(w, 409, "this email already exists please login first"); return }
			writeError(w, 500, "could not create user"); return
		}
		createdUser = &u
		h.setSessionCookie(w, token)
	} else {
		id, err := objectID(userID)
		if err != nil { writeError(w, 400, "invalid user"); return }
		cookie, err := r.Cookie(cookieName)
		if err != nil || strings.TrimSpace(cookie.Value) == "" { writeError(w, http.StatusUnauthorized, "Please authenticate."); return }
		claims, err := h.tokens.Verify(cookie.Value)
		if err != nil || claims.Subject != id.Hex() { writeError(w, http.StatusUnauthorized, "Please authenticate."); return }
		var u domain.User
		if err := users.FindOne(r.Context(), bson.M{"_id": id, "email": req.UserInfo.Email, "sessions.tokenHash": auth.HashToken(cookie.Value)}).Decode(&u); err != nil { writeError(w, http.StatusUnauthorized, "Please authenticate."); return }
	}
	now := time.Now().UTC()
	order := domain.Order{ID: primitive.NewObjectID(), Cart: items, UserEmail: req.UserInfo.Email, Status: "CREATED", TotalItems: totals.Items, TotalItemsPrice: totals.ItemsPrice, TotalShipmentPrice: totals.ShipmentPrice, TotalVATPrice: totals.VATPrice, TotalPrice: totals.TotalPrice, Address: domain.OrderAddress{FullName: strings.TrimSpace(req.UserInfo.FullName), Country: shipment.Country, City: strings.TrimSpace(req.UserInfo.City), Address: strings.TrimSpace(req.UserInfo.Address), PostalCode: strings.TrimSpace(req.UserInfo.PostalCode), MobilePhone: strings.TrimSpace(req.UserInfo.MobilePhone)}, CreatedAt: now, UpdatedAt: now}
	if _, err := h.store.DB.Collection("orders").InsertOne(r.Context(), order); err != nil { writeError(w, 500, "could not create order"); return }
	msg := "order was created successfully"
	if createdUser != nil { msg = "order and user was created successfully" }
	writeJSON(w, 201, map[string]any{"message": msg, "data": order})
}

func (h *Handler) panelOrdersList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query(); filter := bson.M{}
	if v := q.Get("status"); v != "" { filter["status"] = v }
	if v := q.Get("userId"); v != "" { filter["userEmail"] = regexFilter(v) }
	data, total, err := listMaps(r, h.store.DB.Collection("orders"), filter, nil, bson.D{{Key: "createdAt", Value: -1}})
	if err != nil { writeError(w, 500, "could not load orders"); return }
	writeJSON(w, 200, map[string]any{"data": data, "total": total})
}

func (h *Handler) panelOrdersCreate(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, 400, "invalid request body"); return }
	now := time.Now().UTC(); body["_id"] = primitive.NewObjectID(); body["createdAt"] = now; body["updatedAt"] = now
	if _, err := h.store.DB.Collection("orders").InsertOne(r.Context(), body); err != nil { writeError(w, 400, "could not create order"); return }
	writeJSON(w, 201, map[string]any{"message": "order was created successfully", "data": body})
}

func (h *Handler) panelOrdersUpdate(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, 400, "invalid request body"); return }
	id, err := bodyID(body); if err != nil { writeError(w, 400, err.Error()); return }
	delete(body, "_id"); body["updatedAt"] = time.Now().UTC()
	updated, err := updateByID(r, h.store.DB.Collection("orders"), id, body)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, 200, map[string]any{"message": "order was edited successfully", "data": updated})
}
func (h *Handler) panelOrdersDelete(w http.ResponseWriter, r *http.Request) { h.deleteByBodyID(w, r, "orders", "order was deleted successfully") }

func (h *Handler) dashboard(w http.ResponseWriter, r *http.Request) {
	since := time.Now().UTC().Add(-24 * time.Hour)
	cols := []struct{ name, keyNew, keyTotal string }{{"users", "newUsersCount", "totalUsersCount"}, {"posts", "newNewsCount", "totalNewsCount"}, {"products", "newProductsCount", "totalProductsCount"}, {"messages", "newMessagesCount", "totalMessagesCount"}, {"orders", "newOrdersCount", "totalOrdersCount"}}
	out := bson.M{}
	for _, c := range cols {
		col := h.store.DB.Collection(c.name)
		total, err := col.CountDocuments(r.Context(), bson.M{}); if err != nil { writeError(w, 500, "could not load dashboard"); return }
		fresh, err := col.CountDocuments(r.Context(), bson.M{"createdAt": bson.M{"$gte": since}}); if err != nil { writeError(w, 500, "could not load dashboard"); return }
		out[c.keyNew] = fresh; out[c.keyTotal] = total
	}
	writeJSON(w, 200, out)
}

func (h *Handler) createPayPalOrder(w http.ResponseWriter, r *http.Request) {
	if h.paypal == nil || !h.paypal.Enabled() { writeError(w, 503, "PayPal is not configured"); return }
	var req struct { LocalOrderID string `json:"localOrderId"` }
	if err := decodeJSON(r, &req); err != nil { writeError(w, 400, "invalid request body"); return }
	id, err := objectID(req.LocalOrderID); if err != nil { writeError(w, 400, "Order Not Found"); return }
	orders := h.store.DB.Collection("orders")
	var o struct { ID primitive.ObjectID `bson:"_id"`; Status string `bson:"status"`; TotalPrice float64 `bson:"totalPrice"` }
	if err := orders.FindOne(r.Context(), bson.M{"_id": id}, options.FindOne().SetProjection(bson.M{"status": 1, "totalPrice": 1})).Decode(&o); err != nil { writeError(w, 400, "Order Not Found"); return }
	if o.Status != "CREATED" { writeError(w, 409, "order has been canceled or already paid"); return }
	pp, err := h.paypal.CreateOrder(r.Context(), o.TotalPrice)
	if err != nil { h.logger.Printf("paypal create failed order=%s err=%v", id.Hex(), err); writeError(w, 502, "payment provider error"); return }
	_, err = orders.UpdateByID(r.Context(), id, bson.M{"$set": bson.M{"paypalId": toString(pp["id"]), "status": toString(pp["status"]), "updatedAt": time.Now().UTC()}})
	if err != nil { writeError(w, 500, "could not update order"); return }
	writeJSON(w, 200, pp)
}

func (h *Handler) capturePayPalOrder(w http.ResponseWriter, r *http.Request) {
	if h.paypal == nil || !h.paypal.Enabled() { writeError(w, 503, "PayPal is not configured"); return }
	orderID := strings.TrimSpace(r.PathValue("orderID")); if orderID == "" { writeError(w, 400, "invalid payment order"); return }
	orders := h.store.DB.Collection("orders")
	var existing struct { ID primitive.ObjectID `bson:"_id"`; Status string `bson:"status"`; TransactionInfo any `bson:"transactionInfo,omitempty"` }
	if err := orders.FindOne(r.Context(), bson.M{"paypalId": orderID}, options.FindOne().SetProjection(bson.M{"status": 1, "transactionInfo": 1})).Decode(&existing); err != nil { writeError(w, 404, "Order Not Found"); return }
	if existing.Status == "COMPLETED" { writeJSON(w, 200, existing.TransactionInfo); return }
	pp, err := h.paypal.CaptureOrder(r.Context(), orderID)
	if err != nil { h.logger.Printf("paypal capture failed paypal_id=%s err=%v", orderID, err); writeError(w, 502, "payment provider error"); return }
	_, err = orders.UpdateOne(r.Context(), bson.M{"_id": existing.ID, "paypalId": orderID}, bson.M{"$set": bson.M{"status": toString(pp["status"]), "transactionInfo": pp, "updatedAt": time.Now().UTC()}})
	if err != nil { writeError(w, 500, "could not update order"); return }
	writeJSON(w, 200, pp)
}

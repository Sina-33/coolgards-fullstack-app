package httpapi

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) productsList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := bson.M{}
	if v := q.Get("title"); v != "" {
		filter["title"] = regexFilter(v)
	}
	if v := q.Get("price"); v != "" {
		if n, err := strconv.ParseFloat(v, 64); err == nil {
			filter["price"] = n
		}
	}
	data, total, err := listMaps(r, h.store.DB.Collection("products"), filter, bson.M{}, bson.D{{Key: "price", Value: -1}})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not load products")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": total})
}

func (h *Handler) productBySlug(w http.ResponseWriter, r *http.Request) {
	var product domain.Product
	err := h.store.DB.Collection("products").FindOne(r.Context(), bson.M{"slug": r.PathValue("slug")}).Decode(&product)
	if err != nil {
		status, msg := mongoErrorStatus(err)
		writeError(w, status, msg)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": product})
}

func (h *Handler) panelProductsList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := bson.M{}
	for _, field := range []string{"title", "content"} {
		if v := q.Get(field); v != "" {
			filter[field] = regexFilter(v)
		}
	}
	if v := q.Get("status"); v != "" { filter["status"] = v }
	if v := q.Get("tags"); v != "" { filter["tags"] = v }
	if v := q.Get("price"); v != "" {
		if n, err := strconv.ParseFloat(v, 64); err == nil { filter["price"] = n }
	}
	data, total, err := listMaps(r, h.store.DB.Collection("products"), filter, bson.M{}, bson.D{{Key: "_id", Value: -1}})
	if err != nil { writeError(w, http.StatusInternalServerError, "could not load products"); return }
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": total})
}

func validateProduct(p *domain.Product) error {
	p.Title = strings.TrimSpace(p.Title)
	p.Slug = strings.ToLower(strings.TrimSpace(p.Slug))
	p.Content = strings.TrimSpace(p.Content)
	p.Status = strings.TrimSpace(p.Status)
	if p.Title == "" || p.Slug == "" || p.Content == "" || p.Status == "" || len(p.ImageURLs) == 0 {
		return errors.New("title, slug, content, imageUrls and status are required")
	}
	if p.Price < 0 { return errors.New("price cannot be negative") }
	return nil
}

func (h *Handler) panelProductsCreate(w http.ResponseWriter, r *http.Request) {
	var product domain.Product
	if err := decodeJSON(r, &product); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	if err := validateProduct(&product); err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	now := time.Now().UTC()
	product.ID = primitive.NewObjectID()
	product.CreatedAt, product.UpdatedAt = now, now
	_, err := h.store.DB.Collection("products").InsertOne(r.Context(), product)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, http.StatusCreated, map[string]any{"message": "product was added successfully", "data": product})
}

func (h *Handler) panelProductsUpdate(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	id, err := bodyID(body)
	if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	allowed := map[string]bool{"title": true, "slug": true, "content": true, "imageUrls": true, "status": true, "tags": true, "price": true}
	set := sanitizeUpdate(body, allowed)
	if raw, ok := set["slug"]; ok { set["slug"] = strings.ToLower(strings.TrimSpace(toString(raw))) }
	updated, err := updateByID(r, h.store.DB.Collection("products"), id, set)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, http.StatusOK, map[string]any{"message": "product was edited successfully", "data": updated})
}

func (h *Handler) panelProductsDelete(w http.ResponseWriter, r *http.Request) { h.deleteByBodyID(w, r, "products", "Product was deleted successfully") }

func (h *Handler) postsList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := bson.M{"status": "published"}
	if v := q.Get("title"); v != "" { filter["title"] = regexFilter(v) }
	if v := q.Get("content"); v != "" { filter["content"] = regexFilter(v) }
	if v := q.Get("tags"); v != "" { filter["tags"] = v }
	projection := bson.M{"content": 0, "status": 0}
	data, total, err := listMaps(r, h.store.DB.Collection("posts"), filter, projection, bson.D{{Key: "_id", Value: -1}})
	if err != nil { writeError(w, http.StatusInternalServerError, "could not load posts"); return }
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": total})
}

func (h *Handler) postBySlug(w http.ResponseWriter, r *http.Request) {
	var post domain.Post
	err := h.store.DB.Collection("posts").FindOne(r.Context(), bson.M{"slug": r.PathValue("slug"), "status": "published"}).Decode(&post)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, http.StatusOK, map[string]any{"data": post})
}

func (h *Handler) panelPostsList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := bson.M{}
	for _, field := range []string{"title", "content"} { if v := q.Get(field); v != "" { filter[field] = regexFilter(v) } }
	if v := q.Get("status"); v != "" { filter["status"] = v }
	if v := q.Get("tags"); v != "" { filter["tags"] = v }
	data, total, err := listMaps(r, h.store.DB.Collection("posts"), filter, bson.M{}, bson.D{{Key: "_id", Value: -1}})
	if err != nil { writeError(w, http.StatusInternalServerError, "could not load posts"); return }
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": total})
}

func validatePost(p *domain.Post) error {
	p.Title = strings.TrimSpace(p.Title)
	p.Slug = strings.ToLower(strings.TrimSpace(p.Slug))
	p.Content = strings.TrimSpace(p.Content)
	p.ImageURL = strings.TrimSpace(p.ImageURL)
	p.Status = strings.TrimSpace(p.Status)
	if p.Title == "" || p.Slug == "" || p.Content == "" || p.ImageURL == "" || p.Status == "" { return errors.New("title, slug, imageUrl, content and status are required") }
	return nil
}

func (h *Handler) panelPostsCreate(w http.ResponseWriter, r *http.Request) {
	var post domain.Post
	if err := decodeJSON(r, &post); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	if err := validatePost(&post); err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	admin := currentUser(r).User
	now := time.Now().UTC()
	post.ID = primitive.NewObjectID()
	post.WriterID = admin.ID.Hex()
	post.WriterName = admin.FullName
	post.CreatedAt, post.UpdatedAt = now, now
	_, err := h.store.DB.Collection("posts").InsertOne(r.Context(), post)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, http.StatusCreated, map[string]any{"message": "post was added successfully", "data": post})
}

func (h *Handler) panelPostsUpdate(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	id, err := bodyID(body)
	if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	allowed := map[string]bool{"title": true, "slug": true, "imageUrl": true, "content": true, "tags": true, "status": true}
	set := sanitizeUpdate(body, allowed)
	if raw, ok := set["slug"]; ok { set["slug"] = strings.ToLower(strings.TrimSpace(toString(raw))) }
	updated, err := updateByID(r, h.store.DB.Collection("posts"), id, set)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, http.StatusOK, map[string]any{"message": "post was edited successfully", "data": updated})
}

func (h *Handler) panelPostsDelete(w http.ResponseWriter, r *http.Request) { h.deleteByBodyID(w, r, "posts", "Post was deleted successfully") }

func (h *Handler) shipmentsList(w http.ResponseWriter, r *http.Request) {
	filter := shipmentFilter(r)
	cursor, err := h.store.DB.Collection("shipments").Find(r.Context(), filter)
	if err != nil { writeError(w, http.StatusInternalServerError, "could not load shipments"); return }
	defer cursor.Close(r.Context())
	var data []domain.Shipment
	if err := cursor.All(r.Context(), &data); err != nil { writeError(w, http.StatusInternalServerError, "could not load shipments"); return }
	if data == nil { data = []domain.Shipment{} }
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": len(data)})
}

func shipmentFilter(r *http.Request) bson.M {
	q := r.URL.Query()
	filter := bson.M{}
	if v := q.Get("country"); v != "" { filter["country"] = regexFilter(v) }
	if v := q.Get("shipmentPrice"); v != "" { if n, err := strconv.ParseFloat(v, 64); err == nil { filter["shipmentPrice"] = n } }
	if v := q.Get("vat"); v != "" { if n, err := strconv.ParseFloat(v, 64); err == nil { filter["vat"] = n } }
	return filter
}

func (h *Handler) panelShipmentsList(w http.ResponseWriter, r *http.Request) {
	data, total, err := listMaps(r, h.store.DB.Collection("shipments"), shipmentFilter(r), bson.M{}, bson.D{{Key: "_id", Value: -1}})
	if err != nil { writeError(w, http.StatusInternalServerError, "could not load shipments"); return }
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": total})
}

func (h *Handler) panelShipmentsCreate(w http.ResponseWriter, r *http.Request) {
	var shipment domain.Shipment
	if err := decodeJSON(r, &shipment); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	shipment.Country = strings.TrimSpace(shipment.Country)
	if shipment.Country == "" || shipment.ShipmentPrice < 0 || shipment.VAT < 0 || shipment.VAT > 100 { writeError(w, http.StatusBadRequest, "valid country, shipmentPrice and vat are required"); return }
	now := time.Now().UTC()
	shipment.ID = primitive.NewObjectID()
	shipment.CreatedAt, shipment.UpdatedAt = now, now
	_, err := h.store.DB.Collection("shipments").InsertOne(r.Context(), shipment)
	if err != nil { writeError(w, http.StatusInternalServerError, "could not create shipment"); return }
	writeJSON(w, http.StatusCreated, map[string]any{"message": "Shipment was added successfully", "data": shipment})
}

func (h *Handler) panelShipmentsUpdate(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	id, err := bodyID(body)
	if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	set := sanitizeUpdate(body, map[string]bool{"country": true, "shipmentPrice": true, "vat": true})
	updated, err := updateByID(r, h.store.DB.Collection("shipments"), id, set)
	if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }
	writeJSON(w, http.StatusOK, map[string]any{"message": "Shipment was edited successfully", "data": updated})
}

func (h *Handler) panelShipmentsDelete(w http.ResponseWriter, r *http.Request) { h.deleteByBodyID(w, r, "shipments", "Shipment was deleted successfully") }

func (h *Handler) createMessage(w http.ResponseWriter, r *http.Request) {
	var message domain.Message
	if err := decodeJSON(r, &message); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	message.Email = normalizeEmail(message.Email)
	message.Subject = strings.TrimSpace(message.Subject)
	message.Content = strings.TrimSpace(message.Content)
	if !validEmail(message.Email) || message.Subject == "" || message.Content == "" { writeError(w, http.StatusBadRequest, "valid email, subject and content are required"); return }
	message.Status = "unread"
	now := time.Now().UTC()
	message.ID = primitive.NewObjectID()
	message.CreatedAt, message.UpdatedAt = now, now
	_, err := h.store.DB.Collection("messages").InsertOne(r.Context(), message)
	if err != nil { writeError(w, http.StatusInternalServerError, "could not save message"); return }
	writeJSON(w, http.StatusCreated, map[string]any{"message": "message was added successfully", "data": message})
}

func (h *Handler) panelMessagesList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	filter := bson.M{}
	for _, field := range []string{"name", "email", "phone", "subject", "content"} { if v := q.Get(field); v != "" { filter[field] = regexFilter(v) } }
	if v := q.Get("status"); v != "" { filter["status"] = v }
	data, total, err := listMaps(r, h.store.DB.Collection("messages"), filter, bson.M{}, bson.D{{Key: "_id", Value: -1}})
	if err != nil { writeError(w, http.StatusInternalServerError, "could not load messages"); return }
	writeJSON(w, http.StatusOK, map[string]any{"data": data, "total": total})
}

func (h *Handler) panelMessagesUpdate(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	id, err := bodyID(body)
	if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	status := strings.TrimSpace(toString(body["status"]))
	if status != "read" && status != "unread" { writeError(w, http.StatusBadRequest, "status must be read or unread"); return }
	updated, err := updateByID(r, h.store.DB.Collection("messages"), id, bson.M{"status": status, "updatedAt": time.Now().UTC()})
	if err != nil { statusCode, msg := mongoErrorStatus(err); writeError(w, statusCode, msg); return }
	writeJSON(w, http.StatusOK, map[string]any{"message": "message was edited successfully", "data": updated})
}

func (h *Handler) panelMessagesDelete(w http.ResponseWriter, r *http.Request) { h.deleteByBodyID(w, r, "messages", "Message was deleted successfully") }

func (h *Handler) deleteByBodyID(w http.ResponseWriter, r *http.Request, collection, message string) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	id, err := bodyID(body)
	if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	result, err := h.store.DB.Collection(collection).DeleteOne(r.Context(), bson.M{"_id": id})
	if err != nil { writeError(w, http.StatusInternalServerError, "could not delete resource"); return }
	if result.DeletedCount == 0 { writeError(w, http.StatusNotFound, "resource not found"); return }
	writeJSON(w, http.StatusOK, map[string]string{"message": message})
}

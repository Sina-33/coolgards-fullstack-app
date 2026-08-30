package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var allowedMediaTypes = map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true, "image/gif": true, "application/pdf": true}

func randomName(original string) string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	ext := strings.ToLower(filepath.Ext(original))
	return time.Now().UTC().Format("20060102T150405") + "-" + hex.EncodeToString(b) + ext
}

func savePart(dir string, f multipart.File, hdr *multipart.FileHeader) (string, int64, string, error) {
	sniff := make([]byte, 512)
	n, _ := io.ReadFull(f, sniff)
	sniff = sniff[:n]
	typ := http.DetectContentType(sniff)
	if !allowedMediaTypes[typ] { return "", 0, "", os.ErrInvalid }
	if _, err := f.Seek(0, io.SeekStart); err != nil { return "", 0, "", err }
	name := randomName(hdr.Filename)
	path := filepath.Join(dir, name)
	out, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o640)
	if err != nil { return "", 0, "", err }
	defer out.Close()
	written, err := io.Copy(out, io.LimitReader(f, 20<<20))
	if err != nil { _ = os.Remove(path); return "", 0, "", err }
	if written >= 20<<20 { _ = os.Remove(path); return "", 0, "", os.ErrInvalid }
	return name, written, typ, nil
}

func (h *Handler) uploadMedia(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(100 << 20); err != nil { writeError(w, 400, "invalid multipart upload"); return }
	files := r.MultipartForm.File["files"]
	if len(files) == 0 || len(files) > 10 { writeError(w, 400, "upload between 1 and 10 files"); return }
	if err := os.MkdirAll(h.cfg.MediaDir, 0o750); err != nil { writeError(w, 500, "media storage unavailable"); return }
	u := currentUser(r)
	resp := make([]bson.M, 0, len(files))
	inserted := make([]primitive.ObjectID, 0, len(files))
	saved := make([]string, 0, len(files))
	now := time.Now().UTC()
	rollback := func() { for _, p := range saved { _ = os.Remove(p) }; if len(inserted) > 0 { _, _ = h.store.DB.Collection("files").DeleteMany(r.Context(), bson.M{"_id": bson.M{"$in": inserted}}) } }
	for _, hdr := range files {
		f, err := hdr.Open(); if err != nil { rollback(); writeError(w, 400, "could not read upload"); return }
		name, size, mime, err := savePart(h.cfg.MediaDir, f, hdr); _ = f.Close()
		if err != nil { rollback(); writeError(w, 400, "unsupported or oversized file"); return }
		disk := filepath.Join(h.cfg.MediaDir, name); saved = append(saved, disk)
		rec := domain.FileRecord{ID: primitive.NewObjectID(), Name: hdr.Filename, MIMEType: mime, Path: "/api/media/" + name, Size: size, Category: r.FormValue("category"), User: u.User.ID.Hex(), Order: r.FormValue("order"), Product: r.FormValue("product"), CreatedAt: now, UpdatedAt: now}
		if _, err := h.store.DB.Collection("files").InsertOne(r.Context(), rec); err != nil { rollback(); writeError(w, 500, "could not store upload metadata"); return }
		inserted = append(inserted, rec.ID); resp = append(resp, bson.M{"_id": rec.ID, "name": name, "path": rec.Path})
	}
	writeJSON(w, 201, resp)
}

func (h *Handler) mediaList(w http.ResponseWriter, r *http.Request) {
	filter := bson.M{}
	if c := strings.TrimSpace(r.URL.Query().Get("category")); c != "" { filter["category"] = c }
	data, total, err := listMaps(r, h.store.DB.Collection("files"), filter, nil, bson.D{{Key: "createdAt", Value: -1}})
	if err != nil { writeError(w, 500, "could not load media"); return }
	writeJSON(w, 200, map[string]any{"data": data, "total": total})
}

func (h *Handler) mediaDelete(w http.ResponseWriter, r *http.Request) {
	var body bson.M
	if err := decodeJSON(r, &body); err != nil { writeError(w, 400, "invalid request body"); return }
	id, err := bodyID(body); if err != nil { writeError(w, 400, err.Error()); return }
	var rec domain.FileRecord
	if err := h.store.DB.Collection("files").FindOne(r.Context(), bson.M{"_id": id}).Decode(&rec); err != nil { writeError(w, 404, "media not found"); return }
	name := filepath.Base(strings.TrimPrefix(rec.Path, "/api/media/"))
	if name == "." || name == "/" || strings.Contains(name, "..") { writeError(w, 400, "invalid media path"); return }
	if err := os.Remove(filepath.Join(h.cfg.MediaDir, name)); err != nil && !os.IsNotExist(err) { writeError(w, 500, "could not remove media file"); return }
	if _, err = h.store.DB.Collection("files").DeleteOne(r.Context(), bson.M{"_id": id}); err != nil { writeError(w, 500, "could not remove media record"); return }
	writeJSON(w, 200, map[string]string{"message": "Image was deleted successfully"})
}

func (h *Handler) serveMedia(w http.ResponseWriter, r *http.Request) {
	name := filepath.Base(r.PathValue("name"))
	if name == "." || name == "/" || strings.Contains(name, "..") { http.NotFound(w, r); return }
	path := filepath.Join(h.cfg.MediaDir, name)
	f, err := os.Open(path); if err != nil { http.NotFound(w, r); return }
	defer f.Close()
	stat, err := f.Stat(); if err != nil || stat.IsDir() { http.NotFound(w, r); return }
	w.Header().Set("Cache-Control", "public, max-age=86400")
	http.ServeContent(w, r, name, stat.ModTime(), f)
}

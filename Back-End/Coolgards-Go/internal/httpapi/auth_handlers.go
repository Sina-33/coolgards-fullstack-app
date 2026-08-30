package httpapi

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/auth"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/domain"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/password"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type signupRequest struct {
	FullName string `json:"fullName"`
	Email string `json:"email"`
	Password string `json:"password"`
	Country string `json:"country"`
	City string `json:"city"`
	Address string `json:"address"`
	PostalCode string `json:"postalCode"`
	MobilePhone string `json:"mobilePhone"`
}

type loginRequest struct { Email string `json:"email"`; Password string `json:"password"` }

func (h *Handler) signup(w http.ResponseWriter, r *http.Request) {
	var req signupRequest
	if err := decodeJSON(r, &req); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	req.Email = normalizeEmail(req.Email)
	if !validEmail(req.Email) { writeError(w, http.StatusBadRequest, "Email is invalid"); return }
	hash, err := password.Hash(req.Password); if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	now := time.Now().UTC()
	user := domain.User{ID: primitive.NewObjectID(), FullName: strings.TrimSpace(req.FullName), Email: req.Email, Roles: []string{"customer"}, Password: hash, Country: strings.TrimSpace(req.Country), City: strings.TrimSpace(req.City), Address: strings.TrimSpace(req.Address), PostalCode: strings.TrimSpace(req.PostalCode), MobilePhone: strings.TrimSpace(req.MobilePhone), CreatedAt: now, UpdatedAt: now}
	token, session, err := h.newSession(user.ID, r.UserAgent()); if err != nil { writeError(w, http.StatusInternalServerError, "could not create session"); return }
	user.Sessions = []domain.Session{session}
	if _, err := h.store.DB.Collection("users").InsertOne(r.Context(), user); err != nil { if mongo.IsDuplicateKeyError(err) { writeError(w, http.StatusConflict, "this email already exists"); return }; writeError(w, http.StatusInternalServerError, "could not create user"); return }
	h.setSessionCookie(w, token); writeJSON(w, http.StatusCreated, map[string]any{"data": user, "message": "welcome to coolgards ;)"})
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := decodeJSON(r, &req); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	req.Email = normalizeEmail(req.Email); var user domain.User
	if err := h.store.DB.Collection("users").FindOne(r.Context(), bson.M{"email": req.Email}).Decode(&user); err != nil || !password.Compare(user.Password, req.Password) { writeError(w, http.StatusUnauthorized, "wrong username or password!"); return }
	token, session, err := h.newSession(user.ID, r.UserAgent()); if err != nil { writeError(w, http.StatusInternalServerError, "could not create session"); return }
	_, err = h.store.DB.Collection("users").UpdateByID(r.Context(), user.ID, bson.M{"$push": bson.M{"sessions": session}, "$set": bson.M{"updatedAt": time.Now().UTC()}}); if err != nil { writeError(w, http.StatusInternalServerError, "could not create session"); return }
	user.Sessions = nil; h.setSessionCookie(w, token); writeJSON(w, http.StatusOK, map[string]any{"data": user, "message": "welcome back ;)"})
}

func (h *Handler) logout(w http.ResponseWriter, r *http.Request) { current := currentUser(r); _, err := h.store.DB.Collection("users").UpdateByID(r.Context(), current.User.ID, bson.M{"$pull": bson.M{"sessions": bson.M{"tokenHash": auth.HashToken(current.Token)}}, "$set": bson.M{"updatedAt": time.Now().UTC()}}); if err != nil { writeError(w, http.StatusInternalServerError, "could not log out"); return }; h.clearSessionCookie(w); writeJSON(w, http.StatusOK, map[string]string{"message": "You have successfully logged out"}) }
func (h *Handler) logoutAll(w http.ResponseWriter, r *http.Request) { current := currentUser(r); _, err := h.store.DB.Collection("users").UpdateByID(r.Context(), current.User.ID, bson.M{"$set": bson.M{"sessions": []domain.Session{}, "updatedAt": time.Now().UTC()}}); if err != nil { writeError(w, http.StatusInternalServerError, "could not log out sessions"); return }; h.clearSessionCookie(w); writeJSON(w, http.StatusOK, map[string]string{"message": "all sessions were logged out successfully"}) }
func (h *Handler) me(w http.ResponseWriter, r *http.Request) { writeJSON(w, http.StatusOK, map[string]any{"data": currentUser(r).User, "message": "profile info successfully retrieved"}) }

func (h *Handler) updateMe(w http.ResponseWriter, r *http.Request) {
	var body bson.M; if err := decodeJSON(r, &body); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	allowed := map[string]bool{"fullName": true, "email": true, "password": true, "country": true, "city": true, "address": true, "postalCode": true, "mobilePhone": true}; set := sanitizeUpdate(body, allowed)
	if raw, ok := set["email"]; ok { email := normalizeEmail(strings.TrimSpace(toString(raw))); if !validEmail(email) { writeError(w, http.StatusBadRequest, "Email is invalid"); return }; set["email"] = email }
	if raw, ok := set["password"]; ok { hash, err := password.Hash(toString(raw)); if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }; set["password"] = hash }
	updated, err := updateByID(r, h.store.DB.Collection("users"), currentUser(r).User.ID, set); if err != nil { status, msg := mongoErrorStatus(err); writeError(w, status, msg); return }; stripUserSecrets(updated); writeJSON(w, http.StatusOK, map[string]any{"data": updated, "message": "profile updated successfully"})
}

func (h *Handler) forgot(w http.ResponseWriter, r *http.Request) {
	var req struct { Email string `json:"email"` }; if err := decodeJSON(r, &req); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	email := normalizeEmail(req.Email); generic := map[string]any{"message": "If an account exists for this email, a reset link has been sent."}; if !validEmail(email) { writeJSON(w, http.StatusOK, generic); return }
	var user domain.User; if err := h.store.DB.Collection("users").FindOne(r.Context(), bson.M{"email": email}).Decode(&user); err != nil { writeJSON(w, http.StatusOK, generic); return }
	plain, hash, err := auth.RandomResetToken(); if err != nil { writeError(w, http.StatusInternalServerError, "could not create reset request"); return }; expires := time.Now().UTC().Add(30*time.Minute)
	_, err = h.store.DB.Collection("users").UpdateByID(r.Context(), user.ID, bson.M{"$set": bson.M{"resetCodeHash": hash, "resetExpiresAt": expires, "updatedAt": time.Now().UTC()}}); if err != nil { writeError(w, http.StatusInternalServerError, "could not create reset request"); return }
	link := h.cfg.FrontendBaseURL + "/reset/" + user.ID.Hex() + "/" + plain
	if h.mailer.Enabled() { if err := h.mailer.SendReset(user.Email, link); err != nil { h.logger.Printf("password reset email failed user=%s error=%v", user.ID.Hex(), err) } } else if h.cfg.AppEnv == "development" { generic["debugResetLink"] = link }
	writeJSON(w, http.StatusOK, generic)
}

func (h *Handler) validateReset(w http.ResponseWriter, r *http.Request) { id, err := objectID(r.PathValue("id")); if err != nil { writeError(w, http.StatusBadRequest, "Sorry! Your reset link has expired"); return }; var user domain.User; err = h.store.DB.Collection("users").FindOne(r.Context(), bson.M{"_id": id, "resetCodeHash": auth.HashResetToken(r.PathValue("code")), "resetExpiresAt": bson.M{"$gt": time.Now().UTC()}}).Decode(&user); if err != nil { writeError(w, http.StatusBadRequest, "Sorry! Your reset link has expired"); return }; writeJSON(w, http.StatusOK, map[string]any{"data": map[string]string{"id": id.Hex(), "code": r.PathValue("code")}, "message": "Please enter your new password"}) }

func (h *Handler) resetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct { ID string `json:"id"`; Code string `json:"code"`; Password string `json:"password"` }; if err := decodeJSON(r, &req); err != nil { writeError(w, http.StatusBadRequest, "invalid request body"); return }
	id, err := objectID(req.ID); if err != nil { writeError(w, http.StatusBadRequest, "Sorry! Your reset link has expired"); return }; hash, err := password.Hash(req.Password); if err != nil { writeError(w, http.StatusBadRequest, err.Error()); return }
	result, err := h.store.DB.Collection("users").UpdateOne(r.Context(), bson.M{"_id": id, "resetCodeHash": auth.HashResetToken(req.Code), "resetExpiresAt": bson.M{"$gt": time.Now().UTC()}}, bson.M{"$set": bson.M{"password": hash, "sessions": []domain.Session{}, "updatedAt": time.Now().UTC()}, "$unset": bson.M{"resetCodeHash": "", "resetExpiresAt": ""}}); if err != nil || result.MatchedCount != 1 { writeError(w, http.StatusBadRequest, "Sorry! Your reset link has expired"); return }; h.clearSessionCookie(w); writeJSON(w, http.StatusOK, map[string]string{"message": "Your password was changed successfully"})
}

func (h *Handler) panelUsersList(w http.ResponseWriter, r *http.Request) { q := r.URL.Query(); filter := bson.M{}; if v := q.Get("email"); v != "" { filter["email"] = regexFilter(v) }; if v := q.Get("fullName"); v != "" { filter["fullName"] = regexFilter(v) }; if v := q.Get("roles"); v != "" { filter["roles"] = v }; data,total,err := listMaps(r,h.store.DB.Collection("users"),filter,bson.M{"password":0,"sessions":0,"resetCodeHash":0,"resetExpiresAt":0},bson.D{{Key:"_id",Value:-1}}); if err != nil { writeError(w,500,"could not load users"); return }; writeJSON(w,200,map[string]any{"data":data,"total":total}) }
func (h *Handler) panelUsersCreate(w http.ResponseWriter, r *http.Request) { var body bson.M; if err:=decodeJSON(r,&body);err!=nil{writeError(w,400,"invalid request body");return};email:=normalizeEmail(toString(body["email"]));if !validEmail(email){writeError(w,400,"Email is invalid");return};hash,err:=password.Hash(toString(body["password"]));if err!=nil{writeError(w,400,err.Error());return};roles:=toStringSlice(body["roles"]);if len(roles)==0{roles=[]string{"customer"}};now:=time.Now().UTC();user:=domain.User{ID:primitive.NewObjectID(),Email:email,FullName:strings.TrimSpace(toString(body["fullName"])),Roles:roles,Password:hash,Country:toString(body["country"]),City:toString(body["city"]),Address:toString(body["address"]),PostalCode:toString(body["postalCode"]),MobilePhone:toString(body["mobilePhone"]),CreatedAt:now,UpdatedAt:now};if _,err:=h.store.DB.Collection("users").InsertOne(r.Context(),user);err!=nil{status,msg:=mongoErrorStatus(err);writeError(w,status,msg);return};writeJSON(w,201,map[string]any{"message":"user was created successfully","data":user}) }
func (h *Handler) panelUsersUpdate(w http.ResponseWriter,r *http.Request){var body bson.M;if err:=decodeJSON(r,&body);err!=nil{writeError(w,400,"invalid request body");return};id,err:=bodyID(body);if err!=nil{writeError(w,400,err.Error());return};set:=sanitizeUpdate(body,map[string]bool{"fullName":true,"email":true,"password":true,"roles":true,"country":true,"city":true,"address":true,"postalCode":true,"mobilePhone":true});if raw,ok:=set["email"];ok{email:=normalizeEmail(toString(raw));if !validEmail(email){writeError(w,400,"Email is invalid");return};set["email"]=email};if raw,ok:=set["password"];ok{if strings.TrimSpace(toString(raw))==""{delete(set,"password")}else{hash,err:=password.Hash(toString(raw));if err!=nil{writeError(w,400,err.Error());return};set["password"]=hash}};updated,err:=updateByID(r,h.store.DB.Collection("users"),id,set);if err!=nil{status,msg:=mongoErrorStatus(err);writeError(w,status,msg);return};stripUserSecrets(updated);writeJSON(w,200,map[string]any{"message":"user was edited successfully","data":updated})}
func (h *Handler) panelUsersDelete(w http.ResponseWriter,r *http.Request){var body bson.M;if err:=decodeJSON(r,&body);err!=nil{writeError(w,400,"invalid request body");return};id,err:=bodyID(body);if err!=nil{writeError(w,400,err.Error());return};if id==currentUser(r).User.ID{writeError(w,400,"you cannot delete your currently authenticated admin account");return};result,err:=h.store.DB.Collection("users").DeleteOne(r.Context(),bson.M{"_id":id});if err!=nil{writeError(w,500,"could not delete user");return};if result.DeletedCount==0{writeError(w,404,"user not found");return};writeJSON(w,200,map[string]string{"message":"user was deleted successfully"})}
func(h *Handler)newSession(id primitive.ObjectID,userAgent string)(string,domain.Session,error){token,err:=h.tokens.Sign(id.Hex());if err!=nil{return "",domain.Session{},err};return token,domain.Session{TokenHash:auth.HashToken(token),UserAgent:userAgent,CreatedAt:time.Now().UTC()},nil}
func(h *Handler)setSessionCookie(w http.ResponseWriter,token string){http.SetCookie(w,&http.Cookie{Name:cookieName,Value:token,Path:"/",HttpOnly:true,Secure:h.cfg.CookieSecure,SameSite:http.SameSiteLaxMode,MaxAge:int((7*24*time.Hour).Seconds()),Expires:time.Now().Add(7*24*time.Hour)})}
func(h *Handler)clearSessionCookie(w http.ResponseWriter){http.SetCookie(w,&http.Cookie{Name:cookieName,Value:"",Path:"/",HttpOnly:true,Secure:h.cfg.CookieSecure,SameSite:http.SameSiteLaxMode,MaxAge:-1,Expires:time.Unix(1,0)})}
func stripUserSecrets(m bson.M){delete(m,"password");delete(m,"sessions");delete(m,"resetCodeHash");delete(m,"resetExpiresAt");delete(m,"tokens");delete(m,"resetCode")}
func toString(v any)string{switch x:=v.(type){case nil:return "";case string:return x;case primitive.ObjectID:return x.Hex();default:return fmt.Sprint(v)}}
func toStringSlice(v any)[]string{switch x:=v.(type){case []string:return x;case primitive.A:out:=make([]string,0,len(x));for _,item:=range x{if s:=strings.TrimSpace(toString(item));s!=""{out=append(out,s)}};return out;case []any:out:=make([]string,0,len(x));for _,item:=range x{if s:=strings.TrimSpace(toString(item));s!=""{out=append(out,s)}};return out;case string:if strings.TrimSpace(x)==""{return nil};return []string{x};default:return nil}}

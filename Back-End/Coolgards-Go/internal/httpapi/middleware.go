package httpapi

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"net"
	"net/http"
	"runtime/debug"
	"strings"
	"sync"
	"time"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/auth"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
)
type contextKey string
const userContextKey contextKey="authenticated-user"
type rateBucket struct{count int;reset time.Time}
type rateLimiter struct{mu sync.Mutex;limit int;window time.Duration;items map[string]rateBucket;lastCleanup time.Time}
func newRateLimiter(limit int,window time.Duration)*rateLimiter{return &rateLimiter{limit:limit,window:window,items:make(map[string]rateBucket),lastCleanup:time.Now()}}
func(l *rateLimiter)allow(key string)bool{now:=time.Now();l.mu.Lock();defer l.mu.Unlock();if now.Sub(l.lastCleanup)>l.window{for k,b:=range l.items{if now.After(b.reset){delete(l.items,k)}};l.lastCleanup=now};bucket,ok:=l.items[key];if !ok||now.After(bucket.reset){l.items[key]=rateBucket{count:1,reset:now.Add(l.window)};return true};if bucket.count>=l.limit{return false};bucket.count++;l.items[key]=bucket;return true}
func(h *Handler)middleware(next http.Handler)http.Handler{return h.recoverer(h.requestID(h.securityHeaders(h.cors(h.limitBody(h.logging(h.globalRateLimit(next)))))))}
func(h *Handler)recoverer(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){defer func(){if rec:=recover();rec!=nil{h.logger.Printf("panic request_id=%s method=%s path=%s error=%v stack=%s",requestIDFrom(r.Context()),r.Method,r.URL.Path,rec,debug.Stack());writeError(w,http.StatusInternalServerError,"internal server error")}}();next.ServeHTTP(w,r)})}
func(h *Handler)requestID(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){b:=make([]byte,12);_,_=rand.Read(b);id:=hex.EncodeToString(b);w.Header().Set("X-Request-ID",id);next.ServeHTTP(w,r.WithContext(context.WithValue(r.Context(),contextKey("request-id"),id)))})}
func requestIDFrom(ctx context.Context)string{if v,ok:=ctx.Value(contextKey("request-id")).(string);ok{return v};return ""}
func(h *Handler)securityHeaders(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){w.Header().Set("X-Content-Type-Options","nosniff");w.Header().Set("X-Frame-Options","DENY");w.Header().Set("Referrer-Policy","strict-origin-when-cross-origin");w.Header().Set("Permissions-Policy","camera=(), microphone=(), geolocation=()");next.ServeHTTP(w,r)})}
func(h *Handler)cors(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){origin:=r.Header.Get("Origin");if origin!=""&&h.allowedOrigins[origin]{w.Header().Set("Access-Control-Allow-Origin",origin);w.Header().Set("Vary","Origin");w.Header().Set("Access-Control-Allow-Credentials","true");w.Header().Set("Access-Control-Allow-Methods","GET, POST, DELETE, PUT, PATCH, OPTIONS");w.Header().Set("Access-Control-Allow-Headers","Origin, Content-Type, Accept, Authorization, X-Requested-With")};if r.Method==http.MethodOptions{if origin!=""&&!h.allowedOrigins[origin]{writeError(w,http.StatusForbidden,"origin is not allowed");return};w.WriteHeader(http.StatusNoContent);return};next.ServeHTTP(w,r)})}
func(h *Handler)limitBody(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){limit:=int64(2<<20);if r.Method==http.MethodPost&&r.URL.Path=="/media"{limit=100<<20};r.Body=http.MaxBytesReader(w,r.Body,limit);next.ServeHTTP(w,r)})}
type statusWriter struct{http.ResponseWriter;status int}
func(w *statusWriter)WriteHeader(code int){w.status=code;w.ResponseWriter.WriteHeader(code)}
func(h *Handler)logging(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){start:=time.Now();sw:=&statusWriter{ResponseWriter:w,status:http.StatusOK};next.ServeHTTP(sw,r);h.logger.Printf("request id=%s method=%s path=%s status=%d duration=%s",requestIDFrom(r.Context()),r.Method,r.URL.Path,sw.status,time.Since(start).Round(time.Millisecond))})}
func(h *Handler)globalRateLimit(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){if !h.globalLimiter.allow(clientIP(r)){writeError(w,http.StatusTooManyRequests,"too many requests");return};next.ServeHTTP(w,r)})}
func(h *Handler)authRateLimit(next http.HandlerFunc)http.HandlerFunc{return func(w http.ResponseWriter,r *http.Request){if !h.authLimiter.allow(clientIP(r)){writeError(w,http.StatusTooManyRequests,"too many authentication attempts");return};next(w,r)}}
func clientIP(r *http.Request)string{host,_,err:=net.SplitHostPort(r.RemoteAddr);if err==nil{return host};return r.RemoteAddr}
func(h *Handler)requireAuth(next http.HandlerFunc)http.HandlerFunc{return func(w http.ResponseWriter,r *http.Request){token:="";if cookie,err:=r.Cookie(cookieName);err==nil{token=cookie.Value};if token==""{authz:=r.Header.Get("Authorization");if strings.HasPrefix(authz,"Bearer "){token=strings.TrimSpace(strings.TrimPrefix(authz,"Bearer "))}};if token==""{writeError(w,http.StatusUnauthorized,"Please authenticate.");return};claims,err:=h.tokens.Verify(token);if err!=nil{writeError(w,http.StatusUnauthorized,"Please authenticate.");return};id,err:=objectID(claims.Subject);if err!=nil{writeError(w,http.StatusUnauthorized,"Please authenticate.");return};var user domain.User;err=h.store.DB.Collection("users").FindOne(r.Context(),bson.M{"_id":id,"sessions.tokenHash":auth.HashToken(token)}).Decode(&user);if err!=nil{writeError(w,http.StatusUnauthorized,"token has expired");return};ctx:=context.WithValue(r.Context(),userContextKey,&authenticatedUser{User:user,Token:token});next(w,r.WithContext(ctx))}}
func(h *Handler)requireAdmin(next http.HandlerFunc)http.HandlerFunc{return h.requireAuth(func(w http.ResponseWriter,r *http.Request){u:=currentUser(r);if u==nil||!containsString(u.User.Roles,"admin"){writeError(w,http.StatusForbidden,"you don't have privileges");return};next(w,r)})}
type authenticatedUser struct{User domain.User;Token string}
func currentUser(r *http.Request)*authenticatedUser{u,_:=r.Context().Value(userContextKey).(*authenticatedUser);return u}
func newLogger()*log.Logger{return log.Default()}

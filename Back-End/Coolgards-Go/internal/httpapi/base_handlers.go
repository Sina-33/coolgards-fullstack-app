package httpapi

import("net/http";"time")
func(h *Handler)root(w http.ResponseWriter,_ *http.Request){writeJSON(w,http.StatusOK,map[string]string{"message":"Coolgards Go API"})}
func(h *Handler)health(w http.ResponseWriter,r *http.Request){ctx,cancel:=contextWithTimeout(r,2*time.Second);defer cancel();if err:=h.store.Ping(ctx);err!=nil{writeJSON(w,http.StatusServiceUnavailable,map[string]string{"status":"degraded","database":"unavailable"});return};writeJSON(w,http.StatusOK,map[string]string{"status":"ok","database":"ok"})}

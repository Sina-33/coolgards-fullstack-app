package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type Claims struct {
	Subject   string `json:"sub"`
	IssuedAt  int64  `json:"iat"`
	ExpiresAt int64  `json:"exp"`
	ID        string `json:"jti"`
}

type Manager struct { secret []byte; ttl time.Duration }
func NewManager(secret string, ttl time.Duration) *Manager { return &Manager{secret: []byte(secret), ttl: ttl} }
func (m *Manager) Sign(subject string) (string, error) {
	if strings.TrimSpace(subject)=="" { return "", errors.New("empty subject") }
	now:=time.Now().UTC(); jti,err:=randomHex(16); if err!=nil{return "",err}
	header,_:=json.Marshal(map[string]string{"alg":"HS256","typ":"JWT"}); claims,_:=json.Marshal(Claims{Subject:subject,IssuedAt:now.Unix(),ExpiresAt:now.Add(m.ttl).Unix(),ID:jti})
	unsigned:=base64.RawURLEncoding.EncodeToString(header)+"."+base64.RawURLEncoding.EncodeToString(claims); mac:=hmac.New(sha256.New,m.secret); _,_=mac.Write([]byte(unsigned)); return unsigned+"."+base64.RawURLEncoding.EncodeToString(mac.Sum(nil)),nil
}
func (m *Manager) Verify(token string) (Claims,error) {
	parts:=strings.Split(token,"."); if len(parts)!=3{return Claims{},errors.New("invalid token format")}; unsigned:=parts[0]+"."+parts[1]; mac:=hmac.New(sha256.New,m.secret);_,_=mac.Write([]byte(unsigned));actual,err:=base64.RawURLEncoding.DecodeString(parts[2]);if err!=nil||!hmac.Equal(mac.Sum(nil),actual){return Claims{},errors.New("invalid token signature")};payload,err:=base64.RawURLEncoding.DecodeString(parts[1]);if err!=nil{return Claims{},errors.New("invalid token payload")};var claims Claims;if err:=json.Unmarshal(payload,&claims);err!=nil{return Claims{},errors.New("invalid token claims")};if claims.Subject==""||claims.ExpiresAt==0{return Claims{},errors.New("incomplete token claims")};if time.Now().UTC().Unix()>=claims.ExpiresAt{return Claims{},errors.New("token expired")};return claims,nil
}
func HashToken(token string) string { sum:=sha256.Sum256([]byte(token)); return hex.EncodeToString(sum[:]) }
func RandomResetToken()(plain,hash string,err error){b:=make([]byte,32);if _,err=rand.Read(b);err!=nil{return "","",err};plain=base64.RawURLEncoding.EncodeToString(b);sum:=sha256.Sum256([]byte(plain));return plain,hex.EncodeToString(sum[:]),nil}
func HashResetToken(token string) string { sum:=sha256.Sum256([]byte(token)); return hex.EncodeToString(sum[:]) }
func randomHex(bytes int)(string,error){b:=make([]byte,bytes);if _,err:=rand.Read(b);err!=nil{return "",fmt.Errorf("random token: %w",err)};return hex.EncodeToString(b),nil}
func ParsePositiveInt(v string,fallback int) int {n,err:=strconv.Atoi(v);if err!=nil||n<1{return fallback};return n}

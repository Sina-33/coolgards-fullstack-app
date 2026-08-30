package auth

import (
	"testing"
	"time"
)

func TestSignAndVerify(t *testing.T) {
	m := NewManager("01234567890123456789012345678901", time.Hour)
	token, err := m.Sign("507f1f77bcf86cd799439011")
	if err != nil { t.Fatal(err) }
	claims, err := m.Verify(token)
	if err != nil { t.Fatal(err) }
	if claims.Subject != "507f1f77bcf86cd799439011" { t.Fatalf("unexpected subject: %s", claims.Subject) }
}
func TestRejectsTamperedToken(t *testing.T) {
	m := NewManager("01234567890123456789012345678901", time.Hour)
	token, err := m.Sign("abc")
	if err != nil { t.Fatal(err) }
	token = token[:len(token)-1] + "x"
	if _, err := m.Verify(token); err == nil { t.Fatal("expected tampered token to be rejected") }
}

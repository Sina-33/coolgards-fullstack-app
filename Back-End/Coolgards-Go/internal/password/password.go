package password

import (
	"errors"
	"strings"
	"golang.org/x/crypto/bcrypt"
)
const cost = 12
func Validate(value string) error { if len(value)<8{return errors.New("password must be at least 8 characters")};if len(value)>128{return errors.New("password must be at most 128 characters")};if strings.Contains(strings.ToLower(value),"password"){return errors.New(`password cannot contain "password"`)};return nil }
func Hash(value string)(string,error){if err:=Validate(value);err!=nil{return "",err};hash,err:=bcrypt.GenerateFromPassword([]byte(value),cost);return string(hash),err}
func Compare(hash,value string) bool{return bcrypt.CompareHashAndPassword([]byte(hash),[]byte(value))==nil}

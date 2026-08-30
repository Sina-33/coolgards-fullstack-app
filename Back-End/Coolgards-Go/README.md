# Coolgards Go Backend

Production-oriented Go replacement for the original Express backend. It intentionally preserves the existing Next.js API contract so the original front end can be used without a rewrite.

## Stack
- Go 1.23 standard `net/http` router
- MongoDB official Go driver
- bcrypt password hashing
- HMAC-SHA256 JWT sessions with server-side session revocation
- PayPal checkout/capture
- multipart media uploads with MIME/size validation
- SMTP password reset with expiring single-use tokens

## Security / reliability
- HTTP-only session cookies; optional Secure flag
- only hashed session tokens stored in MongoDB
- no account enumeration in forgot-password responses
- rate limiting for global and auth traffic
- body limits and upload allow-list
- CORS allow-list with credentials
- security headers, request IDs, recovery middleware and access logging
- database indexes and unique constraints
- graceful shutdown plus read/write/header/idle timeouts
- order totals recalculated from database product/shipping records
- PayPal calls use bounded timeouts and non-2xx validation

## Run
```bash
cp .env.example .env
# set SECRET and DB_ADDRESS
go run ./cmd/api
```

Tests:
```bash
go test ./...
go vet ./...
```

The browser continues to call `/api/...`; the existing Next.js rewrite forwards that to this service's root API paths.

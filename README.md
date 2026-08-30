# Coolgards Full-Stack Application — Go Backend Edition

A full-stack e-commerce application with the original Next.js/React interface and a production-oriented Go backend. This edition is a backend migration of the original Coolgards Express/MongoDB project: the browser-facing API contract is intentionally preserved while the server implementation is redesigned in Go.

## Architecture

```text
Browser
  │
  ▼
Next.js 13 / React 18
  │  /api/* rewrite
  ▼
Go 1.23 REST API (net/http)
  ├── MongoDB
  ├── JWT + server-side session revocation
  ├── bcrypt password hashing
  ├── media upload service
  ├── SMTP password reset
  └── PayPal checkout/capture
```

## Backend engineering highlights

- Go 1.23 `net/http` API with explicit middleware and typed domain models
- MongoDB official Go driver with indexes and unique constraints
- secure HTTP-only cookie authentication plus Bearer-token compatibility
- JWT expiry plus server-side session revocation; only token hashes are stored
- role-based admin authorization
- bcrypt password hashing and expiring single-use password-reset tokens
- rate limiting, request-size limits, panic recovery, request IDs, logging and security headers
- strict CORS allow-list with credential support
- graceful shutdown and bounded server/client timeouts
- order totals recalculated from database records instead of trusting browser prices
- validated multipart uploads with MIME allow-list, random server filenames and size caps
- PayPal integration with provider error handling and request timeouts
- health endpoint, Docker support and GitHub Actions CI (`gofmt`, `go vet`, race-enabled tests, build)

## Project structure

```text
.
├── Back-End/Coolgards-Go/
│   ├── cmd/api/                 # application entry point
│   ├── internal/
│   │   ├── auth/                # JWT + secure token hashing
│   │   ├── commerce/            # trusted order calculations
│   │   ├── config/              # environment configuration
│   │   ├── domain/              # typed MongoDB models
│   │   ├── httpapi/             # routes, middleware, handlers
│   │   ├── mailer/              # password reset email
│   │   ├── password/            # bcrypt
│   │   ├── payment/             # PayPal client
│   │   └── store/               # MongoDB connection/indexes
│   ├── Dockerfile
│   └── .env.example
└── Front-End/Coolgards-NextJS/  # original Next.js frontend
```

## Local development

### Backend
```bash
cd Back-End/Coolgards-Go
cp .env.example .env
# Set a strong SECRET and your MongoDB connection string.
go mod download
go run ./cmd/api
```

### Frontend
```bash
cd Front-End/Coolgards-NextJS
npm ci
```
Create the frontend environment file with:
```env
BASE_URL=http://localhost:4000
```
Then run:
```bash
npm run dev
```
Open `http://localhost:3000`.

## Validation

```bash
cd Back-End/Coolgards-Go
gofmt -w .
go vet ./...
go test -race ./...
go build ./cmd/api
```

CI runs the formatting check, vet, race-enabled tests and build on backend changes.

## API compatibility

The frontend still calls paths such as `/api/users/login`, `/api/products`, `/api/orders`, `/api/panel/*`, and `/api/media/*`. Next.js rewrites those requests to the Go service, whose routes intentionally preserve the original Express route contract.

## Author
Sina Mohammadi

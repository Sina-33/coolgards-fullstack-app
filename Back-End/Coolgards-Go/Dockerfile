FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM alpine:3.21
RUN addgroup -S app && adduser -S -G app app && mkdir -p /app/media && chown -R app:app /app
WORKDIR /app
COPY --from=build /out/api /app/api
USER app
EXPOSE 4000
ENTRYPOINT ["/app/api"]

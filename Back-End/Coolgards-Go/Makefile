.PHONY: run test vet fmt
run:
	go run ./cmd/api
test:
	go test ./...
vet:
	go vet ./...
fmt:
	gofmt -w $$(find . -name '*.go' -type f)

.PHONY: build check fix format test vet

build:
	cd frontend && npm run build
	go build -tags production -buildvcs=false -o ./bin/beatstream .

format:
	gofmt -w $$(git ls-files '*.go')
	cd frontend && npx biome format --write .

fix:
	go fix ./...

vet:
	go vet ./...

test:
	go test ./...
	cd frontend && npm test

check: vet test
	test -z "$$(gofmt -l $$(git ls-files '*.go'))"
	go build -buildvcs=false ./...
	cd frontend && npx biome format .
	cd frontend && npm run build
	go build -tags production -buildvcs=false ./...
	docker compose build

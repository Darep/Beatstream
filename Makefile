build:
	cd frontend && npm run build
	go build -tags production -buildvcs=false -o ./bin/beatstream .

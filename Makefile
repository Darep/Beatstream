build:
	cd frontend && npm run build
	ENV=production go build -buildvcs=false -o ./bin/beatstream ./main.go

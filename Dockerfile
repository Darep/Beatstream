# Dockerfile for local dev
FROM golang:1.22

RUN cd frontend && npm install && npm run build

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    # required by go-taglib:
    libtagc0-dev \
 && rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./
RUN go mod download
COPY . .

CMD ["go", "run", "."]

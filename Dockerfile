# Dockerfile for local dev
FROM golang:1.26.0

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    # required by go-taglib:
    libtagc0-dev \
 && rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./
RUN go mod download
RUN go install github.com/air-verse/air@v1.61.7
COPY . .

CMD ["air"]

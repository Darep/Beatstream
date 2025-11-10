# Beatstream

Beatstream is an app for streaming music from your computer or server to anywhere with a modern Web browser!

![Screenshot](http://i.imgur.com/oRGwu.png)

## Installation

### Docker (Quick Start)

Requirements: Docker

```bash
docker run -d -p 8080:8080 -v /path/to/your/music:/music darep/beatstream:latest
```

Open http://0.0.0.0:8080 on your browser. Log in and wait when indexing ends, refresh page and happy listening!

### Manual Install

Requirements: Go 1.22 or newer. Node.js 20 or newer. TagLib (C bindings) e.g. libtagc

```bash
git clone https://github.com/Darep/Beatstream
cd frontend
npm install
npm run build
cd ..
go run .
```

Open http://0.0.0.0:8080 on your browser. Log in and wait when indexing ends, refresh page and happy listening!

## Development

Copy base env vars and modify as you see fit:

```bash
cp .env.example .env
```

Start the Beatstream app:

```bash
go run .
```

Start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

### Docker

Development with docker:

```bash
cp .env.example .env
docker compose up
```

# Zen & Done — Dockerized Todo App

A minimal, eye-soothing Todo app built with Node.js + Express + MongoDB.
Designed for the DevOps learning project (Weeks 1–3).

## Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Frontend**: Vanilla HTML/CSS/JS (served by Express)
- **Container**: Docker + docker-compose

## Run with Docker (recommended)

```bash
docker compose up --build
```

Open → http://localhost:3000

## Run locally (without Docker)

```bash
npm install
node app.js
```

> Without MongoDB, the app falls back to in-memory storage automatically.

## API Routes

| Method | Route            | Description       |
|--------|------------------|-------------------|
| GET    | /health          | App + DB status   |
| GET    | /api/todos       | List all todos    |
| POST   | /api/todos       | Create a todo     |
| PATCH  | /api/todos/:id   | Toggle done state |
| DELETE | /api/todos/:id   | Delete a todo     |

## Project Structure

```
zen-todo/
├── app.js              # Express server + API routes
├── Dockerfile          # Container definition
├── docker-compose.yml  # App + MongoDB services
├── .dockerignore
├── .env.example
├── package.json
└── public/
    └── index.html      # Frontend (served statically)
```

## What you'll learn from this

- Writing a `Dockerfile` with layer caching best practices
- Connecting two services (app + mongo) via `docker-compose`
- Using service names as hostnames (`mongodb://mongo:27017`)
- Data persistence with named Docker volumes
- Graceful in-memory fallback when DB isn't available

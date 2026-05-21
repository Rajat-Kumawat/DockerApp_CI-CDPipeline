# Zen & Done — Dockerized Todo App

A minimal, eye-soothing Todo app built with Node.js + Express + MongoDB.
Designed for the DevOps learning project (Weeks 1–3).

## Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose) — Atlas in production, local container in dev
- **Frontend**: Vanilla HTML/CSS/JS (served by Express)
- **Container**: Docker + docker-compose
- **CI/CD**: GitHub Actions → DockerHub → Railway

## Live Demo

Deployed on Railway: `https://first-project-production.up.railway.app`

---

## Run with Docker (recommended for local dev)

```bash
docker compose up --build
```

Open → http://localhost:3000

Uses the local `mongo:6` container automatically via docker-compose.

## Run locally (without Docker)

```bash
npm install
node app.js
```

> Without MongoDB, the app falls back to in-memory storage automatically.

---

## API Routes

| Method | Route          | Description       |
|--------|----------------|-------------------|
| GET    | /health        | App + DB status   |
| GET    | /api/todos     | List all todos    |
| POST   | /api/todos     | Create a todo     |
| PATCH  | /api/todos/:id | Toggle done state |
| DELETE | /api/todos/:id | Delete a todo     |

---

## Project Structure

```
zen-todo/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions: lint → test → build & push
├── public/
│   └── index.html          # Frontend (served statically)
├── app.js                  # Express server + API routes
├── app.test.js             # Test suite
├── Dockerfile              # Container definition
├── docker-compose.yml      # App + MongoDB services (local dev)
├── .dockerignore
├── .env.example            # Environment variable reference
└── package.json
```

---

## CI/CD Pipeline

Every `git push` to `main` triggers the full pipeline:

```
git push
    │
    ▼
GitHub Actions
    ├── Lint        (ESLint)
    ├── Test        (Jest)
    └── Build & Push → DockerHub
                            │
                            ▼
                    Railway (auto-deploy)
                            │
                            ▼
                    Live app + MongoDB Atlas
```

### GitHub Actions (`ci.yml`)

Three sequential jobs run on every push:

1. **Lint** — ESLint checks code style
2. **Test** — Jest runs the test suite
3. **Build & Push** — builds the Docker image and pushes to DockerHub

### Secrets required (GitHub → Settings → Secrets → Actions)

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token |

---

## Deployment (Railway)

The app auto-deploys on Railway whenever a new image is pushed to DockerHub.

### Environment variables (set in Railway dashboard → Variables)

| Variable | Description |
|----------|-------------|
| `PORT` | Assigned automatically by Railway |
| `MONGO_URI` | MongoDB Atlas connection string |

### Why Atlas instead of a local container in production

`docker-compose.yml` wires the app to a `mongo` container via the hostname `mongo` — this only exists inside the compose network. On Railway, that hostname doesn't resolve, so the production environment uses a MongoDB Atlas free-tier cluster instead. The app reads `process.env.MONGO_URI` and falls back to `mongodb://mongo:27017/zentodo` for local dev.

---

## What you'll learn from this project

### Week 1 — Docker basics
- Writing a `Dockerfile` with layer caching best practices
- Connecting two services (app + mongo) via `docker-compose`
- Using service names as hostnames (`mongodb://mongo:27017`)
- Data persistence with named Docker volumes
- Graceful in-memory fallback when DB isn't available

### Week 2 — CI with GitHub Actions
- Structuring a multi-job workflow (lint → test → build)
- Building and pushing Docker images from CI
- Storing secrets safely with GitHub Actions secrets
- Uploading build artifacts

### Week 3 — CD and production deployment
- Auto-deploying to a free cloud VM (Railway)
- Managing environment secrets across GitHub and the deployment platform
- Swapping local infrastructure (docker-compose mongo) for a managed cloud DB (Atlas)
- Reading `PORT` dynamically for platform compatibility
- Testing the full pipeline end-to-end: push → CI → DockerHub → live app
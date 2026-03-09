# dots-ca Documentation

Credit Analytics Platform — a full-stack loan origination and credit assessment system.

## Table of Contents

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System overview, tech stack, project structure |
| [API Reference](./api-reference.md) | All gRPC/HTTP endpoints across 7 services |
| [Database Schema](./database-schema.md) | All tables, migrations, and EAV custom columns |
| [Development Guide](./development.md) | Local setup, Docker, proto generation, common tasks |
| [Frontend Guide](./frontend.md) | Next.js app structure, modules, shared components |
| [Backend Guide](./backend.md) | Go/Kratos layers, Wire DI, sqlc queries |

## Quick Start

```bash
# Prerequisites: Docker Desktop running, PostgreSQL on port 5432

# 1. Start everything with Docker
cd dots-ca-fe
docker-compose up --build

# Frontend: http://localhost:3001
# Backend HTTP: http://localhost:8001
# Backend gRPC: localhost:9001

# 2. Or run locally (dev mode)
# Terminal 1 — Backend
cd dots-ca-be
make db-setup          # Run migrations + seeds
go run ./cmd/credit-analytics-backend

# Terminal 2 — Frontend
cd dots-ca-fe
npm install
npm run dev            # http://localhost:3001
```

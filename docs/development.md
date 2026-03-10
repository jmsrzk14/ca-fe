# Development Guide

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Go** 1.24+ (for backend)
- **PostgreSQL** 15+ running on port 5432
- **Docker Desktop** (for containerized setup)
- **buf** CLI (for proto generation)

## Setup Options

### Option 1: Docker (recommended for quick start)

```bash
cd dots-ca-fe
docker-compose up --build
```

This starts:
- Frontend on `http://localhost:3001`
- Backend HTTP on `http://localhost:8001`
- Backend gRPC on `localhost:9001`

> **Important:** After any code change, you must rebuild: `docker-compose up --build`
> Docker runs production builds — there is no hot reload.

### Option 2: Local Development (recommended for active development)

```bash
# Terminal 1 — Database (if not already running)
# Ensure PostgreSQL is running with:
#   Database: dots_ca_v2
#   User: dots_user
#   Password: dots_password

# Terminal 2 — Backend
cd dots-ca-be
make db-setup              # First time only: migrations + seeds
go run ./cmd/credit-analytics-backend

# Terminal 3 — Frontend
cd dots-ca-fe
npm install                # First time only
npm run dev                # http://localhost:3001
```

Local dev gives hot reload on the frontend.

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_SSO_URL=http://localhost:8003
NEXT_PUBLIC_SSO_CLIENT_ID=dots-ca
NEXT_PUBLIC_SSO_REDIRECT_URI=http://localhost:3001/auth/callback
```

### Backend (`configs/config.yaml`)
```yaml
server:
  http:
    addr: 0.0.0.0:8001
  grpc:
    addr: 0.0.0.0:9001
data:
  database:
    source: postgres://dots_user:dots_password@localhost:5432/dots_ca_v2?sslmode=disable
```

## Proto Generation

Proto files are the source of truth for all API contracts.

### Backend
```bash
cd dots-ca-be
export PATH="$PATH:$(go env GOPATH)/bin"
make api
```

### Frontend
```bash
# 1. Copy protos from backend
cp -r ../dots-ca-be/api/* src/proto/

# 2. Generate TypeScript clients
npm run gen-proto-local
```

Generated files:
- BE: `api/{service}/v1/*.pb.go` (server stubs)
- FE: `src/gen/{service}/v1/*_pb.ts` + `*_connect.ts` (client code)

## Database Operations

```bash
cd dots-ca-be

# Migrations
make migrate-up            # Apply all pending
make migrate-down          # Rollback last
make migrate-status        # Check status

# Seeds
make seed-up               # Load reference data

# sqlc (after changing .sql query files)
sqlc generate
```

### Creating a New Migration

```bash
cd dots-ca-be
goose -dir internal/data/schema/migrations create <name> sql
# Edit the generated file, then:
make migrate-up
```

## Common Tasks

### Adding a New API Endpoint

1. Define the RPC in `dots-ca-be/api/{service}/v1/{service}.proto`
2. Generate code: `make api` (BE) + `npm run gen-proto-local` (FE)
3. Implement handler in `internal/service/{service}.go`
4. Add business logic in `internal/biz/{domain}.go`
5. Add SQL queries in `internal/data/queries/{domain}.sql` + run `sqlc generate`
6. Wire it up (if new repository/use case): update `wire.go` + `go generate`
7. Create FE service wrapper in `src/core/api/services/{service}-service.ts`

### Adding a Custom Column (EAV Field)

1. Go to `/settings/attributes` in the UI
2. Click "Tambah Field Baru"
3. Fill in: label, type, category, scope (APPLICANT or APPLICATION)
4. For SELECT type, add choices
5. The field automatically appears in the dynamic form

### Adding a New Page

1. Create route in `src/app/(dashboard)/{path}/page.tsx`
2. Create view component in `src/modules/{module}/components/{name}-view.tsx`
3. Export from module's `index.ts`
4. Add sidebar link in `src/modules/dashboard/components/dashboard-sidebar.tsx`

## Build & Deploy

```bash
# Frontend production build
cd dots-ca-fe
npm run build              # Outputs to .next/standalone/

# Backend production build
cd dots-ca-be
make build                 # Outputs to bin/

# Docker production
cd dots-ca-fe
docker-compose up --build -d
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 in use | `lsof -ti:3001 \| xargs kill` |
| Port 8001 in use | `lsof -ti:8001 \| xargs kill` |
| Docker changes not reflecting | `docker-compose up --build` (no hot reload in Docker) |
| Backend can't connect to DB | Check PostgreSQL is running: `pg_isready -p 5432` |
| Proto generation fails (BE) | `export PATH="$PATH:$(go env GOPATH)/bin"` then `make api` |
| sqlc errors | Ensure migration schema matches query expectations |

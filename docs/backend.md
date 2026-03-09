# Backend Guide

## Overview

Go application using the **Kratos** framework with a clean layered architecture: Service → Biz → Data.

## Layers

### Service Layer (`internal/service/`)
gRPC handlers that translate between protobuf messages and domain types.

| File | Services | Methods |
|------|----------|---------|
| `applicant.go` | ApplicantService | 10 RPCs (CRUD + attributes + parties) |
| `application.go` | ApplicationService, PartyService | 10 RPCs |
| `reference.go` | ReferenceService | 19 RPCs |
| `survey.go` | SurveyService | 17 RPCs |
| `financial.go` | FinancialService | 9 RPCs |
| `decision.go` | CommitteeService, DecisionService | 9 RPCs |
| (media) | MediaService | 3 RPCs |

### Biz Layer (`internal/biz/`)
Domain logic and use case orchestration. Defines repository interfaces that the data layer implements.

Key domain models:
- **Applicant**: Personal or corporate borrower with EAV attributes
- **Application**: Loan application with status state machine
- **Party**: Associated people (guarantors, co-borrowers)
- **Survey**: Configurable survey workflow (template → instance → answers)
- **Financial**: Income/expense facts, assets, liabilities, ratio calculations
- **Decision**: Committee voting and final credit decision

### Data Layer (`internal/data/`)
Repository implementations using **sqlc** for type-safe SQL.

```
internal/data/
├── queries/           # Raw SQL files (sqlc input)
│   ├── applicant.sql
│   ├── application.sql
│   ├── reference.sql
│   ├── survey.sql
│   ├── financial.sql
│   ├── decision.sql
│   └── application_document.sql
├── db/                # sqlc generated code
│   ├── models.go      # Go structs matching DB tables
│   ├── querier.go     # Interface with all query methods
│   └── *.sql.go       # Query implementations
└── schema/
    ├── migrations/    # Goose migration files (39)
    └── seeds/         # Seed data SQL
```

**Transaction Support**: `data.go` provides `InTx()` helper for wrapping multiple queries in a transaction.

### Server Layer (`internal/server/`)
HTTP and gRPC server setup.

- **HTTP** (port 8001): gRPC-Web bridge + CORS + Swagger UI
- **gRPC** (port 9001): Native gRPC for service-to-service calls

## Dependency Injection (Wire)

Wire generates constructor-based DI at compile time. No reflection.

```
cmd/credit-analytics-backend/
├── wire.go          # DI definition (build tag: wireinject)
└── wire_gen.go      # Generated wiring code
```

Provider sets:
- `server.ProviderSet` → HTTP server, gRPC server
- `data.ProviderSet` → DB connection, all repos
- `biz.ProviderSet` → All use cases
- `service.ProviderSet` → All gRPC handlers

To regenerate after adding new dependencies:
```bash
cd cmd/credit-analytics-backend
wire
```

## sqlc Workflow

1. Write SQL in `internal/data/queries/{domain}.sql`
2. Run `sqlc generate` to produce Go code in `internal/data/db/`
3. Use generated methods in repository implementations

Example query file:
```sql
-- name: GetApplicant :one
SELECT * FROM applicants WHERE id = $1;

-- name: ListApplicants :many
SELECT * FROM applicants ORDER BY created_at DESC;

-- name: CreateApplicant :one
INSERT INTO applicants (full_name, identity_number, type)
VALUES ($1, $2, $3) RETURNING *;
```

## Adding New Functionality

### New Domain Entity

1. **Migration**: Create `internal/data/schema/migrations/000XX_create_table_{name}.sql`
2. **Queries**: Add `internal/data/queries/{name}.sql`
3. **sqlc**: Run `sqlc generate`
4. **Biz**: Define domain model + repo interface in `internal/biz/{name}.go`
5. **Data**: Implement repo in `internal/data/{name}.go`
6. **Proto**: Define service in `api/{name}/v1/{name}.proto`
7. **Generate**: `make api`
8. **Service**: Implement handler in `internal/service/{name}.go`
9. **Wire**: Add to provider sets in `biz.go`, `data.go`, `service.go`
10. **Regenerate**: `cd cmd/credit-analytics-backend && wire`

### New RPC on Existing Service

1. Add RPC to the `.proto` file
2. `make api` to regenerate
3. Implement in the service handler
4. Add biz method if needed
5. Add SQL query if needed + `sqlc generate`

## Configuration

`configs/config.yaml`:
```yaml
server:
  http:
    addr: 0.0.0.0:8001
    timeout: 1s
  grpc:
    addr: 0.0.0.0:9001
    timeout: 1s
data:
  database:
    driver: postgres
    source: postgres://dots_user:dots_password@localhost:5432/dots_ca_v2?sslmode=disable
    max_open_conns: 25
    max_idle_conns: 10
    conn_max_lifetime: 5m
    conn_max_idle_time: 2m
  storage:
    endpoint: https://...supabase.co/storage/v1/s3
    bucket: application-documents
    region: ap-southeast-1
```

Environment variable overrides:
- `PORT` — HTTP port (for Railway/cloud)
- `DATABASE_URL` or `DATA_DATABASE_SOURCE` — DB connection
- `DB_AUTO_MIGRATE=true` — Auto-run migrations on startup

## Makefile Targets

```bash
make api               # Generate proto → Go code
make build             # Build binary to bin/
make migrate-up        # Run pending migrations
make migrate-down      # Rollback last migration
make migrate-status    # Show migration status
make seed-up           # Load seed data
make db-setup          # migrate-up + seed-up
make init              # Install proto tooling
```

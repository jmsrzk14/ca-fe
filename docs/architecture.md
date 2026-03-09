# Architecture

## System Overview

```
┌──────────────┐     gRPC-Web      ┌──────────────┐      SQL       ┌──────────────┐
│   Frontend   │ ──────────────→   │   Backend    │ ────────────→  │  PostgreSQL  │
│  Next.js 15  │   port 8001       │  Go/Kratos   │                │  dots_ca_v2  │
│  port 3001   │                   │  port 9001   │                │  port 5432   │
└──────────────┘                   └──────────────┘                └──────────────┘
                                         │
                                         ▼
                                   ┌──────────────┐
                                   │  S3 Storage  │
                                   │  (Supabase)  │
                                   └──────────────┘
```

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 15 | App Router, standalone output |
| React 19 | UI framework |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui + Radix | Component library |
| @connectrpc | gRPC-Web client |
| @bufbuild/protobuf | Protobuf serialization |
| TanStack Query 5 | Server state management |
| Zustand | Client state management |
| React Hook Form + Zod | Form handling + validation |
| Lingui | i18n (English, Indonesian) |
| Recharts | Dashboard charts |
| @dnd-kit | Drag-and-drop (Kanban) |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|-----------|---------|
| Go 1.24 | Language |
| Kratos v2 | HTTP + gRPC framework |
| Protocol Buffers | API contracts |
| sqlc | Type-safe SQL queries |
| Goose | Database migrations |
| Wire | Compile-time dependency injection |
| AWS SDK v2 | S3 document storage |

### Infrastructure
| Component | Details |
|-----------|---------|
| Database | PostgreSQL (dots_ca_v2) |
| Storage | Supabase S3 |
| Containerization | Docker + docker-compose |
| Auth | SSO with access_token cookie |

## Project Structure

### Frontend (`dots-ca-fe/`)
```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Route group — all authenticated pages
│   │   ├── borrowers/      # Applicant CRUD
│   │   ├── loans/          # Application management
│   │   ├── applications/   # Application list
│   │   ├── credit-bureau/  # SLIK integration
│   │   └── settings/       # Admin settings
│   ├── login/              # SSO login
│   └── auth/callback/      # SSO callback
├── modules/                # Feature modules
│   ├── dashboard/          # Dashboard, kanban, loan details
│   ├── applicant/          # Borrower management, dynamic forms
│   ├── survey/             # Survey workflow
│   └── credit-bureau/      # SLIK/credit bureau
├── shared/                 # Reusable code
│   ├── ui/                 # shadcn/ui components
│   ├── components/         # App-level shared components
│   ├── hooks/              # Custom hooks
│   ├── types/              # Domain types (api.ts)
│   └── lib/                # Utilities (cn, i18n, dynamic-form)
├── core/                   # API layer
│   └── api/
│       ├── grpc-client.ts  # Transport + auth interceptor
│       └── services/       # Service wrappers (6 services)
├── proto/                  # .proto source files
├── gen/                    # Generated protobuf/gRPC code
└── middleware.ts           # Auth middleware
```

### Backend (`dots-ca-be/`)
```
cmd/credit-analytics-backend/
├── main.go                 # Entry point + config
├── wire.go                 # DI setup
└── wire_gen.go             # Generated DI code

internal/
├── biz/                    # Business logic (use cases)
├── data/                   # Repository implementations
│   ├── db/                 # sqlc generated code
│   ├── queries/            # SQL query files
│   └── schema/
│       ├── migrations/     # Goose migrations (39 files)
│       └── seeds/          # Seed data
├── service/                # gRPC handlers
├── server/                 # HTTP + gRPC server setup
└── conf/                   # Config proto definitions

api/                        # Proto definitions (7 services)
├── applicant/v1/
├── application/v1/
├── reference/v1/
├── survey/v1/
├── financial/v1/
├── decision/v1/
└── media/v1/
```

## Backend Layer Pattern

```
HTTP/gRPC Request
    ↓
Service Layer (internal/service/)     — Request parsing, response mapping
    ↓
Business Logic (internal/biz/)        — Domain rules, validation, state machines
    ↓
Repository Layer (internal/data/)     — SQL via sqlc, S3 storage
    ↓
PostgreSQL / S3
```

## Communication Pattern

Frontend communicates with backend via **gRPC-Web**:

1. Proto files define the API contract (`api/{service}/v1/*.proto`)
2. `buf generate` produces Go server code (BE) and TypeScript client code (FE)
3. Next.js rewrites proxy `/applicant.v1.*` → `http://backend:9001` (gRPC-Web)
4. Auth: Bearer token from `access_token` cookie injected via interceptor

## Authentication Flow

```
User → /login → SSO Provider → /auth/callback → Set access_token cookie → Dashboard
```

- `middleware.ts` checks `access_token` cookie on every request
- Public paths: `/login`, `/auth/callback`
- gRPC interceptor attaches Bearer token to all API calls

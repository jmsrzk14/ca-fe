# Frontend Guide

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | SSO login |
| `/auth/callback` | AuthCallback | SSO token exchange |
| `/` | DashboardView | Analytics dashboard |
| `/borrowers` | ApplicantList | Borrower list with search |
| `/borrowers/add` | ApplicantAddView | Multi-step borrower form |
| `/borrowers/[id]` | ApplicantDetail | Borrower detail |
| `/borrowers/[id]/edit` | ApplicantEditView | Edit borrower |
| `/loans` | ApplicationKanban | Kanban board |
| `/loans/add` | ApplicationAddPage | Create application |
| `/loans/[id]` | LoanDetailsView | Loan detail (tabbed) |
| `/loans/[id]/survey/assign` | SurveyAssignPage | Assign survey |
| `/applications` | LoanListView | Application table view |
| `/credit-bureau` | SlikUploadView | SLIK integration |
| `/settings` | SettingsPage | Settings home |
| `/settings/attributes` | AttributeManagementView | Custom field registry |

## Modules

### `dashboard/`
- **DashboardLayout**: Sidebar + header wrapper for all `(dashboard)` routes
- **DashboardView**: KPI cards, revenue chart, recent activity
- **ApplicationKanban**: Drag-and-drop kanban board for loan applications
- **LoanDetailsView**: Tabbed detail view with 8 tabs (borrower, loan info, financial, debt history, CRR, survey, history, documents)
- **LoanListView**: Table view of all applications with filters

### `applicant/`
- **ApplicantList**: Searchable borrower table
- **DynamicApplicantForm**: Multi-step form with dynamic EAV fields
  - Step 0: Primary info (name, identity number, type)
  - Step 1+: Dynamic fields grouped by category
  - Duplicate NIK/NPWP validation on step transition
- **AttributeManagementView**: Admin UI for managing custom fields, filtered by scope (Data Peminjam / Data Pinjaman)

### `survey/`
- Survey assignment and detail views

### `credit-bureau/`
- SLIK upload and facility detail views

## Shared Components

### UI (`src/shared/ui/`)
shadcn/ui components: Button, Card, Input, Select, SearchableSelect, Table, Dialog, Sheet, Tabs, Badge, Dropdown, Tooltip, etc.

### App Components (`src/shared/components/`)
- **RootProvider**: Wraps app with QueryClient, Theme, i18n, Toaster
- **DataTableView**: Generic table view for settings pages
- **DetailItem**: Key-value display component
- **DynamicField**: Renders form fields based on attribute type
- **EmptyState**: Empty state placeholder
- **ErrorBoundary**: Error boundary wrapper

### Hooks (`src/shared/hooks/`)
- **useAttributeRegistry**: Fetches and manages custom column definitions
- **useMobile**: Responsive breakpoint detection

## API Layer (`src/core/api/`)

### gRPC Client Setup
`grpc-client.ts` creates a gRPC-Web transport with:
- Empty `baseUrl` (uses Next.js rewrites to proxy to backend)
- Auth interceptor: reads `access_token` cookie, adds `Authorization: Bearer <token>`

### Services
Each service wraps the generated gRPC client with data transformation:

| Service | File | Wraps |
|---------|------|-------|
| applicantService | `applicant-service.ts` | ApplicantService client |
| applicationService | `application-service.ts` | ApplicationService + PartyService |
| referenceService | `reference-service.ts` | ReferenceService |
| surveyService | `survey-service.ts` | SurveyService |
| financialService | `financial-service.ts` | FinancialService |
| decisionService | `decision-service.ts` | CommitteeService + DecisionService |

## i18n

Uses **Lingui** with English (`en`) and Indonesian (`id`) locales.

Translation usage:
```tsx
import { t } from '@/shared/lib/t';

// In JSX
<h1>{t`Tambah Peminjam Baru`}</h1>

// Dynamic
toast.error(t`NIK sudah terdaftar atas nama ${name}`);
```

## Identity Number Logic

- **Personal (PERSONAL)**: Primary identifier is NIK. NPWP auto-fills from NIK.
- **Corporate (CORPORATE)**: Primary identifier is NPWP. NIB is a custom attribute.
- Duplicate validation checks identity number before proceeding from step 0.

## Key Patterns

1. **Dynamic Forms**: Fields are driven by `custom_column_attribute_registries` from the API. The form renders fields based on their `type` (TEXT, NUMBER, SELECT, DATE, etc.) and groups them by category.

2. **Kanban Board**: Uses `@dnd-kit` for drag-and-drop. Applications move between status columns.

3. **Tabbed Detail View**: Loan details use a tab layout with lazy-loaded content per tab.

4. **gRPC-Web Proxy**: Next.js `rewrites` in `next.config.ts` proxy gRPC-Web requests to the backend, avoiding CORS issues.

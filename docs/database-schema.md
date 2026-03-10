# Database Schema

Database: **PostgreSQL** — `dots_ca_v2`
User: `dots_user` / Password: `dots_password`
Migrations: Goose (39 versioned files in `internal/data/schema/migrations/`)

## Table Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `applicants` | Personal or corporate borrowers (NIK, NPWP, name, contact) |
| `applications` | Loan applications (product, amount, tenor, status) |
| `branches` | Bank branches |
| `loan_products` | Loan product definitions |
| `loan_officers` | Account officers per branch |

### EAV (Custom Columns) System

| Table | Description |
|-------|-------------|
| `attribute_categories` | Category groups (e.g., "Data Pribadi", "Data Usaha") |
| `custom_column_attribute_registries` | Field definitions with `scope` (APPLICANT / APPLICATION) |
| `custom_column_attribute_registries_choices` | SELECT options and shared reference data |
| `applicant_attributes` | Custom field values for applicants |
| `application_attributes` | Custom field values for applications |

**How EAV works:**
1. Admin defines fields in `custom_column_attribute_registries` (label, type, category, scope)
2. Fields with type SELECT have options in `choices` table (`attribute_id IS NOT NULL`)
3. Shared reference data (provinces, cities) stored with `attribute_id IS NULL`
4. Values stored as key-value pairs in `applicant_attributes` / `application_attributes`
5. `hide_on_create` flag excludes fields from the create form

**Scope:** Each attribute has a `scope` field:
- `APPLICANT` — shown on borrower forms (Data Peminjam)
- `APPLICATION` — shown on loan application forms (Data Pinjaman)

### Status Management

| Table | Description |
|-------|-------------|
| `application_status_refs` | Valid statuses (e.g., DRAFT, SUBMITTED, APPROVED) |
| `product_status_flows` | Valid transitions per loan product |
| `application_status_logs` | Audit trail of status changes |

### Parties

| Table | Description |
|-------|-------------|
| `parties` | Associated people (guarantors, co-borrowers, directors) |
| `applicant_parties` | Junction: applicants ↔ parties |
| `application_parties` | Junction: applications ↔ parties |

### Survey System

| Table | Description |
|-------|-------------|
| `survey_templates` | Survey definitions |
| `survey_sections` | Sections within a template |
| `survey_questions` | Questions within a section |
| `survey_question_options` | Multiple choice options |
| `application_surveys` | Survey instances assigned to applications |
| `survey_answers` | Responses per survey instance |
| `survey_evidences` | Uploaded evidence files |
| `survey_data_mappings` | Maps survey answers → applicant/application attributes |

**Survey Workflow:** ASSIGNED → IN_PROGRESS → SUBMITTED → VERIFIED

### Financial Analysis

| Table | Description |
|-------|-------------|
| `financial_gl_accounts` | Chart of accounts (P&L, Balance Sheet) |
| `application_financial_facts` | Financial statement line items per application |
| `asset_types` | Asset type reference |
| `application_assets` | Assets per application |
| `application_liabilities` | Liabilities per application |
| `application_financial_ratios` | Calculated ratios (DSR, current ratio, etc.) |

### Credit Committee & Decision

| Table | Description |
|-------|-------------|
| `application_committee_sessions` | Committee meeting instances |
| `credit_committee_members` | Committee member registry |
| `application_committee_votes` | Individual votes per session |
| `application_committee_decisions` | Aggregated committee decision |
| `application_decisions` | Final application decision (APPROVED/REJECTED/CONDITIONAL) |
| `application_decision_conditions` | Conditions for conditional approvals |
| `credit_authority_matrices` | Authority limits by role/amount |

### Documents

| Table | Description |
|-------|-------------|
| `application_documents` | Uploaded documents per application (stored in S3) |

## Migration Commands

```bash
cd dots-ca-be

# Run all pending migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check migration status
make migrate-status

# Seed reference data
make seed-up

# Full setup (migrate + seed)
make db-setup
```

## Entity Relationship (Key Relationships)

```
applicants 1──* applicant_attributes
applicants 1──* applicant_parties ──* parties
applicants 1──* applications

applications 1──* application_attributes
applications 1──* application_parties ──* parties
applications 1──* application_status_logs
applications 1──* application_surveys
applications 1──* application_financial_facts
applications 1──* application_assets
applications 1──* application_liabilities
applications 1──* application_financial_ratios
applications 1──* application_committee_sessions
applications 1──1 application_decisions
applications 1──* application_documents

loan_products 1──* applications
loan_products 1──* product_status_flows

branches 1──* loan_officers
branches 1──* applications

survey_templates 1──* survey_sections 1──* survey_questions 1──* survey_question_options
survey_templates 1──* application_surveys

attribute_categories 1──* custom_column_attribute_registries 1──* choices
```

# Expense Dashboard: Product Requirements Document

**Status:** Draft v0.5  
**Date:** September 24, 2026

## 1. Overview

A personal finance web app that connects to a user's Gmail, automatically finds receipts, bank alerts, and payment confirmations, extracts structured expense data with a Python-based processing pipeline, and shows spending in a clean dashboard.

**Problem:** Expense tracking is manual and tedious, yet most of the data already sits in the inbox as emails.

**Goal:** Turn inbox emails into an accurate, reviewable expense ledger with minimal user effort while demonstrating a real-world Python data-processing and analytics pipeline.

---

## 2. Goals and Non-Goals

### Goals

- Connect Gmail with read-only access and import expense-related emails.
- Extract merchant, amount, currency, date, category, transaction type, and confidence automatically.
- Use **Python + FastAPI** for Gmail processing, LLM extraction, validation, normalization, deduplication, and transaction ingestion.
- Show monthly spend, category breakdown, trends, and a searchable transaction list.
- Let users correct extracted values quickly.
- Track extraction quality and validation outcomes so the pipeline can be evaluated.
- Keep the codebase clean, modular, tested, documented, and portfolio-quality.
- Demonstrate practical skills relevant to data analytics: data cleaning, validation, feature/field extraction, quality checks, aggregation, and analytics.

### Non-goals (v1)

- Bank account linking, payments, or budgeting advice.
- Multi-user teams or shared households.
- Native mobile apps (responsive web only).
- Support for email providers other than Gmail.
- Multi-currency support and PDF attachment parsing (post-MVP).

---

## 3. Target User

Individuals who receive receipts and payment alerts by email and want a spending overview without manual entry.

---

## 4. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| F1 | Sign in with Google (Supabase Auth) | Must |
| F2 | Connect Gmail via OAuth with `gmail.readonly` scope; disconnect and delete data at any time | Must |
| F3 | Fetch candidate emails (receipts, invoices, bank/UPI/card alerts) using search filters and labels | Must |
| F4 | Python service performs LLM extraction to structured JSON: merchant, amount, currency, date, category, transaction type, confidence | Must |
| F5 | Validate and normalize extracted data with Python/Pydantic before database insertion | Must |
| F6 | Duplicate detection using Gmail message ID and merchant + amount + date heuristics | Must |
| F7 | Dashboard: total this month, month-over-month change, category chart, spending trends, recent transactions | Must |
| F8 | Transaction list with search, filter by date/category, and inline edit | Must |
| F9 | Review queue for low-confidence or failed-validation extractions | Must |
| F10 | Extraction/data-quality metrics for the pipeline, such as validation failures, review rate, duplicate rate, and field-level accuracy on the test set | Should |
| F11 | Custom categories and per-merchant category rules | Should |
| F12 | CSV export | Should |
| F13 | Responsive, mobile-first layout | Must |
| F14 | Dark mode | Should |
| F15 | Recurring-payment detection | Could |
| F16 | Multi-currency support (v1 is INR only) | Could (post-MVP) |

---

## 5. Key User Flows

1. **Onboarding:** Sign in with Google → grant Gmail read access → choose import range (e.g., last 90 days) → initial sync starts.
2. **Sync:** Python background worker/API pipeline fetches emails → filters candidates → cleans email text → extracts structured data → validates → normalizes → deduplicates → stores transactions.
3. **Review:** User opens the review queue and confirms or edits low-confidence items.
4. **Explore:** User views dashboard and filters/searches transactions.
5. **Offboarding:** User disconnects Gmail and deletes all stored data.
6. **Pipeline evaluation:** Developer runs the Python evaluation/test suite against labeled emails to measure extraction accuracy and data-quality metrics.

---

## 6. Data Model (Postgres / Supabase)

- **profiles**: `id`, `default_currency`, `created_at`
- **gmail_connections**: `user_id`, `encrypted_refresh_token`, `last_sync_at`, `status`
- **transactions**: `id`, `user_id`, `gmail_message_id` (unique per user), `merchant`, `amount`, `currency`, `txn_date`, `category_id`, `transaction_type`, `confidence`, `status` (auto / review / edited), `source_snippet`
- **categories**: `id`, `user_id` (null for defaults), `name`, `color`
- **merchant_rules**: `user_id`, `merchant_pattern`, `category_id`
- **pipeline_runs**: `id`, `user_id`, `started_at`, `completed_at`, `emails_scanned`, `candidates_found`, `extractions_attempted`, `validation_failures`, `duplicates_found`, `transactions_saved`, `review_items_created`, `status`

Row Level Security on every user-owned table: users can access only their own rows.

---

## 7. Architecture and Stack

### Frontend

- **Next.js** App Router
- **TypeScript**
- Tailwind CSS
- shadcn/ui
- Recharts
- Supabase client for authentication and safe user-facing database operations

### Backend / Data Processing

- **Python 3.x**
- **FastAPI** for the backend API
- **Pydantic** for strict input/output validation
- Gmail API client for Gmail access and email retrieval
- Python service owns the core processing pipeline:
  1. Gmail retrieval
  2. Candidate filtering
  3. HTML-to-text cleaning
  4. LLM extraction
  5. Schema validation
  6. Normalization
  7. Confidence handling
  8. Deduplication
  9. Supabase/Postgres transaction storage
  10. Pipeline metrics/logging

### Database and Auth

- Supabase Postgres
- Supabase Auth with Google
- Row Level Security
- Supabase Storage only if a later feature requires file storage

### LLM Extraction

- Small, fast model with structured/JSON output.
- Primary model can be a current Gemini Flash-tier or Claude Haiku-tier model.
- Stronger fallback model is used only for failed validation or low-confidence cases.
- Model names are configuration values, not hard-coded throughout the application.
- All LLM calls are isolated behind a Python service/module so the provider can be swapped.

### Background Processing

The Python service is responsible for long-running email processing.

For the portfolio MVP, use one of these approaches:

- FastAPI background task for a simple first version, or
- a Python worker/queue for production-style processing.

The design should keep the processing function independent from the API route so it can later move to Celery/RQ/another queue without rewriting the extraction logic.

### Hosting

- Vercel → Next.js frontend
- Python FastAPI service → a Python-capable host
- Supabase → Postgres + Auth
- GitHub → source control

**Important:** Do not force the Python processing pipeline into Vercel serverless functions. The Next.js application and Python processing service are separate deployable components.

---

## 7a. Python Processing Pipeline

The Python service is the core data-processing layer of the product.

### Pipeline

```text
Gmail API
   ↓
Candidate Email Filter
   ↓
HTML/Text Cleaning
   ↓
LLM Extraction
   ↓
Pydantic Validation
   ↓
Normalization
   ↓
Confidence Check
   ↓
Duplicate Detection
   ↓
Supabase/Postgres
   ↓
Dashboard + Review Queue
```

### Python module structure

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   └── routes/
│   ├── services/
│   │   ├── gmail_service.py
│   │   ├── email_filter.py
│   │   ├── extraction_service.py
│   │   ├── validation_service.py
│   │   ├── normalization_service.py
│   │   ├── deduplication_service.py
│   │   └── transaction_service.py
│   ├── schemas/
│   │   └── transaction.py
│   ├── db/
│   │   └── supabase_client.py
│   ├── config.py
│   └── tests/
└── requirements.txt
```

This structure is intentionally modular: each stage can be tested independently instead of putting the entire pipeline inside one FastAPI route.

---

## 7b. LLM Extraction Details

**Pipeline:** Gmail search filter → rule-based pre-filter (drop newsletters and promotions) → clean to plain text → primary LLM call with strict JSON schema → Pydantic validation → fallback model if needed → normalization → dedupe → save or review.

### What is sent to the LLM

- Sender domain
- Subject
- Email date
- Cleaned plain-text body, HTML stripped and truncated to roughly 4,000 characters
- Only the minimum information needed for extraction

**Never sent:**

- Attachments
- Other emails in the thread
- Unrelated inbox content

**Not stored long-term:**

- Full email body
- Only the Gmail message ID, extracted fields, and a short snippet are saved

### Required JSON output

```json
{
  "is_expense": true,
  "transaction_type": "debit",
  "merchant": "Swiggy",
  "amount": 450.00,
  "currency": "INR",
  "txn_date": "2026-09-20",
  "category": "Food & Dining",
  "confidence": 0.92
}
```

### Categories

The canonical category list is shared between the TypeScript frontend and Python backend:

```text
Food & Dining
Groceries
Shopping
Transport
Bills & Utilities
Entertainment
Health
Travel
Other
```

The Python backend must validate the category against this controlled list rather than trusting arbitrary LLM output.

### Python validation rules

The backend validates:

- `is_expense` is boolean
- `transaction_type` is one of `debit`, `credit`, `refund`
- `merchant` is non-empty
- `amount` is numeric and greater than 0
- `currency` is a valid ISO 4217 code
- `txn_date` is valid and not in the future
- `category` belongs to the controlled category list
- `confidence` is between 0 and 1

Any validation failure is treated as low confidence.

### Confidence handling

- `>= 0.8` and validation passes → save as `auto`
- `< 0.8` or validation fails → retry once with fallback model
- Still below `0.8` → save with `review` status and show in review queue
- Threshold is configurable and should be evaluated against a labeled test set

The model's self-reported confidence is not treated as ground truth; validation and measured test-set accuracy are more important.

---

## 7c. Data Quality and Analytics Layer

Because this is also a portfolio project for data/analytics roles, the backend should expose measurable pipeline quality rather than treating extraction as a black box.

Track:

- Total emails scanned
- Candidate emails identified
- Extraction attempts
- Validation failures
- Fallback-model usage
- Duplicate rate
- Auto-accepted transactions
- Review-queue rate
- Manual correction rate
- Merchant accuracy
- Amount accuracy
- Date accuracy
- Overall transaction-level accuracy

The evaluation dataset should contain labeled Indian transaction emails/alerts from sources such as Amazon, Flipkart, Swiggy, Zomato, HDFC, ICICI, and UPI confirmations.

These metrics should be usable for a small internal evaluation dashboard or notebook so the project demonstrates both **building the pipeline** and **measuring whether the pipeline works**.

---

## 8. Non-Functional Requirements

### Privacy

- Send only minimal, filtered email text to the LLM.
- Do not store full email bodies.
- Encrypt refresh tokens at rest.
- Provide Gmail disconnect and data deletion.

### Security

- Gmail read-only scope.
- RLS on all user-owned Supabase tables.
- Secrets stored in environment variables.
- No tokens in client-side code.
- FastAPI endpoints authenticate requests before accessing user data.
- Service-role database credentials must never be exposed to the browser.

### Performance

- Dashboard loads in under 2 seconds under normal demo conditions.
- Initial 90-day sync should complete within a few minutes for a normal inbox subset.
- Long-running processing should not block a user-facing HTTP request indefinitely.

### Accuracy

- At least 90% correct on merchant, amount, and date for receipt-style emails in a labeled test set is the target.
- Accuracy should be measured rather than claimed.

### Cost

- Keep LLM cost per processed email low through candidate filtering and a small primary model.
- Use the stronger fallback model only when required.

### Maintainability

- Strict TypeScript on the frontend.
- Python type hints and Pydantic models on the backend.
- Unit tests for validation and deduplication.
- Integration tests for the extraction pipeline.
- README with architecture diagram and setup instructions.
- Environment-specific configuration.
- Clear separation between API routes and processing services.

---

## 9. Constraints and Risks

| Risk | Mitigation |
|---|---|
| Gmail read scope is restricted; public launch requires Google verification and potentially a security assessment | Keep the app in testing mode for the portfolio version and document this clearly |
| LLM misreads amounts or dates | Pydantic validation, confidence scores, fallback model, review queue, editable fields |
| Email formats vary widely | Start with common senders, build a labeled evaluation set, improve prompts and preprocessing iteratively |
| Sensitive data exposure | Minimal data sent to LLM, encryption, read-only access, easy disconnect/delete |
| Python service unavailable | Show sync status, keep transactions already stored, retry failed processing |
| Duplicate emails or multiple alerts for one purchase | Gmail message ID uniqueness plus merchant/amount/date deduplication |
| LLM provider/model deprecation | Keep model name in environment/config and isolate LLM calls behind one Python service |
| Long-running sync exceeds API request limits | Separate API request from background processing/worker |
| Frontend and backend schemas drift | Keep a shared documented transaction contract and validate API responses |

---

## 10. Success Criteria for v1

v1 is done when all of these are true:

1. **Speed to value:** A user can connect Gmail and see at least 20–30 real transactions within 5 minutes.
2. **Accuracy:** At least 85% of transactions have merchant, amount, and date all correct; stretch goal 90%, measured on a labeled test set of at least 50 real Indian receipts and alerts.
3. **Review flow:** The review queue works end to end, and correcting a transaction takes only a few seconds.
4. **Low manual effort:** Fewer than 15% of transactions need manual correction after the queue is cleared.
5. **Python pipeline:** Gmail fetching, cleaning, extraction, validation, normalization, and deduplication run through the Python/FastAPI backend.
6. **Data quality:** Pipeline metrics are captured and can be analyzed.
7. **Shipped:** Publicly deployed demo plus a clean GitHub repo with README, architecture diagram, setup steps, screenshots, and known limitations.
8. **Quality:** Tests cover extraction validation and deduplication logic.

---

## 11. Milestones

### M1 — Week 1: Foundation

- Next.js + TypeScript frontend
- Supabase project
- Google authentication
- Database schema and RLS
- Dashboard UI with mock data
- Initial FastAPI project structure
- Python environment and dependency management
- Health-check endpoint
- Frontend-to-FastAPI connectivity

### M2 — Week 2: Gmail + Python ingestion

- Gmail OAuth with `gmail.readonly`
- Secure token handling
- Gmail message retrieval
- Candidate email filtering
- HTML/text cleaning
- Python ingestion service
- Store raw processing metadata needed for debugging without storing full email bodies

### M3 — Week 3: Extraction + Data Quality

- LLM extraction through Python
- Pydantic validation
- Merchant/category normalization
- Confidence handling
- Fallback model
- Duplicate detection
- Transaction storage
- Pipeline metrics
- Labeled evaluation dataset
- Accuracy evaluation

### M4 — Week 4: Product completion

- Review queue
- Inline transaction editing
- Dashboard with real data
- Search/filter
- Data-quality metrics view or evaluation notebook
- Responsive polish
- Tests
- README
- Architecture diagram
- Deployment

### Post-MVP

- Custom categories
- Merchant rules
- CSV export
- Dark mode
- Recurring-payment detection
- Multi-currency support
- More advanced analytics
- Queue-based Python worker architecture

---

## 12. Decisions for v1

| Question | Decision |
|---|---|
| Currency | INR only. Multi-currency is post-MVP. |
| Priority email types | Order confirmations plus bank, UPI, and card debit alerts (Amazon, Flipkart, Swiggy, Zomato, HDFC, ICICI, etc.) |
| Frontend language | TypeScript / Next.js |
| Core processing language | **Python** |
| Backend framework | **FastAPI** |
| Data validation | **Pydantic** |
| Database | Supabase Postgres |
| Authentication | Supabase Auth + Google |
| LLM processing | Python service with provider abstraction |
| Background processing | Python worker/background job; API layer must remain separate from long-running processing |
| PDF attachments | Deferred to post-MVP |
| Architecture | Next.js frontend + Python/FastAPI processing backend + Supabase database/auth |

---

## 13. Portfolio / Data Career Value

The project should demonstrate more than frontend development.

### Data Analyst skills demonstrated

- SQL/Postgres data modeling
- Data cleaning and normalization
- Data validation
- Exploratory analysis of transaction data
- KPI calculation
- Spending trend and category analysis
- Data-quality measurement
- Dashboarding
- CSV/data export
- Business-facing insights

### Python / Data Engineering skills demonstrated

- FastAPI
- API design
- ETL-style pipeline development
- Gmail API integration
- Pydantic/schema validation
- Data transformation
- Deduplication
- Error handling
- Logging and pipeline metrics
- Database integration
- Testing

### ML / AI skills demonstrated

- LLM structured extraction
- Prompt/schema design
- Confidence handling
- Fallback strategy
- Evaluation dataset
- Precision/accuracy measurement
- Human-in-the-loop review

**Portfolio positioning:** The project is not presented as "a Next.js expense tracker." It is presented as a **Python-powered email-to-expense data pipeline with automated extraction, validation, deduplication, and analytics**, with Next.js providing the user-facing product.

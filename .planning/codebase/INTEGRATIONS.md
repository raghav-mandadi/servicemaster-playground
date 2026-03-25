# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**None detected.** This is a fully client-side prototype with no calls to external APIs. No `fetch()`, `axios`, or SDK client calls exist anywhere in `src/`. All data is loaded from local JSON files.

## Data Storage

**Databases:**
- None — no database connection exists
- Data layer: JSON files in `src/data/` serve as static data source
  - `src/data/accounts.json` — account records
  - `src/data/sites.json` — site/deal records with scoring metadata
  - `src/data/events.json` — health event log
  - `src/data/users.json` — user records
  - `src/data/templates.json` — service template records

**Assembly Layer:**
- `src/data/mockDataLoader.ts` — joins JSON files and computes live scores; exports `accountHealthScores` and `accounts` as static module-level constants
- Comment in `src/data/mockDataLoader.ts` documents the swap path: "To swap for a real API: replace the JSON imports with fetch calls and keep the same assembly logic"

**File Storage:**
- Local filesystem only (static assets bundled by Vite)

**Caching:**
- None — no cache layer; data computed once at module initialization

## Authentication & Identity

**Auth Provider:**
- None — no authentication system exists
- The app has no login flow, session management, or protected routes
- `src/data/users.json` contains user records but they are display-only mock data

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only; no structured logging library

**Analytics:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Not configured — no deployment config files detected (no `vercel.json`, `netlify.toml`, `Dockerfile`, etc.)
- Output is a standard Vite static build (`dist/`) suitable for any static host

**CI Pipeline:**
- None — no `.github/workflows/`, `.circleci/`, or similar CI config detected

## Environment Configuration

**Required env vars:**
- None — the app requires no environment variables

**Secrets location:**
- No secrets exist; no `.env` files present

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Third-Party SDKs

**None detected.** The dependency tree contains only:
- UI/component libraries (`react`, `react-router-dom`, `lucide-react`, `@tanstack/react-table`)
- Form libraries (`react-hook-form`, `@hookform/resolvers`, `zod`)
- Build tools (`vite`, `typescript`, `tailwindcss`, `eslint`)

No payment, analytics, communication, cloud, or identity SDKs are installed.

## Future Integration Points

The codebase is explicitly structured for API migration. `src/data/mockDataLoader.ts` documents the swap path:
- Replace JSON imports in `buildHealthScores()` and `buildAccounts()` with `fetch` calls
- The assembly and scoring logic in `src/utils/healthScoring.ts` is API-agnostic and does not need to change
- `src/data/scoringConfig.ts` defines `ScoringConfig` interface ready to be persisted server-side

---

*Integration audit: 2026-03-25*

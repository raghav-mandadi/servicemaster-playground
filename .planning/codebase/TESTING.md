# Testing Patterns

**Analysis Date:** 2026-03-25

## Test Framework

**Runner:**
- None detected. No test runner is installed or configured.
- No `jest`, `vitest`, `@testing-library/react`, `mocha`, or any testing dependency appears in `package.json`.
- No `jest.config.*` or `vitest.config.*` file exists in the project root.

**Assertion Library:**
- None

**Run Commands:**
```bash
# No test commands configured in package.json
# Available scripts:
npm run dev        # Start Vite dev server
npm run build      # tsc && vite build
npm run lint       # ESLint
npm run preview    # Vite preview
```

## Test File Organization

**Location:**
- No test files exist in the repository.
- Searched for `*.test.*` and `*.spec.*` — no matches found.

**Naming:**
- Not applicable — no tests exist.

**Structure:**
```
src/        # No __tests__/ directories or co-located test files present
```

## Test Structure

**Suite Organization:**
- Not applicable.

**Patterns:**
- Not applicable.

## Mocking

**Framework:** None

**What Would Need Mocking (if tests were written):**
- `src/data/mockDataLoader.ts` — exports `accountHealthScores` and `accounts` as module-level constants computed at import time from JSON; would require module mocking to inject test data
- `src/utils/healthScoring.ts` — pure function `computeLiveScore(events, config)` is directly testable without mocking
- Date-dependent logic in `src/utils/healthScoring.ts` via `daysSince()` which calls `Date.now()` — would require mocking `Date.now` for deterministic scoring tests

## Fixtures and Factories

**Test Data:**
- No test fixtures or factories exist.
- The project uses JSON files as static data in `src/data/`:
  - `src/data/accounts.json` — account records
  - `src/data/sites.json` — site/deal records
  - `src/data/events.json` — health event records
  - `src/data/users.json` — user records
  - `src/data/templates.json` — service templates
- These JSON files serve as the application's mock data layer, not test fixtures.

**Location:**
- No dedicated fixtures directory.

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

**View Coverage:**
```bash
# Not available — no test runner installed
```

## Test Types

**Unit Tests:**
- None exist. The codebase has clear unit-testable candidates:
  - `computeLiveScore` in `src/utils/healthScoring.ts` — pure function with deterministic output given events + config
  - `getTierFromScore` in `src/types/health.ts` — pure function
  - `getTierColors`, `getTierLabel` in `src/types/health.ts` — pure functions
  - `getCriterionMeta` in `src/types/health.ts` — pure function
  - `buildHealthScores`, `buildAccounts` in `src/data/mockDataLoader.ts` — data assembly functions

**Integration Tests:**
- None exist.

**E2E Tests:**
- Not used. No Playwright, Cypress, or similar tooling installed.

## Current Quality Assurance

In the absence of automated tests, the project relies on:

1. **TypeScript strict mode** (`strict: true`, `noUnusedLocals`, `noUnusedParameters`) catching type errors at compile time — `tsconfig.json`
2. **ESLint** with `@typescript-eslint` enforcing code quality — `npm run lint`
3. **Manual testing** via the Vite dev server — `npm run dev`

## Recommendations for Adding Tests

If tests are introduced, the recommended approach for this Vite + React project:

**Install Vitest (compatible with Vite):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Config (`vite.config.ts` addition):**
```typescript
import { defineConfig } from 'vite'
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

**Priority test targets:**
1. `src/utils/healthScoring.ts` — `computeLiveScore` with varied event arrays and scoring configs
2. `src/types/health.ts` — `getTierFromScore`, `getTierColors`, `getCriterionMeta`
3. `src/data/mockDataLoader.ts` — `buildHealthScores`, `buildAccounts` integration with JSON data

---

*Testing analysis: 2026-03-25*

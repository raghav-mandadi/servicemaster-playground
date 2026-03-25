# Coding Conventions

**Analysis Date:** 2026-03-25

## Naming Patterns

**Files:**
- React components: PascalCase matching the exported component name — `AccountHealthList.tsx`, `EventLogForm.tsx`, `StatusChip.tsx`
- Utility/data modules: camelCase — `healthScoring.ts`, `mockDataLoader.ts`, `scoringConfig.ts`
- Type files: camelCase noun — `health.ts`, `index.ts`
- Metadata/config constants: camelCase — `eventMeta.ts`
- JSON data files: camelCase — `accounts.json`, `sites.json`, `events.json`

**Functions:**
- React components: PascalCase named exports — `export function AccountHealthList(...)`
- Event handlers: `handle` prefix — `handleSubmit`, `handleTypeSelect`, `handleSearchChange`
- Pure utility functions: camelCase verbs — `computeLiveScore`, `buildHealthScores`, `buildAccounts`, `getTimeDecayMultiplier`, `getTierFromScore`, `getTierColors`
- Predicate helpers: `is` prefix — `isInherentlyPositive`, `isDealSelected`, `isAccountSelected`
- Small private helpers: camelCase — `daysSince`, `worstTier`, `formatDate`, `formatWeekRange`

**Variables:**
- camelCase throughout — `scoringConfig`, `tierFilter`, `firstRed`, `currentUserId`
- Aligned multi-assignment blocks use spaces for visual alignment (common in this codebase):
  ```typescript
  const [search,      setSearch]      = useState('');
  const [tierFilter,  setTierFilter]  = useState<TierFilter>('all');
  const [expanded,    setExpanded]    = useState<Set<string>>(...)
  ```
- Lookup constants: SCREAMING_SNAKE_CASE — `TIER_COLOR`, `TIER_ORDER`, `TIER_REQUIREMENTS`, `DECAY_TABLE`, `DEFAULT_SCORING_CONFIG`

**Types and Interfaces:**
- `type` for union strings and simple aliases — `type HealthTier = 'green' | 'yellow' | 'red'`
- `interface` for object shapes — `interface AccountHealthScore { ... }`, `interface HealthEvent { ... }`
- Props interfaces: ComponentName + `Props` suffix — `ButtonProps`, `InputProps`, `HealthDetailProps`
- Internal-only types (not exported): defined locally in the file — `type TierFilter`, `interface AccountGroup`
- Raw JSON shapes: `Raw` prefix — `RawSite`, `RawAccount`

**Constants (module-level):**
- SCREAMING_SNAKE_CASE for configuration lookup tables — `TIER_COLOR`, `CHIP_CONFIG`, `SEVERITY_LABELS`, `OUTCOME_OPTIONS`
- PascalCase for arrays of UI metadata — `CRITERIA_META`, `EXTRA_CRITERIA_META`, `VISIT_SENTIMENT`

## Code Style

**Formatting:**
- No Prettier config detected — formatting is manual/editor-driven
- 2-space indentation throughout
- Single quotes for strings in TypeScript
- Trailing commas on multi-line object/array literals
- Pixel values for font sizes written as Tailwind arbitrary values: `text-[13px]`, `text-[16px]`, `text-[12px]`

**Linting:**
- ESLint with `@typescript-eslint` parser (version 6)
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Run via: `npm run lint` — `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`
- TypeScript strict mode: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`

**TypeScript Strictness:**
- `strict: true` in `tsconfig.json`
- `noUnusedLocals` and `noUnusedParameters` enforced
- `noFallthroughCasesInSwitch` enabled
- Type assertions used sparingly: `as HealthTier`, `as 1 | 2 | 3 | 4 | 5`, `as AccountStatus`
- Prefer `import type` for type-only imports — `import type { HealthEvent } from '../types/health'`

## Import Organization

**Order (observed pattern):**
1. React and React hooks — `import { useState, useMemo } from 'react'`
2. Third-party libraries — `import { Link } from 'react-router-dom'`, `import { AlertCircle } from 'lucide-react'`
3. Internal components — `import { Button } from '../components/ui/Button'`
4. Internal types — `import type { AccountHealthScore } from '../../../types/health'`
5. Internal data/utils — `import { accountHealthScores } from '../data/mockDataLoader'`

**Path Style:**
- Relative paths only — no path aliases (`@/` or `~`) are configured
- Depth-aware: pages import from `../components/...`, components import from `../../../types/...`

**React import:**
- Explicit `import React from 'react'` only in UI primitive files (`Button.tsx`, `Input.tsx`) where `React.ButtonHTMLAttributes` is referenced
- All other files use named hook imports without the React default — `import { useState } from 'react'`

## Error Handling

**Strategy:**
- No try/catch blocks in the codebase — this is a frontend-only demo app with no async operations
- Validation is done inline before submit: `if (!selectedType || !description.trim()) return;`
- Disabled states communicate invalid conditions via `disabled` prop or conditional `canSubmit` boolean
- Optional chaining used defensively — `account?.accountName ?? site.accountId`, `accountDeals[0]?.tier`
- Nullish coalescing for fallbacks — `?? 'green'`, `?? null`, `?? ''`

## Logging

**Framework:** None — no `console.log`, `console.warn`, or `console.error` found in `src/`

No logging patterns in use. This is a UI prototype/demo.

## Comments

**Section dividers — heavy use of ASCII banner comments:**
```typescript
// ─── Live Scoring Engine ──────────────────────────────────────────────────────
// Explains the module's purpose in multi-line prose
```
```typescript
// ─── Helpers ─────────────────────────────────────────────────────────────────
```

**Inline docs — business logic explained inline:**
```typescript
// Positives cannot buffer against negatives: negatives compute against base 100 first,
// then positives recover back up — but never above 100.
```

**Field-level docs — interface properties annotated:**
```typescript
export interface HealthSignal {
  pointImpact: number; // negative = hurts score, positive = helps
  threshold?: string;  // RYG threshold context shown in UI
  decayDays?: number;  // for time-decaying signals
}
```

**No JSDoc/TSDoc** (`@param`, `@returns`) — prose comments at module and section level instead.

## Function Design

**Size:** Functions are generally compact. Complex scoring logic in `computeLiveScore` (`src/utils/healthScoring.ts`) is ~80 lines with a `switch` statement — the largest single function.

**Parameters:**
- Destructured in function signature for components: `export function Button({ variant = 'primary', size = 'regular', ...props }: ButtonProps)`
- Pure functions take typed arguments directly: `computeLiveScore(events: HealthEvent[], config: ScoringConfig)`

**Return Values:**
- Components return JSX
- Pure helpers return typed values with explicit return types on complex functions: `: LiveScoreResult`, `: HealthTier`, `: AccountHealthScore[]`
- Simple helpers infer return type: `function daysSince(iso: string): number`

## Module Design

**Exports:**
- Named exports only — no default exports for components (except `App.tsx` which is the root)
- Re-export pattern: `src/data/mockDataLoader.ts` exports pre-built static arrays alongside builder functions:
  ```typescript
  export const accountHealthScores = buildHealthScores();
  export const accounts = buildAccounts();
  ```

**Co-location:** Constants and lookup tables defined at the top of the file that uses them (`TIER_COLOR`, `OUTCOME_OPTIONS`, `SEVERITY_LABELS`), not in a separate constants file.

**Barrel Files:** Not used — imports point to specific files, not `index.ts` re-exports.

## Styling Conventions

**Tailwind-first with arbitrary values:**
- Custom pixel sizes via arbitrary values: `text-[13px]`, `rounded-[8px]`, `h-[56px]`
- Design token colors via custom Tailwind theme: `text-text-primary`, `bg-surface-page`, `border-border-card`, `text-status-danger`
- Raw hex colors via inline `style` prop when dynamic (tier color, active states): `style={{ color: TIER_COLOR[tier] }}`
- Tailwind class strings composed as template literals: `` `${base} ${variantClass} ${sizeClass} ${disabledClass} ${className}` ``

**Pattern for variant-driven styling:**
```typescript
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-white border border-border text-text-primary ...',
};
```

---

*Convention analysis: 2026-03-25*

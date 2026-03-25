# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.2 - All source files in `src/` (`tsconfig.json` target: ES2020, strict mode enabled)

**Secondary:**
- CSS - Global styles via `src/index.css` (minimal; Tailwind handles most styling)

## Runtime

**Environment:**
- Browser (SPA) — no Node.js server runtime

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.2 — UI rendering, component tree; entry at `src/main.tsx`
- React Router DOM 6.22 — Client-side routing; `BrowserRouter` wraps the entire app in `src/App.tsx`

**Styling:**
- Tailwind CSS 3.4 — Utility-first CSS; config at `tailwind.config.ts` with custom design tokens (brand colors, shadows, font)
- PostCSS 8.4 — CSS processing pipeline; config at `postcss.config.js`
- Autoprefixer 10.4 — Browser prefix handling via PostCSS

**Build/Dev:**
- Vite 5.1 — Dev server and production bundler; config at `vite.config.ts`
- `@vitejs/plugin-react` 4.2 — Vite plugin enabling React fast refresh

## Key Dependencies

**Critical:**
- `react-hook-form` 7.51 — Form state management; used in `src/components/health/admin/EventLogForm.tsx` and `src/pages/Settings.tsx`
- `@hookform/resolvers` 3.3 — Connects Zod schemas to react-hook-form
- `zod` 3.22 — Schema validation; paired with react-hook-form for form validation
- `@tanstack/react-table` 8.11 — Headless table primitives; used in account/health list views
- `lucide-react` 0.344 — Icon library; used throughout all pages and components

**Infrastructure:**
- No state management library (no Redux, Zustand, Jotai) — component-local `useState` and prop drilling only
- No data fetching library (no React Query, SWR) — all data is static JSON loaded at module init

## Configuration

**Environment:**
- No `.env` files detected — no environment variables are required
- All data is local JSON files in `src/data/`; no API keys or secrets needed

**Build:**
- `tsconfig.json` — App TypeScript config (strict, noUnusedLocals, noUnusedParameters)
- `tsconfig.node.json` — Vite config TypeScript config
- `vite.config.ts` — Minimal config: React plugin only, no path aliases, no proxies
- `tailwind.config.ts` — Custom color system, font family, and box shadow tokens

## TypeScript Configuration

**Strict settings enabled:**
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Module resolution:** `bundler` (Vite-native)

**JSX transform:** `react-jsx` (no React import required in components)

## Platform Requirements

**Development:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version`)
- `npm run dev` — starts Vite dev server

**Production:**
- Static site output in `dist/` via `npm run build` (`tsc && vite build`)
- `npm run preview` — serves built output locally
- No server required; can be deployed to any static host (Netlify, Vercel, S3, etc.)

---

*Stack analysis: 2026-03-25*

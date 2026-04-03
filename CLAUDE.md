# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**
```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build static site to out/ directory
pnpm start        # Start production server (not used for static export)
```

**Testing:**
```bash
pnpm test:e2e     # Run Playwright E2E tests
pnpm e2e          # Alias for test:e2e
```

**Package Manager:** This project uses `pnpm` (not npm or yarn).

## Architecture Overview

This is a **static dashboard application** for visualizing KWDB community metrics. It's built with Next.js 14 App Router but configured for **static site generation (SSG)** via `output: 'export'` in `next.config.js`, enabling deployment to GitHub Pages.

### Core Architectural Pattern: Configuration-Driven

The application follows a **manifest pattern** where charts are defined declaratively:

```
charts/*.yaml → queries/*.ts → ChartRenderer → Dashboard
```

**Flow:**
1. YAML files in `charts/` define chart metadata (id, title, viz type, query module, options)
2. `lib/serverManifest.ts` loads all YAML files at build time
3. Each chart dynamically imports its query module via `QUERIES` registry in `queries/index.ts`
4. Query functions execute Supabase queries with time filters and return standardized data shapes
5. `ChartRenderer` component universally renders all chart types (line, bar, area, table, stat)

### State Management (No Redux/Zustand)

Three React Contexts manage all state:
- **AuthContext** (`components/Auth.tsx`): Password-based auth using localStorage (default: `kwdb2025`)
- **TimeRangeContext** (`lib/time.tsx`): Global time range with Grafana-style presets (`now-30d`, `now-7d`)
- **ThemeContext** (`components/ThemeToggle.tsx`): Dark/light mode toggle

### Data Caching

`lib/dataCache.ts` provides in-memory Map-based caching with TTL to reduce Supabase query load.

### Adding New Charts

1. Create YAML config in `charts/` with metadata (id, title, queryModule, viz, options)
2. Create query module in `queries/` that exports default `query({ range })` function
3. Add to `QUERIES` registry in `queries/index.ts`
4. Chart auto-appears in dashboard (no route changes needed)

### Query Module Contract

Each query module must:
- Export a default `query({ range })` function
- Accept `{ range: { from, to } }` from TimeRangeContext
- Return standardized shape: `{ stat: { value, label, date } }` or `{ series: [...] }` or `{ rows: [...] }`
- Use `timeFilter()` from `lib/time.ts` for date filtering

### Key Technologies

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Data:** Supabase (`@supabase/supabase-js`), Apache ECharts (`echarts-for-react`)
- **Styling:** Custom CSS with CSS variables (no Tailwind/CSS-in-JS)
- **Testing:** Playwright E2E

### Environment Variables

```bash
PUBLIC_SUPABASE_URL=                    # Supabase project URL
PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY= # Supabase anon key
NEXT_PUBLIC_ACCESS_PASSWORD=            # Optional: custom login password
```

Note: Next.js config maps `PUBLIC_*` to `NEXT_PUBLIC_*` for compatibility.

### Directory Structure

```
app/                    # Next.js App Router pages
components/             # React UI components
charts/                 # YAML chart configurations
queries/                # TypeScript query modules (with QUERIES registry)
lib/                    # Core utilities (serverManifest, supabaseClient, types, time, queryUtils, dataCache)
tests/                  # Playwright E2E tests
public/                 # Static assets
```

### Important Notes

- This is a **static export** build - no server components for data fetching at runtime
- Authentication is **client-side only** (appropriate for static deployment, not for sensitive data)
- All chart queries run directly from browser to Supabase (consider rate limits)
- Base path is `/community-insight` (configured in next.config.js)

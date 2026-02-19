# claude-start-cf

TanStack Start + Cloudflare Workers full-stack template. Demonstrates SSR, server functions, D1, R2, and edge deployment patterns.

## Commands

- `npm run deploy` — Build + deploy to Cloudflare Workers. **This is the primary workflow — no local dev server, deploy directly to test.**
- `npm run build` — Production build only (vite build && tsc --noEmit)
- `npm run cf-typegen` — Regenerate TypeScript types from wrangler.jsonc bindings

## Architecture

- **Runtime:** Cloudflare Workers (V8 isolates, not Node.js). Requires `nodejs_compat` flag.
- **Framework:** TanStack Start (React SSR) with TanStack Router (file-based routing)
- **Database:** Cloudflare D1 (serverless SQLite). Access via `getDB()` from `~/lib/env`
- **Storage:** Cloudflare R2 (object storage). Access via `getBucket()` from `~/lib/env`
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Content:** content-collections for build-time markdown processing

## Project Structure

- `src/routes/` — File-based routes (pages + API endpoints)
- `src/components/` — Shared React components (SiteNav, Markdown, ui/)
- `src/lib/env.ts` — `getDB()`, `getBucket()`, `getEnv()` helpers for Cloudflare bindings
- `src/utils/markdown.ts` — Unified markdown rendering pipeline
- `src/blog/` — Markdown blog posts with YAML frontmatter
- `wrangler.jsonc` — Cloudflare Workers config (bindings, vars, compatibility)
- `.dev.vars` — Local dev secrets (gitignored)

## Key Patterns

**Server functions (RPC):** Use `createServerFn()` for all server-side logic. Access D1/R2 inside handlers only. Never put secrets in loaders directly.

**Environment variables:** `VITE_` prefix = client-visible. No prefix = server-only via `process.env`. Cloudflare secrets via `wrangler secret put`.

**Demo pages:** Each route in `src/routes/` is a standalone demo page using local `DemoCard` and `CodeBlock` components. Follow the pattern in `llmo.tsx` or `seo.tsx` for new pages.

**Adding a new demo page:**
1. Create `src/routes/my-page.tsx` with `createFileRoute`, `DemoCard`, `CodeBlock`
2. Add to `src/routes/index.tsx` categories array (icon from lucide-react)
3. Add to `src/components/SiteNav.tsx` categories array
4. Mobile nav auto-includes via `allLinks = categories.flatMap()`

## File Conventions

- `*.functions.ts` — Server function definitions, importable anywhere
- `*.server.ts` — Server-only helpers, import inside handlers only (tree-shaken from client)
- `feed[.]json.ts` — Escaped dot in filename → `/feed.json` route
- `api/users/$id.ts` — Dynamic route segment
- `api/file/$.ts` — Splat/catch-all route

## Live Site

https://claude-start-cf.jmorrison.workers.dev

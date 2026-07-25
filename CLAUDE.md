# claude-start-cf

TanStack Start + Cloudflare Workers full-stack template. Demonstrates SSR, server functions, D1, R2, and edge deployment patterns.

## Workflow

- Always deploy after completing updates: `npm run deploy`
- No local dev server — deploy directly to test

## Commands

- `npm run deploy` — Build + deploy to Cloudflare Workers
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
- `src/components/` — Shared React components (SiteNav, Markdown, demo.tsx, ui/)
- `src/lib/env.ts` — `getDB()`, `getBucket()`, `getEnv()` helpers for Cloudflare bindings
- `src/lib/site.ts` — `SITE_URL` and the `pageHead()` SEO helper
- `src/lib/nav.ts` — Single source of truth for nav/homepage categories
- `src/utils/markdown.ts` — Unified markdown rendering pipeline
- `src/blog/` — Markdown blog posts with YAML frontmatter
- `wrangler.jsonc` — Cloudflare Workers config (bindings, vars, compatibility)
- `.dev.vars` — Local dev secrets (gitignored)

## Key Patterns

**Server functions (RPC):** Use `createServerFn()` for all server-side logic. Access D1/R2 inside handlers only. Never put secrets in loaders directly.

**Environment variables:** `VITE_` prefix = client-visible. No prefix = server-only via `process.env`. Cloudflare secrets via `wrangler secret put`.

**Self-fetch:** A Worker cannot `fetch()` its own hostname (Cloudflare blocks it). Use the self-referencing `SELF` service binding in wrangler.jsonc instead: `getEnv().SELF.fetch(url)`. See the head inspector in `src/routes/seo.tsx`.

**SSR module resolution:** The Workers build resolves npm packages with the `browser` condition, so packages that ship separate browser/server builds can load DOM-dependent code on the server and break SSR (React falls back to client rendering, shipping an empty body). `vite.config.ts` has a plugin forcing `html-dom-parser` to its server build; follow that pattern for similar packages.

**Demo pages:** Each route in `src/routes/` is a demo page built from the shared `DemoCard` and `CodeBlock` components in `src/components/demo.tsx`. Follow the pattern in `llmo.tsx` or `seo.tsx` for new pages.

**Adding a new demo page:**
1. Create `src/routes/my-page.tsx` with `createFileRoute`, `DemoCard`, `CodeBlock`, and a `head()` built with `pageHead()` from `~/lib/site`
2. Add one entry to the categories array in `src/lib/nav.ts` (icon from lucide-react) — the homepage grid, desktop nav, and mobile nav all read from it
3. Add the path to `staticRoutes` in `src/routes/sitemap[.]xml.ts`

**Mobile layout rules for demo pages** (keep pages from overflowing on phones):
- Code samples go in `CodeBlock`; any raw `<pre>` needs `overflow-x-auto`
- Text inputs in `flex` rows need `min-w-0` alongside `flex-1` (inputs have a large intrinsic min width)
- Key/value rows showing long values (timestamps, user agents, keys) need `break-all` on the value and `shrink-0` on the label
- Wide tables go inside an `overflow-x-auto` wrapper

## File Conventions

- `*.functions.ts` — Server function definitions, importable anywhere
- `*.server.ts` — Server-only helpers, import inside handlers only (tree-shaken from client)
- `feed[.]json.ts` — Escaped dot in filename → `/feed.json` route
- `api/users/$id.ts` — Dynamic route segment
- `api/file/$.ts` — Splat/catch-all route

## Live Site

https://claude-start-cf.jmorrison.workers.dev

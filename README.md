# TanStack Start + Cloudflare Workers Template

A production-ready full-stack React template running on Cloudflare Workers with D1, R2, and SSR out of the box.

**[Live Demo](https://claude-start-cf.jmorrison.workers.dev)**

## What's Included

- **TanStack Start** — React SSR framework with file-based routing, server functions, and streaming
- **TanStack Router** — Type-safe routing with loaders, search params, and code splitting
- **Cloudflare Workers** — Edge-first serverless runtime (V8 isolates, global deployment)
- **Cloudflare D1** — Serverless SQLite database at the edge
- **Cloudflare R2** — S3-compatible object storage with zero egress fees
- **shadcn/ui** — Tailwind CSS v4 components
- **TypeScript** — Full type safety across client and server
- **Content Collections** — Build-time markdown/MDX processing for blogs

## Feature Demos

Every pattern has a working demo page with code examples:

| Demo | What it covers |
|------|---------------|
| [Execution Model](https://claude-start-cf.jmorrison.workers.dev/execution) | SSR vs client rendering, server functions, isomorphic functions, hydration |
| [Environment Variables](https://claude-start-cf.jmorrison.workers.dev/env) | VITE_ client vars, server-only vars, wrangler secrets, .dev.vars |
| [Server Functions](https://claude-start-cf.jmorrison.workers.dev/server-fns) | RPC pattern, input validation, FormData, error handling, file organization |
| [API Routes](https://claude-start-cf.jmorrison.workers.dev/server-routes) | GET/POST handlers, dynamic params, splat routes, when to use vs server fns |
| [D1 Database](https://claude-start-cf.jmorrison.workers.dev/d1) | CRUD operations, parameterized queries, migrations, schema introspection |
| [R2 Storage](https://claude-start-cf.jmorrison.workers.dev/r2) | File uploads, image gallery, object listing, metadata, serving files |
| [Markdown](https://claude-start-cf.jmorrison.workers.dev/markdown) | Static (content-collections) and dynamic rendering, TOC extraction |
| [SEO](https://claude-start-cf.jmorrison.workers.dev/seo) | Meta tags, Open Graph, JSON-LD structured data, sitemaps, robots.txt |
| [LLMO](https://claude-start-cf.jmorrison.workers.dev/llmo) | LLM optimization, llms.txt, schema.org, AI discoverability |
| [Deploy](https://claude-start-cf.jmorrison.workers.dev/deploy) | Wrangler setup, D1/R2 creation, secrets, deployment workflow |

## Quick Start

### Prerequisites

- Node.js 22.12+ (required by Vite 7 and Wrangler 4)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Setup

```sh
# Clone the template
npx degit morrisonak/claude-start-cf my-app
cd my-app

# Install dependencies
npm install

# Create Cloudflare resources
wrangler d1 create my-db
wrangler r2 bucket create my-bucket

# Update wrangler.jsonc with your database_id and bucket name

# Deploy
npm run deploy
```

### Commands

```sh
npm run deploy       # Build + deploy to Cloudflare Workers
npm run build        # Production build (Vite + TypeScript check)
npm run dev          # Local dev server with Miniflare
npm run cf-typegen   # Regenerate TypeScript types from wrangler.jsonc
```

## Project Structure

```
src/
├── routes/           # File-based routes (pages + API endpoints)
│   ├── __root.tsx    # Root layout, global meta tags, JSON-LD
│   ├── index.tsx     # Home page
│   ├── d1.tsx        # D1 database demo
│   ├── r2.tsx        # R2 storage demo
│   ├── llms[.]txt.ts # Machine-readable site summary
│   └── api/          # API-only routes
├── components/       # Shared React components
│   ├── SiteNav.tsx   # Navigation with desktop/mobile support
│   ├── Markdown.tsx  # Markdown renderer with custom link handling
│   └── ui/           # shadcn/ui components
├── lib/
│   └── env.ts        # getDB(), getBucket(), getEnv() helpers
├── utils/
│   └── markdown.ts   # Unified markdown rendering pipeline
└── blog/             # Markdown blog posts with YAML frontmatter

wrangler.jsonc        # Cloudflare Workers config (bindings, vars)
.dev.vars             # Local dev secrets (gitignored)
.env                  # VITE_ build-time vars (gitignored)
.env.example          # Template showing required variables
```

## Key Patterns

### Server Functions (RPC)

```ts
import { createServerFn } from '@tanstack/react-start'
import { getDB } from '~/lib/env'

const listUsers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDB()
    const { results } = await db.prepare('SELECT * FROM users').all()
    return results
  })
```

Runs on the server. Called from the client as a fetch request. Type-safe end to end.

### D1 Database Access

```ts
const db = getDB()
await db.prepare('INSERT INTO items (name) VALUES (?)').bind(name).run()
const { results } = await db.prepare('SELECT * FROM items').all<Item>()
```

### R2 Object Storage

```ts
const bucket = getBucket()
await bucket.put('uploads/photo.png', bytes, {
  httpMetadata: { contentType: 'image/png' },
})
const obj = await bucket.get('uploads/photo.png')
```

### Environment Variables

```
wrangler.jsonc vars  → Non-secret config (committed)
wrangler secret put  → Production secrets (encrypted)
.dev.vars            → Local dev secrets (gitignored)
.env                 → VITE_ build-time vars only (gitignored)
```

## Configuration

### wrangler.jsonc

```jsonc
{
  "name": "my-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "vars": {
    "APP_ENVIRONMENT": "production"
  },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "my-db",
    "database_id": "your-database-id"
  }],
  "r2_buckets": [{
    "binding": "BUCKET",
    "bucket_name": "my-bucket"
  }],
  // Lets the Worker call its own routes (Workers can't fetch their own hostname)
  "services": [{
    "binding": "SELF",
    "service": "my-app"
  }]
}
```

## Workers Gotchas

Two edge-runtime issues this template already solves, worth knowing when you build on it:

- **A Worker cannot `fetch()` its own public hostname.** Cloudflare blocks self-requests, so anything that needs to call one of your own routes server-side (like the SEO head inspector) must go through a self-referencing service binding: `getEnv().SELF.fetch(url)`. The `services` entry in `wrangler.jsonc` points the binding at the Worker itself.
- **The Workers build resolves npm packages with the `browser` condition.** Packages that ship separate browser and server builds can end up running DOM-dependent code during SSR, which silently breaks server rendering (React recovers by client rendering, so pages look fine but crawlers get an empty body). `vite.config.ts` includes a small plugin that forces `html-dom-parser` (used by `html-react-parser`) to its server build in the SSR environment; use the same pattern if another dependency hits this.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Runtime | [Cloudflare Workers](https://workers.cloudflare.com) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) |
| Storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Build | [Vite](https://vite.dev) |
| Content | [content-collections](https://www.content-collections.dev) |

## License

MIT

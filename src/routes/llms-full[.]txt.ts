import { createFileRoute } from '@tanstack/react-router'
import { allPosts } from 'content-collections'

import { SITE_URL } from '~/lib/site'

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () => {
        const postList = allPosts
          .sort(
            (a, b) =>
              new Date(b.published).getTime() -
              new Date(a.published).getTime(),
          )
          .map(
            (p) =>
              `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description || ''}`,
          )
          .join('\n')

        const content = `# claude-start-cf — Full Documentation

> A base template for building full-stack apps on the edge with TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.

## About

claude-start-cf is a starter template for building full-stack React applications on Cloudflare Workers. It uses TanStack Start for server-side rendering and file-based routing, Cloudflare D1 for SQLite at the edge, Cloudflare R2 for object storage, and shadcn/ui for components. Every pattern is demonstrated with working code.

## Tech Stack

- TanStack Start — React SSR framework built on TanStack Router and Vite
- TanStack Router — type-safe, file-based routing
- Cloudflare Workers — serverless edge runtime (V8 isolates, not Node.js)
- Cloudflare D1 — serverless SQLite database replicated globally
- Cloudflare R2 — S3-compatible object storage with zero egress fees
- Tailwind CSS v4 with shadcn/ui components
- TypeScript with full type safety across client and server

## Feature Demos

- [Home](${SITE_URL}/): Landing page with categorized demo links
- [Execution Model](${SITE_URL}/execution): Server functions, isomorphic functions, client-only, SSR
- [Environment Variables](${SITE_URL}/env): Client vs server vars, Cloudflare secrets
- [Server Functions](${SITE_URL}/server-fns): RPC, validation, FormData, error handling
- [API Routes](${SITE_URL}/server-routes): GET/POST handlers, dynamic params
- [D1 Database](${SITE_URL}/d1): SQLite at the edge, CRUD operations
- [R2 Storage](${SITE_URL}/r2): Object storage, image upload, gallery
- [Markdown](${SITE_URL}/markdown): Static (content-collections) and dynamic rendering
- [SEO](${SITE_URL}/seo): Head management, Open Graph, JSON-LD, sitemaps
- [LLMO](${SITE_URL}/llmo): LLM optimization, structured data, llms.txt
- [Deploy](${SITE_URL}/deploy): Setup, configuration, and deployment guide

## Blog

${postList}

---

## Execution Model

TanStack Start has four execution boundaries:

**createServerFn()** — RPC functions that always run on the server. On the server they execute directly. On the client they become fetch requests to an auto-generated endpoint. Use these for database access, secret handling, and server-only logic.

\`\`\`ts
const getUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDB()
    return db.prepare('SELECT * FROM users').all()
  })
\`\`\`

**createServerOnlyFn()** — Hard server boundary. Throws an error if called from client code. Use for operations that must never leak to the browser.

**createClientOnlyFn()** — Only runs in the browser. Use for window/document APIs, localStorage, browser-only libraries.

**createIsomorphicFn()** — Provides different implementations per environment:

\`\`\`ts
const getTimestamp = createIsomorphicFn()
  .server(() => process.hrtime.bigint().toString())
  .client(() => performance.now().toString())
\`\`\`

**ClientOnly component** — Renders children only after hydration. Use for components that depend on browser APIs.

**useHydrated() hook** — Returns false during SSR, true after hydration. Use to conditionally render browser-dependent content.

**Loaders** — Route loaders are isomorphic (run on both server and client). Delegate to server functions when accessing secrets or databases. Never put secrets directly in loaders.

---

## Environment Variables

Three layers of environment variable access:

**Client variables (VITE_ prefix):** Statically replaced at build time by Vite. Bundled with client code and visible to everyone. Use for public config only.

\`\`\`ts
const apiUrl = import.meta.env.VITE_API_URL
\`\`\`

**Server variables (no prefix):** Only accessible inside server functions via process.env. Stripped from the client bundle automatically by Vite.

\`\`\`ts
const secret = createServerFn({ method: 'GET' })
  .handler(async () => {
    const key = process.env.API_KEY // only available here
    return fetchData(key)
  })
\`\`\`

**Cloudflare bindings:** Accessed via the env helper. Includes D1 databases, R2 buckets, KV namespaces, and other Workers bindings.

\`\`\`ts
import { getDB, getBucket, getEnv } from '~/lib/env'
\`\`\`

**Cloudflare Workers config sources (in order of precedence):**
- wrangler.jsonc "vars" — non-secret config, committed to repo
- \`wrangler secret put\` — production secrets, encrypted, never in repo
- .dev.vars — local dev secrets, gitignored, loaded by Miniflare
- .env — Vite build-time vars only (VITE_ prefix), not used at Workers runtime

---

## Server Functions (RPC)

Server functions are the primary way to run server-side logic. They use an RPC pattern — define once, call from anywhere.

**Basic pattern:**

\`\`\`ts
const listItems = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDB()
    const { results } = await db.prepare('SELECT * FROM items').all<Item>()
    return results
  })
\`\`\`

**With input validation:**

\`\`\`ts
const createItem = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    await db.prepare('INSERT INTO items (name) VALUES (?)').bind(data.name).run()
  })
\`\`\`

**Request context:** Access request/response via getRequest(), getRequestHeader(), setResponseHeaders().

**Error handling:** Throw Error for 500, redirect() for redirects, notFound() for 404.

**FormData handling:** Parse FormData in validators for progressive enhancement (forms work without JS).

**useServerFn() hook:** Wraps server functions for component use with pending states.

**File organization:**
- \`*.functions.ts\` — Server function definitions, importable anywhere
- \`*.server.ts\` — Server-only helpers, only import inside handler blocks
- Build tree-shakes .server.ts from client bundle automatically

---

## API Routes (Server Routes)

Raw HTTP endpoints for webhooks, file serving, and external APIs. Routes can have both a component and server handlers.

\`\`\`ts
export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json({ message: 'hello' })
      },
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ received: body })
      },
    },
  },
})
\`\`\`

**File conventions:**
- api/hello.ts → /api/hello
- api/users/$id.ts → /api/users/:id (dynamic segment)
- api/file/$.ts → /api/file/* (splat/catch-all)
- feed[.]json.ts → /feed.json (escaped dot)

**When to use API routes vs server functions:**
- API routes: webhooks, file downloads, third-party integrations, raw HTTP control
- Server functions: typed RPC from your own frontend, form handlers

---

## D1 Database (SQLite at the Edge)

Cloudflare D1 is serverless SQLite replicated globally.

**Setup:**

\`\`\`sh
wrangler d1 create acme-db
# Add binding to wrangler.jsonc under d1_databases
wrangler types  # regenerate TypeScript types
\`\`\`

**Access pattern:**

\`\`\`ts
import { getDB } from '~/lib/env'

const listUsers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDB()
    const { results } = await db
      .prepare('SELECT * FROM users ORDER BY created_at DESC')
      .all<User>()
    return results
  })
\`\`\`

**Key APIs:**
- db.prepare(sql).bind(...params).run() — execute writes (INSERT, UPDATE, DELETE)
- db.prepare(sql).bind(...params).all<T>() — read rows with typed results
- db.prepare(sql).bind(...params).first<T>() — read single row
- Always use parameterized queries (.bind()) to prevent SQL injection
- CREATE TABLE IF NOT EXISTS for auto-initialization

**Migrations:**

\`\`\`sh
wrangler d1 migrations apply acme-db --remote
\`\`\`

---

## R2 Object Storage

Cloudflare R2 is S3-compatible object storage with zero egress fees.

**Setup:**

\`\`\`sh
wrangler r2 bucket create acme-bucket
# Add binding to wrangler.jsonc under r2_buckets
wrangler types
\`\`\`

**Access pattern:**

\`\`\`ts
import { getBucket } from '~/lib/env'

// Upload
const bucket = getBucket()
await bucket.put(key, content, {
  httpMetadata: { contentType: 'image/png' },
})

// Download
const obj = await bucket.get(key)
const data = await obj.text() // or .json(), .arrayBuffer()

// List
const listed = await bucket.list({ prefix: 'images/', limit: 100 })

// Delete
await bucket.delete(key)

// Metadata only
const head = await bucket.head(key)
\`\`\`

**Client upload pattern:** File → FileReader → base64 on client → decode to Uint8Array on server → bucket.put()

**Serving files:** Create an API route that calls bucket.get() and returns a Response with the correct Content-Type header.

---

## Markdown Rendering

Two rendering modes:

**Static (build-time):** content-collections processes markdown files in src/blog/ at build time. Import with \`import { allPosts } from 'content-collections'\`. Zero runtime cost.

**Dynamic (runtime):** Server function renders markdown via unified pipeline: remark-parse → remark-gfm → remark-rehype → rehype-slug → rehype-autolink-headings → rehype-stringify. Returns HTML string + heading array for table of contents.

**Component rendering:** \`<Markdown markup={htmlString} />\` using html-react-parser with custom handling — internal links become TanStack Router \`<Link>\` components, images get lazy loading.

**Blog frontmatter schema:**

\`\`\`yaml
title: Post Title
published: 2025-01-15
authors:
  - Author Name
description: Brief summary
\`\`\`

---

## SEO

Every route can define a head() function returning meta tags, links, and scripts. Tags merge from root → parent → child (child overrides).

**Key patterns:**
- title and description meta tags on every page
- Open Graph tags (og:type, og:title, og:description, og:image)
- Twitter card meta tags
- Canonical URLs for duplicate prevention
- JSON-LD structured data (WebSite, Article, FAQPage schemas)
- Sitemap at /sitemap.xml
- robots.txt at /robots.txt
- SSR ensures crawlers see fully rendered HTML

---

## LLMO (LLM Optimization)

Patterns for AI assistant discoverability:

- Structured data with schema.org types (WebSite, Article, FAQPage)
- llms.txt endpoint for machine-readable site summary
- llms-full.txt (this document) for comprehensive content
- Clear heading hierarchy and self-contained paragraphs
- Author attribution metadata
- FAQ schema for Q&A extraction

**SEO vs LLMO:** SEO optimizes for search engine crawlers and ranking. LLMO optimizes for LLM training data pipelines and retrieval-augmented generation (RAG). Clear structure and good metadata help both.

---

## Deployment

**Prerequisites:** Node.js, Cloudflare account, wrangler CLI (\`npm install -g wrangler && wrangler login\`)

**Configuration (wrangler.jsonc):**

\`\`\`jsonc
{
  "name": "claude-start-cf",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "vars": { "APP_ENVIRONMENT": "production" },
  "d1_databases": [{ "binding": "DB", "database_name": "acme-db", "database_id": "..." }],
  "r2_buckets": [{ "binding": "BUCKET", "bucket_name": "acme-bucket" }]
}
\`\`\`

**Deploy:** \`npm run deploy\` runs \`vite build && tsc --noEmit && wrangler deploy\`. Uploads worker bundle + static assets to Cloudflare's edge network.

**Local dev:** \`npm run dev\` starts Vite dev server with Cloudflare plugin (Miniflare). Provides local D1/R2 in .wrangler/ directory. Secrets loaded from .dev.vars.

**Type generation:** Run \`npm run cf-typegen\` after changing wrangler.jsonc to regenerate TypeScript types for bindings.

---

## Project Structure

- src/routes/ — File-based routes (pages + API endpoints)
- src/components/ — Shared React components
- src/lib/env.ts — getDB(), getBucket(), getEnv() helpers
- src/utils/markdown.ts — Markdown rendering pipeline
- src/blog/ — Markdown blog posts with frontmatter
- wrangler.jsonc — Cloudflare Workers configuration
- .dev.vars — Local development secrets (gitignored)

## Links

- Site: ${SITE_URL}
- Short summary: ${SITE_URL}/llms.txt
`

        return new Response(content, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  },
})

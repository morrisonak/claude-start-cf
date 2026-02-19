---
title: Building on Cloudflare Workers
published: 2025-02-01
authors:
  - claude-start-cf
description: How we use D1, environment bindings, and server functions on the edge.
---

Cloudflare Workers give us a serverless edge runtime that pairs naturally with TanStack Start's server functions.

## Edge-Native Data Access

Every server function in this app can access Cloudflare bindings — D1 databases, R2 storage, KV stores — through a simple helper:

```ts
import { getDB } from '~/lib/env'

const db = getDB()
const { results } = await db
  .prepare('SELECT * FROM notes ORDER BY id DESC')
  .all()
```

The `getDB()` helper wraps `import { env } from 'cloudflare:workers'`, giving us typed access to all bindings declared in `wrangler.jsonc`.

## Environment Variables

There are three layers of configuration on Workers:

| Source | Access | Encrypted | Use Case |
|--------|--------|-----------|----------|
| `wrangler.jsonc` vars | `process.env` | No | Non-secret config |
| `wrangler secret put` | `process.env` | Yes | API keys, tokens |
| `.env` / `VITE_` prefix | `import.meta.env` | No | Client-side config |

## Server Functions as RPC

TanStack Start's `createServerFn` compiles into RPC endpoints. On the client, calling `listNotes()` triggers a `fetch()` to the server handler. On the server (SSR), it calls the handler directly — no network hop.

```ts
const listNotes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const db = getDB()
    const { results } = await db
      .prepare('SELECT * FROM notes')
      .all()
    return results
  })
```

This pattern means you write one function and it works optimally in both contexts.

## Deploy Workflow

No dev server — we deploy directly:

```bash
npm run deploy  # → npm run build && wrangler deploy
```

Every change goes straight to the edge. Fast iteration, production-grade from the start.

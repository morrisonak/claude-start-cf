
export default [
  {
    "title": "Building on Cloudflare Workers",
    "published": "2025-02-01",
    "description": undefined,
    "authors": [
      "claude-start-cf"
    ],
    "_meta": {
      "filePath": "building-with-cloudflare.md",
      "fileName": "building-with-cloudflare.md",
      "directory": ".",
      "extension": "md",
      "path": "building-with-cloudflare"
    },
    "slug": "building-with-cloudflare",
    "excerpt": "Cloudflare Workers give us a serverless edge runtime that pairs naturally with TanStack Start's server functions.\n\n## Edge-Native Data Access\n\nEvery server function in this app can access Cloudflare bindings — D1 databases, R2 storage, KV stores — through a simple helper:\n\n```ts\nimport { getDB } from '~/lib/env'\n\nconst db = getDB()\nconst { results } = await db\n  .prepare('SELECT * FROM notes ORDER BY id DESC')\n  .all()\n```\n\nThe `getDB()` helper wraps `import { env } from 'cloudflare:workers'`, giving us typed access to all bindings declared in `wrangler.jsonc`.\n\n## Environment Variables\n\nThere are three layers of configuration on Workers:\n\n| Source | Access | Encrypted | Use Case |\n|",
    "headerImage": undefined,
    "content": "Cloudflare Workers give us a serverless edge runtime that pairs naturally with TanStack Start's server functions.\n\n## Edge-Native Data Access\n\nEvery server function in this app can access Cloudflare bindings — D1 databases, R2 storage, KV stores — through a simple helper:\n\n```ts\nimport { getDB } from '~/lib/env'\n\nconst db = getDB()\nconst { results } = await db\n  .prepare('SELECT * FROM notes ORDER BY id DESC')\n  .all()\n```\n\nThe `getDB()` helper wraps `import { env } from 'cloudflare:workers'`, giving us typed access to all bindings declared in `wrangler.jsonc`.\n\n## Environment Variables\n\nThere are three layers of configuration on Workers:\n\n| Source | Access | Encrypted | Use Case |\n|--------|--------|-----------|----------|\n| `wrangler.jsonc` vars | `process.env` | No | Non-secret config |\n| `wrangler secret put` | `process.env` | Yes | API keys, tokens |\n| `.env` / `VITE_` prefix | `import.meta.env` | No | Client-side config |\n\n## Server Functions as RPC\n\nTanStack Start's `createServerFn` compiles into RPC endpoints. On the client, calling `listNotes()` triggers a `fetch()` to the server handler. On the server (SSR), it calls the handler directly — no network hop.\n\n```ts\nconst listNotes = createServerFn({ method: 'GET' })\n  .handler(async () => {\n    const db = getDB()\n    const { results } = await db\n      .prepare('SELECT * FROM notes')\n      .all()\n    return results\n  })\n```\n\nThis pattern means you write one function and it works optimally in both contexts.\n\n## Deploy Workflow\n\nNo dev server — we deploy directly:\n\n```bash\nnpm run deploy  # → npm run build && wrangler deploy\n```\n\nEvery change goes straight to the edge. Fast iteration, production-grade from the start."
  },
  {
    "title": "Hello World",
    "published": "2025-01-15",
    "description": undefined,
    "authors": [
      "claude-start-cf"
    ],
    "_meta": {
      "filePath": "hello-world.md",
      "fileName": "hello-world.md",
      "directory": ".",
      "extension": "md",
      "path": "hello-world"
    },
    "slug": "hello-world",
    "excerpt": "",
    "headerImage": undefined,
    "content": "Welcome to the claude-start-cf blog! This post is loaded from a **local markdown file** via `content-collections` at build time.\n\n## The Stack\n\nThis app is built with:\n\n- **TanStack Start** — full-stack React framework with SSR\n- **Cloudflare Workers** — edge runtime with D1, R2, KV\n- **Tailwind CSS v4** — utility-first styling with oklch colors\n- **shadcn/ui** — accessible component primitives\n\n## How This Post Works\n\nBlog posts live in `src/blog/` as `.md` files with YAML frontmatter. The `content-collections` Vite plugin processes them at build time, giving us:\n\n1. **Type-safe access** to frontmatter fields (title, published, authors)\n2. **Build-time validation** via Zod schemas\n3. **Zero runtime overhead** — content is already bundled\n\nThe markdown body is rendered at request time using the `unified` pipeline (remark → rehype → HTML), then converted to React elements with `html-react-parser`.\n\n## Code Example\n\nHere's how you access posts in a route loader:\n\n```ts\nimport { allPosts } from 'content-collections'\n\nconst sorted = allPosts.sort(\n  (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()\n)\n```\n\n## What's Next\n\nCheck out the [Markdown demo](/markdown) page to see both static and dynamic markdown rendering patterns."
  }
]
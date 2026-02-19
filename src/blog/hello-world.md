---
title: Hello World
published: 2025-01-15
authors:
  - claude-start-cf
description: The first post on our blog — a quick intro to the stack.
---

Welcome to the claude-start-cf blog! This post is loaded from a **local markdown file** via `content-collections` at build time.

## The Stack

This app is built with:

- **TanStack Start** — full-stack React framework with SSR
- **Cloudflare Workers** — edge runtime with D1, R2, KV
- **Tailwind CSS v4** — utility-first styling with oklch colors
- **shadcn/ui** — accessible component primitives

## How This Post Works

Blog posts live in `src/blog/` as `.md` files with YAML frontmatter. The `content-collections` Vite plugin processes them at build time, giving us:

1. **Type-safe access** to frontmatter fields (title, published, authors)
2. **Build-time validation** via Zod schemas
3. **Zero runtime overhead** — content is already bundled

The markdown body is rendered at request time using the `unified` pipeline (remark → rehype → HTML), then converted to React elements with `html-react-parser`.

## Code Example

Here's how you access posts in a route loader:

```ts
import { allPosts } from 'content-collections'

const sorted = allPosts.sort(
  (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
)
```

## What's Next

Check out the [Markdown demo](/markdown) page to see both static and dynamic markdown rendering patterns.

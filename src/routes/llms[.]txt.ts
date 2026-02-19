import { createFileRoute } from '@tanstack/react-router'
import { allPosts } from 'content-collections'

const SITE_URL = 'https://claude-start-cf.jmorrison.workers.dev'

export const Route = createFileRoute('/llms.txt')({
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

        const content = `# claude-start-cf

> A base template for building full-stack apps on the edge with TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.

## About
claude-start-cf is a starter template designed for AI-assisted development. It demonstrates TanStack Start patterns including server functions, file-based routing, server-side rendering, and Cloudflare Workers bindings (D1 database, R2 object storage, KV, environment variables).

## Feature Demos
- [Home](${SITE_URL}/): Landing page
- [Execution Model](${SITE_URL}/execution): Server functions, isomorphic functions, client-only, SSR
- [Environment Variables](${SITE_URL}/env): Client vs server vars, Cloudflare secrets
- [Server Functions](${SITE_URL}/server-fns): RPC, validation, FormData, error handling
- [API Routes](${SITE_URL}/server-routes): GET/POST handlers, dynamic params
- [D1 Database](${SITE_URL}/d1): SQLite at the edge, CRUD operations
- [R2 Storage](${SITE_URL}/r2): Object storage, image upload, gallery
- [Markdown](${SITE_URL}/markdown): Static (content-collections) and dynamic (GitHub) rendering
- [SEO](${SITE_URL}/seo): Head management, Open Graph, JSON-LD, sitemaps
- [LLMO](${SITE_URL}/llmo): LLM optimization, structured data, llms.txt

## Blog
${postList}

## Tech Stack
- TanStack Start (React SSR framework)
- TanStack Router (file-based routing)
- Cloudflare Workers (edge runtime)
- Cloudflare D1 (serverless SQLite)
- Cloudflare R2 (object storage)
- Tailwind CSS v4 with shadcn/ui
- TypeScript

## Links
- Site: ${SITE_URL}
- Full documentation: ${SITE_URL}/llms-full.txt
`

        return new Response(content, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  },
})

// ---------------------------------------------------------------------------
// Basic server route — GET and POST on /api/hello
// Returns plain text for GET, JSON for POST.
// ---------------------------------------------------------------------------
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const name = url.searchParams.get('name') || 'World'
        return new Response(`Hello, ${name}!`, {
          headers: { 'Content-Type': 'text/plain' },
        })
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as { name?: string }
        return Response.json({
          message: `Hello, ${body.name || 'World'}!`,
          receivedAt: new Date().toISOString(),
        })
      },
    },
  },
})

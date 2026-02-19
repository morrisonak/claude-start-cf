// ---------------------------------------------------------------------------
// Echo server route — POST to /api/echo
// Returns the request body, headers, and method back as JSON.
// Demonstrates reading request data and setting response headers.
// ---------------------------------------------------------------------------
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/echo')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get('content-type') || ''
        let body: unknown

        if (contentType.includes('application/json')) {
          body = await request.json()
        } else if (contentType.includes('text/')) {
          body = await request.text()
        } else {
          body = '(binary or unsupported content type)'
        }

        return Response.json(
          {
            method: request.method,
            url: request.url,
            contentType,
            body,
            echoedAt: new Date().toISOString(),
          },
          {
            headers: {
              'X-Echoed-By': 'server-route',
              'Cache-Control': 'no-store',
            },
          },
        )
      },
    },
  },
})

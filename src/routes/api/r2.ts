import { createFileRoute } from '@tanstack/react-router'
import { getBucket } from '~/lib/env'
import { isDemoKey } from '~/lib/demo-limits'

export const Route = createFileRoute('/api/r2')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const key = url.searchParams.get('key')

        if (!key) {
          return Response.json({ error: 'Missing key parameter' }, { status: 400 })
        }

        // Only serve objects created by the public demos
        if (!isDemoKey(key)) {
          return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const bucket = getBucket()
        const obj = await bucket.get(key)

        if (!obj) {
          return Response.json({ error: 'Not found' }, { status: 404 })
        }

        const headers = {
          'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
          'ETag': obj.httpEtag,
        }

        if (request.headers.get('If-None-Match') === obj.httpEtag) {
          return new Response(null, { status: 304, headers })
        }

        return new Response(obj.body, { headers })
      },
    },
  },
})

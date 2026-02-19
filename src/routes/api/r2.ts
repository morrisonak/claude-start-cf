import { createFileRoute } from '@tanstack/react-router'
import { getBucket } from '~/lib/env'

export const Route = createFileRoute('/api/r2')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const key = url.searchParams.get('key')

        if (!key) {
          return Response.json({ error: 'Missing key parameter' }, { status: 400 })
        }

        const bucket = getBucket()
        const obj = await bucket.get(key)

        if (!obj) {
          return Response.json({ error: 'Not found' }, { status: 404 })
        }

        return new Response(obj.body, {
          headers: {
            'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600',
            'ETag': obj.httpEtag,
          },
        })
      },
    },
  },
})

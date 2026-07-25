import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '~/lib/site'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`

        return new Response(robots, {
          headers: { 'Content-Type': 'text/plain' },
        })
      },
    },
  },
})

import { createFileRoute } from '@tanstack/react-router'

const SITE_URL = 'https://claude-start-cf.jmorrison.workers.dev'

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

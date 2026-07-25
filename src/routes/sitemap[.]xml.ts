import { createFileRoute } from '@tanstack/react-router'
import { allPosts } from 'content-collections'
import { SITE_URL } from '~/lib/site'

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/posts', changefreq: 'monthly', priority: '0.5' },
  { path: '/deploy', changefreq: 'monthly', priority: '0.5' },
  { path: '/execution', changefreq: 'monthly', priority: '0.5' },
  { path: '/env', changefreq: 'monthly', priority: '0.5' },
  { path: '/server-fns', changefreq: 'monthly', priority: '0.5' },
  { path: '/server-routes', changefreq: 'monthly', priority: '0.5' },
  { path: '/d1', changefreq: 'monthly', priority: '0.5' },
  { path: '/r2', changefreq: 'monthly', priority: '0.5' },
  { path: '/markdown', changefreq: 'monthly', priority: '0.5' },
  { path: '/seo', changefreq: 'monthly', priority: '0.5' },
  { path: '/llmo', changefreq: 'monthly', priority: '0.5' },
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const postUrls = allPosts.map(
          (post) => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.published).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
        )

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n')}
${postUrls.join('\n')}
</urlset>`

        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})

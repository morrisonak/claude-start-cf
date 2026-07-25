import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard, CodeBlock } from '~/components/demo'
import { getEnv } from '~/lib/env'
import { pageHead, SITE_URL } from '~/lib/site'
import {
  Search,
  FileText,
  Globe,
  Code,
  FolderTree,
  ExternalLink,
  MapIcon,
  Bot,
  Tag,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Server function to inspect the head tags on any route
// ---------------------------------------------------------------------------
const fetchHead = createServerFn({ method: 'GET' })
  .inputValidator((data: { path: string }) => {
    const path = data.path.trim()
    if (!path.startsWith('/') || path.startsWith('//')) {
      throw new Error('Path must start with /')
    }
    return { path }
  })
  .handler(async ({ data }) => {
    // A Worker cannot fetch() its own public hostname, so route the
    // request through the SELF service binding (see wrangler.jsonc).
    const res = await getEnv().SELF.fetch(`${SITE_URL}${data.path}`)
    const html = await res.text()

    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
    if (!headMatch) return { html: `Could not extract <head> (status ${res.status})` }

    return { html: headMatch[1].trim() }
  })

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/seo')({
  head: () =>
    pageHead({
      title: 'SEO — claude-start-cf Template',
      description:
        'Technical SEO patterns for TanStack Start: head management, Open Graph, JSON-LD, sitemaps, and robots.txt.',
      path: '/seo',
    }),
  component: SeoPage,
})

function SeoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO</h1>
          <p className="mt-2 text-muted-foreground">
            Technical SEO patterns using TanStack Start's{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
              head
            </code>{' '}
            property on routes. SSR ensures crawlers receive fully rendered HTML
            with all meta tags.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <HeadBasicsDemo />
          <OpenGraphDemo />
          <JsonLdDemo />
          <SitemapDemo />
          <RobotsTxtDemo />
          <HeadInspectorDemo />
          <ChecklistDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function HeadBasicsDemo() {
  return (
    <DemoCard
      icon={<Tag className="h-5 w-5" />}
      title="Document head management"
      file="head() on createFileRoute / createRootRoute"
      description="Every route can define a head() function that returns meta tags, link tags, and scripts. Tags merge from root → parent → child, with child routes overriding parent values."
    >
      <div className="space-y-3">
        <CodeBlock
          code={`// Root route — sets defaults for all pages
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'claude-start-cf — TanStack Start + Cloudflare Template' },
      { name: 'description', content: 'A base template for...' },
      { property: 'og:site_name', content: 'claude-start-cf' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: SITE_URL },
    ],
  }),
})`}
        />
        <CodeBlock
          code={`// Child route — overrides title and description
export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'claude-start-cf — Home' },
      { name: 'description', content: 'Build full-stack apps on the edge...' },
    ],
  }),
  component: Home,
})`}
        />
        <p className="text-xs text-muted-foreground">
          The root route in this app sets{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">charset</code>,{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">viewport</code>,
          default title/description, OG site_name, and the canonical URL. Child
          routes only need to override what changes.
        </p>
      </div>
    </DemoCard>
  )
}

function OpenGraphDemo() {
  return (
    <DemoCard
      icon={<Globe className="h-5 w-5" />}
      title="Open Graph & social sharing"
      file="head({ loaderData }) — dynamic meta"
      description="Open Graph tags control how pages appear when shared on social media. Use loaderData to generate dynamic tags from content."
    >
      <CodeBlock
        code={`// src/routes/blog/$slug.tsx
export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => renderPost({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: [
      { title: \`\${loaderData.post.title} — claude-start-cf Blog\` },
      { name: 'description', content: loaderData.post.description },
      // Open Graph
      { property: 'og:title', content: loaderData.post.title },
      { property: 'og:description', content: loaderData.post.description },
      { property: 'og:type', content: 'article' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: loaderData.post.title },
    ],
    links: [
      { rel: 'canonical', href: \`\${SITE_URL}/blog/\${loaderData.post.slug}\` },
    ],
  }),
})`}
      />
      <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-primary">
          <strong>Live example:</strong>{' '}
          <Link to="/blog/$slug" params={{ slug: 'hello-world' }} className="underline hover:no-underline">
            /blog/hello-world
          </Link>{' '}
          has dynamic OG tags generated from its frontmatter. View source to
          see the rendered meta tags in the HTML.
        </p>
      </div>
    </DemoCard>
  )
}

function JsonLdDemo() {
  return (
    <DemoCard
      icon={<Code className="h-5 w-5" />}
      title="Structured data (JSON-LD)"
      file="head() → scripts: [{ type: 'application/ld+json' }]"
      description="JSON-LD structured data helps search engines understand your content and can enable rich results. Added via the scripts array in head()."
    >
      <CodeBlock
        code={`head: ({ loaderData }) => ({
  scripts: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: loaderData.post.title,
        description: loaderData.post.description,
        author: loaderData.post.authors.map((name) => ({
          '@type': 'Person',
          name,
        })),
        datePublished: loaderData.post.published,
      }),
    },
  ],
})`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        The blog post routes in this app include Article structured data. Use
        the{' '}
        <a
          href="https://search.google.com/test/rich-results"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Rich Results Test
        </a>{' '}
        to validate your implementation.
      </p>
    </DemoCard>
  )
}

function SitemapDemo() {
  return (
    <DemoCard
      icon={<MapIcon className="h-5 w-5" />}
      title="Dynamic sitemap"
      file="src/routes/sitemap[.]xml.ts"
      description="A server route that generates a sitemap from static routes + content-collections posts. The bracket-dot syntax creates a route with a literal period in the URL."
    >
      <CodeBlock
        code={`// src/routes/sitemap[.]xml.ts
import { allPosts } from 'content-collections'

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  // ...other routes
]

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const postUrls = allPosts.map((post) => \`
  <url>
    <loc>\${SITE_URL}/blog/\${post.slug}</loc>
    <lastmod>\${post.published}</lastmod>
  </url>\`)

        const sitemap = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  \${staticRoutes.map(r => \`<url><loc>\${SITE_URL}\${r.path}</loc></url>\`).join('\\n')}
  \${postUrls.join('\\n')}
</urlset>\`

        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})`}
      />
      <div className="mt-3 flex items-center gap-3">
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View /sitemap.xml
        </a>
      </div>
    </DemoCard>
  )
}

function RobotsTxtDemo() {
  return (
    <DemoCard
      icon={<Bot className="h-5 w-5" />}
      title="robots.txt"
      file="src/routes/robots[.]txt.ts"
      description="A server route that generates robots.txt dynamically. For most sites a static file in public/ works fine, but a server route lets you vary rules by environment."
    >
      <CodeBlock
        code={`// src/routes/robots[.]txt.ts
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const robots = \`User-agent: *
Allow: /

Sitemap: \${SITE_URL}/sitemap.xml\`

        return new Response(robots, {
          headers: { 'Content-Type': 'text/plain' },
        })
      },
    },
  },
})`}
      />
      <div className="mt-3 flex items-center gap-3">
        <a
          href="/robots.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View /robots.txt
        </a>
      </div>
    </DemoCard>
  )
}

function HeadInspectorDemo() {
  const [path, setPath] = useState('/blog/hello-world')
  const [headHtml, setHeadHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleInspect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetchHead({ data: { path } })
      setHeadHtml(res.html)
    } catch {
      setHeadHtml('Failed to fetch.')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Search className="h-5 w-5" />}
      title="Head inspector"
      file="Live SSR head extraction"
      description="Fetches a page from this app via a server function and extracts the <head> HTML to show what crawlers see. Try different paths to see how meta tags change per route."
    >
      <form onSubmit={handleInspect} className="flex gap-2">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/blog/hello-world"
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Inspect'}
        </button>
      </form>

      {headHtml && (
        <div className="mt-3 rounded border bg-muted/50 p-3 max-h-80 overflow-y-auto">
          <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {headHtml}
          </pre>
        </div>
      )}
    </DemoCard>
  )
}

function ChecklistDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="SEO checklist"
      file="Implementation guide"
      description="Steps to add SEO to your TanStack Start app."
    >
      <div className="space-y-4 text-sm">
        <ol className="list-inside list-decimal space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">
              Set defaults in root route
            </strong>
            <p className="mt-1 ml-5 text-xs">
              charset, viewport, default title/description, OG site_name,
              canonical URL, stylesheet links.
            </p>
          </li>
          <li>
            <strong className="text-foreground">
              Add head() to content routes
            </strong>
            <p className="mt-1 ml-5 text-xs">
              Use loaderData for dynamic titles, descriptions, OG tags, and
              JSON-LD structured data.
            </p>
          </li>
          <li>
            <strong className="text-foreground">Create sitemap.xml</strong>
            <p className="mt-1 ml-5 text-xs">
              Static in public/ for simple sites, or a server route for dynamic
              content. Reference it from robots.txt.
            </p>
          </li>
          <li>
            <strong className="text-foreground">Create robots.txt</strong>
            <p className="mt-1 ml-5 text-xs">
              Allow crawlers and point to your sitemap. Static file or server
              route.
            </p>
          </li>
          <li>
            <strong className="text-foreground">Verify with tools</strong>
            <p className="mt-1 ml-5 text-xs">
              Google Search Console, Rich Results Test, OG Debugger, or the
              Head Inspector above.
            </p>
          </li>
        </ol>

        <div className="overflow-x-auto rounded border text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Feature
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Where
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  API
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              <tr>
                <td className="px-3 py-2">Meta tags</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  head() → meta
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  title, description, OG, twitter
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Canonical URL</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  head() → links
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {'{ rel: "canonical", href }'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">JSON-LD</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  head() → scripts
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {'{ type: "application/ld+json" }'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Sitemap</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  server route
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  /sitemap.xml → XML response
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">robots.txt</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  server route
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  /robots.txt → text response
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">SSR</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  default
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  On by default, ssr: false to disable
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoCard>
  )
}

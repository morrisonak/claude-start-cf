import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard, CodeBlock } from '~/components/demo'
import { pageHead } from '~/lib/site'
import {
  Bot,
  Code,
  FileText,
  FolderTree,
  Globe,
  ExternalLink,
  MessageSquare,
  Layers,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/llmo')({
  head: () =>
    pageHead({
      title: 'LLMO — claude-start-cf Template',
      description:
        'LLM Optimization patterns for TanStack Start: structured data, llms.txt, machine-readable endpoints, and content best practices for AI discoverability.',
      path: '/llmo',
    }),
  component: LlmoPage,
})

function LlmoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LLMO</h1>
          <p className="mt-2 text-muted-foreground">
            LLM Optimization (LLMO) structures your content so AI
            assistants — ChatGPT, Claude, Perplexity — can accurately understand,
            cite, and recommend it. Complements{' '}
            <Link
              to="/seo"
              className="text-primary hover:underline"
            >
              traditional SEO
            </Link>
            .
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <ComparisonDemo />
          <WebSiteSchemaDemo />
          <ArticleSchemaDemo />
          <FaqSchemaDemo />
          <LlmsTxtDemo />
          <ContentPracticesDemo />
          <ChecklistDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function ComparisonDemo() {
  return (
    <DemoCard
      icon={<Layers className="h-5 w-5" />}
      title="SEO vs LLMO"
      file="Different audiences, overlapping techniques"
      description="SEO optimizes for search engine crawlers and ranking algorithms. LLMO optimizes for LLM training data pipelines and retrieval-augmented generation (RAG) systems."
    >
      <div className="overflow-x-auto rounded border text-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium">
                Aspect
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium">SEO</th>
              <th className="px-3 py-2 text-left text-xs font-medium">LLMO</th>
            </tr>
          </thead>
          <tbody className="divide-y text-xs">
            <tr>
              <td className="px-3 py-2 font-medium">Goal</td>
              <td className="px-3 py-2 text-muted-foreground">
                Rank in search results
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                Be cited by AI assistants
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium">Audience</td>
              <td className="px-3 py-2 text-muted-foreground">
                Googlebot, Bingbot
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                LLM training &amp; retrieval systems
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium">Key signals</td>
              <td className="px-3 py-2 text-muted-foreground">
                Links, keywords, page speed
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                Structured data, clarity, authority
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium">Content format</td>
              <td className="px-3 py-2 text-muted-foreground">
                Optimized for snippets
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                Optimized for extraction &amp; synthesis
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        The good news: clear structure, authoritative content, and good metadata
        help both. Most LLMO work builds on your existing SEO foundation.
      </p>
    </DemoCard>
  )
}

function WebSiteSchemaDemo() {
  return (
    <DemoCard
      icon={<Globe className="h-5 w-5" />}
      title="WebSite + Organization schema"
      file="src/routes/__root.tsx → head() → scripts"
      description="Site-wide structured data in the root route tells AI systems what your site is, who publishes it, and where to find more. Applied to every page."
    >
      <CodeBlock
        code={`// src/routes/__root.tsx
export const Route = createRootRoute({
  head: () => ({
    // ...meta and links...
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'claude-start-cf',
          url: SITE_URL,
          description: 'A base template for...',
          publisher: {
            '@type': 'Organization',
            name: 'claude-start-cf',
            url: SITE_URL,
          },
        }),
      },
    ],
  }),
})`}
      />
      <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-primary">
          <strong>Live:</strong> This app's root route includes WebSite JSON-LD
          on every page. View source on any page to see it in the{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            {'<head>'}
          </code>
          .
        </p>
      </div>
    </DemoCard>
  )
}

function ArticleSchemaDemo() {
  return (
    <DemoCard
      icon={<Code className="h-5 w-5" />}
      title="Article structured data"
      file="src/routes/blog/$slug.tsx → head()"
      description="Per-page Article schema with headline, author, and publication date. AI systems use this to attribute content and understand authorship."
    >
      <CodeBlock
        code={`head: ({ loaderData }) => {
  const post = loaderData?.post
  if (!post) return {}
  return {
    meta: [
      { title: \`\${post.title} — claude-start-cf Blog\` },
      { name: 'description', content: post.description },
      { property: 'og:type', content: 'article' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          author: post.authors.map((name) => ({
            '@type': 'Person',
            name,
          })),
          datePublished: post.published,
        }),
      },
    ],
  }
}`}
      />
      <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-primary">
          <strong>Live example:</strong>{' '}
          <Link
            to="/blog/$slug"
            params={{ slug: 'hello-world' }}
            className="underline hover:no-underline"
          >
            /blog/hello-world
          </Link>{' '}
          includes Article JSON-LD. Use the{' '}
          <Link to="/seo" className="underline hover:no-underline">
            SEO Head Inspector
          </Link>{' '}
          to verify.
        </p>
      </div>
    </DemoCard>
  )
}

function FaqSchemaDemo() {
  return (
    <DemoCard
      icon={<MessageSquare className="h-5 w-5" />}
      title="FAQ schema"
      file="head() → FAQPage JSON-LD"
      description="FAQ structured data is particularly effective for LLMO — AI systems frequently extract Q&A pairs when answering user questions."
    >
      <CodeBlock
        code={`export const Route = createFileRoute('/faq')({
  loader: async () => {
    const faqs = await fetchFAQs()
    return { faqs }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: 'FAQ' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: loaderData.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }),
      },
    ],
  }),
})`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Other useful schema types: Product (e-commerce), HowTo (tutorials),
        SoftwareApplication (tools), and Course (education). See{' '}
        <a
          href="https://schema.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          schema.org
        </a>{' '}
        for the full vocabulary.
      </p>
    </DemoCard>
  )
}

function LlmsTxtDemo() {
  return (
    <DemoCard
      icon={<Bot className="h-5 w-5" />}
      title="llms.txt"
      file="src/routes/llms[.]txt.ts"
      description="A plain-text file that gives AI systems a structured summary of your site: what it is, what content exists, key facts, and links. Similar to robots.txt but for LLMs."
    >
      <CodeBlock
        code={`// src/routes/llms[.]txt.ts
export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const content = \`# claude-start-cf

> A base template for building full-stack apps on the edge.

## About
claude-start-cf is a starter template designed for AI-assisted development...

## Feature Demos
- [Home](\${SITE_URL}/): Landing page
- [D1 Database](\${SITE_URL}/d1): SQLite at the edge
- [R2 Storage](\${SITE_URL}/r2): Object storage
...

## Blog
\${allPosts.map(p => \`- [\${p.title}](\${SITE_URL}/blog/\${p.slug})\`).join('\\n')}

## Tech Stack
- TanStack Start (React SSR framework)
- Cloudflare Workers (edge runtime)
...\`

        return new Response(content, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      },
    },
  },
})`}
      />
      <div className="mt-3 flex items-center gap-3">
        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View /llms.txt
        </a>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        This app generates llms.txt dynamically from content-collections,
        keeping the blog list always in sync. For static sites, a file in
        public/ works too.
      </p>
    </DemoCard>
  )
}

function ContentPracticesDemo() {
  return (
    <DemoCard
      icon={<FileText className="h-5 w-5" />}
      title="Content best practices"
      file="Structure for extraction"
      description="Beyond technical markup, how you write content affects how well AI systems can extract and cite it."
    >
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-medium text-foreground">
            Clear, factual statements
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            AI systems extract factual claims. Make key information explicit
            and self-contained — don't rely on surrounding context.
          </p>
          <CodeBlock
            code={`// Good: clear, extractable facts
<p>
  claude-start-cf is a TanStack Start template that runs on Cloudflare Workers.
  It includes D1 (SQLite), R2 (object storage), and shadcn/ui components.
</p>

// Avoid: vague, context-dependent
<p>
  Our product works great with all the latest technologies.
  It has everything you need to get started.
</p>`}
          />
        </div>

        <div>
          <h3 className="font-medium text-foreground">
            Hierarchical heading structure
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Proper h1 → h2 → h3 hierarchy helps AI systems understand content
            organization. Each section should be independently understandable.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-foreground">
            Author attribution
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Include author metadata — AI systems consider authority signals when
            deciding what to cite.
          </p>
          <CodeBlock
            code={`head: ({ loaderData }) => ({
  meta: [
    { name: 'author', content: loaderData.post.author.name },
    { property: 'article:author', content: loaderData.post.author.url },
    { property: 'article:published_time', content: loaderData.post.published },
  ],
})`}
          />
        </div>

        <div>
          <h3 className="font-medium text-foreground">
            Machine-readable API endpoints
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            JSON endpoints with schema.org context let AI systems consume your
            data directly without HTML parsing.
          </p>
          <CodeBlock
            code={`// src/routes/api/products.ts
GET: async () => {
  const products = await fetchProducts()
  return Response.json({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        url: \`\${SITE_URL}/products/\${p.id}\`,
      },
    })),
  })
}`}
          />
        </div>
      </div>
    </DemoCard>
  )
}

function ChecklistDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="LLMO checklist"
      file="Implementation guide"
      description="Steps to optimize your TanStack Start app for AI discoverability."
    >
      <div className="space-y-4 text-sm">
        <ol className="list-inside list-decimal space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">
              Add WebSite JSON-LD to root route
            </strong>
            <p className="mt-1 ml-5 text-xs">
              Site name, URL, description, publisher Organization. Applied to
              every page.
            </p>
          </li>
          <li>
            <strong className="text-foreground">
              Add Article/Product JSON-LD to content pages
            </strong>
            <p className="mt-1 ml-5 text-xs">
              Dynamic from loaderData: headline, author, dates, description.
            </p>
          </li>
          <li>
            <strong className="text-foreground">Create llms.txt</strong>
            <p className="mt-1 ml-5 text-xs">
              Plain-text overview: what your site is, key pages, facts, and
              links. Server route or static file.
            </p>
          </li>
          <li>
            <strong className="text-foreground">
              Write clear, factual content
            </strong>
            <p className="mt-1 ml-5 text-xs">
              Self-contained paragraphs, proper heading hierarchy, explicit
              facts, author attribution.
            </p>
          </li>
          <li>
            <strong className="text-foreground">
              Add FAQ schema where relevant
            </strong>
            <p className="mt-1 ml-5 text-xs">
              Q&A pairs are frequently extracted by AI systems.
            </p>
          </li>
          <li>
            <strong className="text-foreground">Test with AI assistants</strong>
            <p className="mt-1 ml-5 text-xs">
              Ask ChatGPT, Claude, and Perplexity about your product. Validate
              structured data with{' '}
              <a
                href="https://validator.schema.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Schema.org Validator
              </a>
              .
            </p>
          </li>
        </ol>

        <div className="overflow-x-auto rounded border text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Technique
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  File
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              <tr>
                <td className="px-3 py-2">WebSite JSON-LD</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  __root.tsx
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Site identity for all pages
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Article JSON-LD</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  blog/$slug.tsx
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Content attribution &amp; authorship
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">llms.txt</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  server route
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Site summary for AI crawlers
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">FAQ schema</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  head() → scripts
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Q&A extraction by AI
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">SSR</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">
                  default on
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  AI crawlers see rendered content
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoCard>
  )
}

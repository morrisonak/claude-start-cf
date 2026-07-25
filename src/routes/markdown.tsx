import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard, CodeBlock } from '~/components/demo'
import { pageHead } from '~/lib/site'
import { Markdown } from '~/components/Markdown'
import { renderMarkdown } from '~/utils/markdown'
import { fetchRemoteMarkdown } from '~/utils/docs.functions'
import {
  FileText,
  Globe,
  Code,
  FolderTree,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------
const renderPreview = createServerFn({ method: 'POST' })
  .inputValidator((data: { markdown: string }) => data)
  .handler(async ({ data }) => {
    const { markup, headings } = await renderMarkdown(data.markdown)
    return { markup, headings }
  })

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/markdown')({
  head: () =>
    pageHead({
      title: 'Markdown — claude-start-cf Template',
      description:
        'Markdown rendering patterns: build-time content-collections, dynamic rendering via server functions, and TOC extraction.',
      path: '/markdown',
    }),
  component: MarkdownPage,
})

function MarkdownPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Markdown</h1>
          <p className="mt-2 text-muted-foreground">
            Two methods for rendering markdown:{' '}
            <strong>static</strong> with content-collections (build-time) and{' '}
            <strong>dynamic</strong> from remote sources (runtime). Both share
            the same unified processing pipeline.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <ProcessorDemo />
          <LivePreviewDemo />
          <StaticBlogDemo />
          <DynamicFetchDemo />
          <SetupDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function ProcessorDemo() {
  return (
    <DemoCard
      icon={<Code className="h-5 w-5" />}
      title="Markdown processor"
      file="src/utils/markdown.ts"
      description="The shared pipeline uses unified: remark-parse → remark-gfm → remark-rehype → rehype-slug → rehype-autolink-headings → rehype-stringify. Extracts headings for table-of-contents."
    >
      <CodeBlock
        code={`import { renderMarkdown } from '~/utils/markdown'

// Call in any server function or loader
const { markup, headings } = await renderMarkdown(markdownString)

// markup: HTML string ready for rendering
// headings: [{ id, text, level }] for TOC`}
      />
      <div className="mt-3">
        <CodeBlock
          code={`// src/components/Markdown.tsx
import parse from 'html-react-parser'

// Renders pre-processed HTML with custom element handling:
// - Internal <a> links → TanStack Router <Link>
// - <img> elements → lazy-loaded with rounded styling
<Markdown markup={markup} />`}
        />
      </div>
    </DemoCard>
  )
}

function LivePreviewDemo() {
  const [input, setInput] = useState(
    `## Hello Markdown

This is a **live preview** rendered via a server function.

- Supports GFM (tables, strikethrough, task lists)
- Headings get auto-linked IDs
- Code blocks are preserved

| Feature | Method |
|---------|--------|
| Blog posts | content-collections |
| Remote docs | fetch + server fn |

> The unified pipeline runs server-side, so the client stays light.`,
  )
  const [markup, setMarkup] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRender() {
    setLoading(true)
    try {
      const result = await renderPreview({ data: { markdown: input } })
      setMarkup(result.markup)
    } catch {
      setMarkup('<p class="text-destructive">Failed to render markdown.</p>')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<FileText className="h-5 w-5" />}
      title="Live preview"
      file="renderMarkdown() via server function"
      description="Type markdown below and hit render. The processing runs server-side via a POST server function — the client sends raw text and receives HTML."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Markdown input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Rendered output
          </label>
          <div className="rounded-md border bg-muted/30 p-3 min-h-[14rem] max-h-[22rem] overflow-y-auto text-sm">
            {markup ? (
              <Markdown markup={markup} className="prose prose-invert prose-sm max-w-none" />
            ) : (
              <p className="text-muted-foreground italic text-xs">
                Click render to see the output.
              </p>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleRender}
        disabled={loading || !input.trim()}
        className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Rendering...' : 'Render'}
      </button>
    </DemoCard>
  )
}

function StaticBlogDemo() {
  return (
    <DemoCard
      icon={<BookOpen className="h-5 w-5" />}
      title="Static markdown with content-collections"
      file="content-collections.ts + src/blog/*.md"
      description="Ideal for blog posts bundled in the repo. The Vite plugin processes .md files at build time with Zod-validated frontmatter schemas."
    >
      <div className="space-y-3">
        <CodeBlock
          code={`// content-collections.ts
const posts = defineCollection({
  name: 'posts',
  directory: './src/blog',
  include: '*.md',
  schema: (z) => ({
    title: z.string(),
    published: z.string().date(),
    description: z.string().optional(),
    authors: z.string().array(),
  }),
  transform: ({ content, ...post }) => ({
    ...post,
    slug: post._meta.path,
    content: matter(content).body,
  }),
})`}
        />
        <CodeBlock
          code={`// In any route loader
import { allPosts } from 'content-collections'

const sorted = allPosts.sort(
  (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
)`}
        />
        <div className="rounded border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs text-primary">
            <strong>Live example:</strong>{' '}
            <Link to="/blog" className="underline hover:no-underline">
              Visit the blog →
            </Link>{' '}
            to see content-collections in action with 2 sample posts.
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

function DynamicFetchDemo() {
  const [markup, setMarkup] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFetch() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRemoteMarkdown({
        data: {
          repo: 'tanstack/router',
          branch: 'main',
          filePath: 'README.md',
        },
      })
      setMarkup(result.markup)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Globe className="h-5 w-5" />}
      title="Dynamic markdown from GitHub"
      file="src/utils/docs.functions.ts"
      description="Fetch and render markdown from any GitHub repo at runtime via a server function. Great for documentation sites that pull from external repos."
    >
      <div className="space-y-3">
        <CodeBlock
          code={`const result = await fetchRemoteMarkdown({
  data: {
    repo: 'tanstack/router',
    branch: 'main',
    filePath: 'README.md',
  },
})
// result.markup — rendered HTML
// result.headings — extracted headings
// result.frontmatter — parsed YAML frontmatter`}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleFetch}
            disabled={loading}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Fetching...
              </span>
            ) : (
              'Fetch TanStack Router README'
            )}
          </button>
          <a
            href="https://github.com/tanstack/router"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View on GitHub
          </a>
        </div>

        {error && (
          <div className="rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {markup && (
          <div className="rounded-md border bg-muted/30 p-4 max-h-80 overflow-y-auto">
            <Markdown
              markup={markup}
              className="prose prose-invert prose-sm max-w-none"
            />
          </div>
        )}
      </div>
    </DemoCard>
  )
}

function SetupDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="Setup checklist"
      file="package.json + vite.config.ts"
      description="Steps to add markdown rendering to a new project."
    >
      <div className="space-y-4 text-sm">
        <ol className="list-inside list-decimal space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">Install dependencies</strong>
            <CodeBlock code="npm install unified remark-parse remark-gfm remark-rehype rehype-raw rehype-slug rehype-autolink-headings rehype-stringify html-react-parser gray-matter unist-util-visit hast-util-to-string @tailwindcss/typography" />
          </li>
          <li>
            <strong className="text-foreground">
              Create the processor
            </strong>
            <CodeBlock
              code={`// src/utils/markdown.ts
export async function renderMarkdown(content: string) {
  // unified pipeline → { markup, headings }
}`}
            />
          </li>
          <li>
            <strong className="text-foreground">
              Add content-collections (optional, for static content)
            </strong>
            <CodeBlock code="npm install @content-collections/core @content-collections/vite" />
          </li>
          <li>
            <strong className="text-foreground">
              Add typography plugin to CSS
            </strong>
            <CodeBlock code={`/* src/styles/app.css */\n@plugin "@tailwindcss/typography";`} />
          </li>
        </ol>

        <div className="overflow-x-auto rounded border text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Approach
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Best For
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Trade-off
                </th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              <tr>
                <td className="px-3 py-2 font-mono">content-collections</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Blog posts, static docs bundled with app
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Requires rebuild for content updates
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">Dynamic fetching</td>
                <td className="px-3 py-2 text-muted-foreground">
                  External docs, frequently updated content
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Runtime overhead, needs error handling
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoCard>
  )
}

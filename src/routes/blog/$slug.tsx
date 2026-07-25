import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { allPosts } from 'content-collections'
import { renderMarkdown } from '~/utils/markdown'
import { Markdown } from '~/components/Markdown'
import { ArrowLeft, Calendar, User } from 'lucide-react'

import { SITE_URL } from '~/lib/site'

const renderPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const post = allPosts.find((p) => p.slug === data.slug)
    if (!post) throw notFound()

    const { markup, headings } = await renderMarkdown(post.content)
    return { post, markup, headings }
  })

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => renderPost({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const post = loaderData?.post
    if (!post) return {}
    return {
      meta: [
        { title: `${post.title} — claude-start-cf Blog` },
        {
          name: 'description',
          content: post.description || post.excerpt || '',
        },
        { property: 'og:title', content: post.title },
        {
          property: 'og:description',
          content: post.description || post.excerpt || '',
        },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: post.title },
      ],
      links: [
        {
          rel: 'canonical',
          href: `${SITE_URL}/blog/${post.slug}`,
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description || '',
            author: post.authors.map((name: string) => ({
              '@type': 'Person',
              name,
            })),
            datePublished: post.published,
          }),
        },
      ],
    }
  },
  component: BlogPost,
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold">Post not found</h1>
      <p className="mt-2 text-muted-foreground">
        That blog post doesn't exist.
      </p>
      <Link
        to="/blog"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to blog
      </Link>
    </div>
  ),
})

function BlogPost() {
  const { post, markup, headings } = Route.useLoaderData()

  return (
    <article>
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to blog
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {post.published}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.authors.join(', ')}
          </span>
        </div>
      </header>

      {headings.length > 2 && (
        <nav className="mt-8 rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            On this page
          </p>
          <ul className="space-y-1">
            {headings
              .filter((h) => h.level <= 3)
              .map((h) => (
                <li
                  key={h.id}
                  style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                >
                  <a
                    href={`#${h.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      )}

      <div className="mt-8">
        <Markdown markup={markup} />
      </div>
    </article>
  )
}

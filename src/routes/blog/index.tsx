import { createFileRoute, Link } from '@tanstack/react-router'
import { allPosts } from 'content-collections'
import { Calendar, User, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/blog/')({
  loader: () => {
    const sorted = [...allPosts].sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime(),
    )
    return { posts: sorted }
  },
  component: BlogIndex,
})

function BlogIndex() {
  const { posts } = Route.useLoaderData()

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Static markdown posts loaded via{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
          content-collections
        </code>{' '}
        at build time.
      </p>

      <div className="mt-10 space-y-4">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No posts yet. Add .md files to src/blog/.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group block rounded-lg border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.published}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.authors.join(', ')}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

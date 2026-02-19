import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

const posts: Record<string, { title: string; body: string }> = {
  '1': {
    title: 'File-based routing',
    body: 'Each file in src/routes/ becomes a route. The file path maps to the URL path. index.tsx files match the parent path exactly. This is the foundation of TanStack Router in Start.',
  },
  '2': {
    title: 'Dynamic route segments',
    body: 'Prefix a filename with $ to create a dynamic segment. $postId.tsx captures that part of the URL and makes it available via Route.useParams(). The value is fully type-safe.',
  },
  '3': {
    title: 'Layout routes and Outlet',
    body: 'A file like posts.tsx defines a layout route. It renders shared UI (nav, sidebar, etc.) and uses <Outlet /> to render its child routes. The children are files inside the posts/ directory.',
  },
}

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  const post = posts[postId]

  if (!post) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post not found</h1>
        <p className="mt-2 text-muted-foreground">
          No post with id "{postId}".
        </p>
        <Link
          to="/posts"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to posts
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/posts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to posts
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-2 text-xs text-muted-foreground font-mono">
        /posts/{postId} &mdash; src/routes/posts/$postId.tsx
      </div>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground leading-relaxed">{post.body}</p>
      </div>
      <div className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Dynamic route:</strong> The{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">postId</code> param
        was captured from the URL as{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">"{postId}"</code>{' '}
        via <code className="rounded bg-muted px-1.5 py-0.5 font-mono">Route.useParams()</code>.
      </div>
    </div>
  )
}

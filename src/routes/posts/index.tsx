import { createFileRoute, Link } from '@tanstack/react-router'
import { pageHead } from '~/lib/site'

const posts = [
  { id: '1', title: 'File-based routing', summary: 'How routes map from files to URLs in TanStack Router.' },
  { id: '2', title: 'Dynamic route segments', summary: 'Capturing URL parameters with $param syntax.' },
  { id: '3', title: 'Layout routes and Outlet', summary: 'Sharing UI across a group of nested routes.' },
]

export const Route = createFileRoute('/posts/')({
  head: () =>
    pageHead({
      title: 'Posts — claude-start-cf Template',
      description:
        'Nested routing example: an index route rendering inside a layout route via Outlet.',
      path: '/posts',
    }),
  component: PostsIndex,
})

function PostsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
      <p className="mt-2 text-muted-foreground">
        This is an index route at{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
          src/routes/posts/index.tsx
        </code>
        . It renders inside the layout defined in{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
          posts.tsx
        </code>{' '}
        via <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">&lt;Outlet /&gt;</code>.
      </p>
      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/posts/$postId"
            params={{ postId: post.id }}
            className="block rounded-lg border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <h2 className="font-semibold">{post.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {post.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

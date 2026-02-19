import { createFileRoute } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="mt-4 text-muted-foreground">
          This is a static route. It lives at{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
            src/routes/about.tsx
          </code>{' '}
          and maps directly to the <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">/about</code> path.
        </p>
        <div className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="font-semibold">Static routes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The simplest route type. One file, one path. No dynamic segments,
            no nested children. Good for standalone pages like this one.
          </p>
        </div>
      </main>
    </div>
  )
}

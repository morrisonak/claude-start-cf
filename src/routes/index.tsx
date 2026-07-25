import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'
import { pageHead } from '~/lib/site'
import { categories } from '~/lib/nav'
import { Github } from 'lucide-react'

export const Route = createFileRoute('/')({
  head: () =>
    pageHead({
      title: 'claude-start-cf — TanStack Start + Cloudflare Template',
      description:
        'Build full-stack apps on the edge with TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.',
      path: '/',
    }),
  component: Home,
})

function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Demos</h1>
            <a
              href="https://github.com/morrisonak/claude-start-cf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
          <p className="text-muted-foreground">
            Patterns and integrations included in this TanStack Start + Cloudflare template.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {categories.map((cat) => (
            <section key={cat.title}>
              <h2 className="text-lg font-semibold">{cat.title}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {cat.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

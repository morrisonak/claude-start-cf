import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'
import {
  Zap,
  Variable,
  Server,
  Route as RouteIcon,
  Database,
  HardDrive,
  FileText,
  Search,
  Bot,
  Info,
  Newspaper,
  BookOpen,
  Rocket,
  Github,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'claude-start-cf — TanStack Start + Cloudflare Template' },
      {
        name: 'description',
        content:
          'Build full-stack apps on the edge with TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.',
      },
    ],
  }),
  component: Home,
})

const categories = [
  {
    title: 'Framework Patterns',
    items: [
      { to: '/execution', icon: Zap, title: 'Execution', description: 'Client vs server rendering' },
      { to: '/env', icon: Variable, title: 'Env Vars', description: 'Environment variable access' },
      { to: '/server-fns', icon: Server, title: 'Server Fns', description: 'Server function RPCs' },
      { to: '/server-routes', icon: RouteIcon, title: 'API Routes', description: 'HTTP API endpoints' },
    ],
  },
  {
    title: 'Cloudflare Services',
    items: [
      { to: '/d1', icon: Database, title: 'D1', description: 'SQLite database at the edge' },
      { to: '/r2', icon: HardDrive, title: 'R2', description: 'Object storage uploads' },
      { to: '/deploy', icon: Rocket, title: 'Deploy', description: 'Setup, config & deployment' },
    ],
  },
  {
    title: 'Content & SEO',
    items: [
      { to: '/markdown', icon: FileText, title: 'Markdown', description: 'MDX content rendering' },
      { to: '/seo', icon: Search, title: 'SEO', description: 'Meta tags & structured data' },
      { to: '/llmo', icon: Bot, title: 'LLMO', description: 'LLM-optimized content' },
    ],
  },
  {
    title: 'Routing & Content',
    items: [
      { to: '/about', icon: Info, title: 'About', description: 'Static page example' },
      { to: '/posts', icon: Newspaper, title: 'Posts', description: 'Data fetching patterns' },
      { to: '/blog', icon: BookOpen, title: 'Blog', description: 'File-based blog with MDX' },
    ],
  },
] as const

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

import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ClientOnly, useHydrated } from '@tanstack/react-router'
import {
  createServerFn,
  createIsomorphicFn,
  createClientOnlyFn,
} from '@tanstack/react-start'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard } from '~/components/demo'
import { pageHead } from '~/lib/site'
import {
  Server,
  Monitor,
  ArrowLeftRight,
  Shield,
  Clock,
  Ban,
  Smartphone,
  Layers,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// 1. Server function (RPC) — runs on server, callable from client via network
// ---------------------------------------------------------------------------
const getServerInfo = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    runtime: 'Cloudflare Workers',
    timestamp: new Date().toISOString(),
    region: (globalThis as any).caches ? 'edge' : 'unknown',
  }
})

// ---------------------------------------------------------------------------
// 2. Isomorphic function — different implementation per environment
// ---------------------------------------------------------------------------
const getEnvironmentLabel = createIsomorphicFn()
  .server(() => 'server')
  .client(() => 'client')

// ---------------------------------------------------------------------------
// 3. Client-only function — crashes if called on server
// ---------------------------------------------------------------------------
const getViewportSize = createClientOnlyFn(() => ({
  width: window.innerWidth,
  height: window.innerHeight,
}))

// ---------------------------------------------------------------------------
// Route definition — loader uses server function for safe data fetching
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/execution')({
  head: () =>
    pageHead({
      title: 'Execution Model — claude-start-cf Template',
      description:
        'Where code runs in TanStack Start: SSR vs client rendering, server functions, isomorphic functions, and hydration.',
      path: '/execution',
    }),
  loader: async () => {
    // Correct pattern: loader is isomorphic, so delegate to a server function
    // for anything that needs server-only access.
    const serverInfo = await getServerInfo()
    return { serverInfo }
  },
  component: ExecutionPage,
})

function ExecutionPage() {
  const { serverInfo } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight">Execution Model</h1>
        <p className="mt-2 text-muted-foreground">
          All code in TanStack Start is{' '}
          <strong className="text-foreground">isomorphic by default</strong> —
          it runs on both server and client unless explicitly constrained.
          This page demonstrates each execution boundary.
        </p>

        {/* API reference table */}
        <div className="mt-8 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium">API</th>
                <th className="px-4 py-2.5 text-left font-medium">Runs on</th>
                <th className="px-4 py-2.5 text-left font-medium">
                  If called from wrong env
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-mono text-xs">createServerFn()</td>
                <td className="px-4 py-2 text-muted-foreground">Server</td>
                <td className="px-4 py-2 text-muted-foreground">
                  Network request (RPC)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">
                  createServerOnlyFn()
                </td>
                <td className="px-4 py-2 text-muted-foreground">Server</td>
                <td className="px-4 py-2 text-destructive">Throws error</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">
                  createClientOnlyFn()
                </td>
                <td className="px-4 py-2 text-muted-foreground">Client</td>
                <td className="px-4 py-2 text-destructive">Throws error</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">
                  createIsomorphicFn()
                </td>
                <td className="px-4 py-2 text-muted-foreground">Both</td>
                <td className="px-4 py-2 text-muted-foreground">
                  Picks correct impl
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">
                  {'<ClientOnly>'}
                </td>
                <td className="px-4 py-2 text-muted-foreground">Client</td>
                <td className="px-4 py-2 text-muted-foreground">
                  Renders fallback
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs">useHydrated()</td>
                <td className="px-4 py-2 text-muted-foreground">Both</td>
                <td className="px-4 py-2 text-muted-foreground">
                  Returns false on server
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 space-y-8">
          <ServerFnDemo serverInfo={serverInfo} />
          <ServerOnlyDemo />
          <ClientOnlyFnDemo />
          <LoaderPatternDemo />
          <IsomorphicDemo />
          <ClientOnlyComponentDemo />
          <HydratedDemo />
          <ProgressiveEnhancementDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demo sections
// ---------------------------------------------------------------------------

function ServerFnDemo({
  serverInfo,
}: {
  serverInfo: { runtime: string; timestamp: string; region: string }
}) {
  const [refetched, setRefetched] = useState(serverInfo)
  const [loading, setLoading] = useState(false)

  async function handleRefetch() {
    setLoading(true)
    const data = await getServerInfo()
    setRefetched(data)
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Server className="h-5 w-5" />}
      title="createServerFn (RPC)"
      file="createServerFn({ method: 'GET' }).handler(async () => { ... })"
      description="Runs on the server. When called from the client, it becomes a network request automatically. Use for database access, secrets, and mutations."
    >
      <div className="space-y-2 text-sm">
        <KV label="Runtime" value={refetched.runtime} />
        <KV label="Timestamp" value={refetched.timestamp} />
        <KV label="Region" value={refetched.region} />
      </div>
      <button
        onClick={handleRefetch}
        disabled={loading}
        className="mt-4 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Re-fetch from server'}
      </button>
    </DemoCard>
  )
}

function ServerOnlyDemo() {
  return (
    <DemoCard
      icon={<Ban className="h-5 w-5" />}
      title="createServerOnlyFn (hard boundary)"
      file="createServerOnlyFn(() => process.env.SECRET)"
      description="Unlike createServerFn, this has no RPC bridge. Calling it from the client throws an error immediately. Use for utility functions that must never leave the server — secret access, file system reads, etc."
    >
      <div className="space-y-3 text-sm">
        <div className="rounded border border-primary/30 bg-primary/5 p-3">
          <p className="font-mono text-xs text-primary">
            {'// ✅ Safe — only callable from server code'}
          </p>
          <p className="font-mono text-xs text-primary">
            {'const getDbUrl = createServerOnlyFn(() => process.env.DATABASE_URL)'}
          </p>
        </div>
        <div className="rounded border border-destructive/30 bg-destructive/5 p-3">
          <p className="font-mono text-xs text-destructive">
            {'// ❌ Calling from client crashes at runtime'}
          </p>
          <p className="font-mono text-xs text-destructive">
            {'const url = getDbUrl() // throws Error'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">When to choose this over createServerFn:</strong>{' '}
          Use createServerOnlyFn for pure utility functions that return secrets or
          do file I/O. Use createServerFn when you need the client to be able to call
          the function (it creates an RPC endpoint).
        </p>
      </div>
    </DemoCard>
  )
}

function ClientOnlyFnDemo() {
  const [viewport, setViewport] = useState<{
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    setViewport(getViewportSize())
    function onResize() {
      setViewport(getViewportSize())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <DemoCard
      icon={<Smartphone className="h-5 w-5" />}
      title="createClientOnlyFn (hard boundary)"
      file="createClientOnlyFn(() => ({ width: window.innerWidth, ... }))"
      description="The inverse of createServerOnlyFn. Calling it on the server throws an error. Use for browser API wrappers — localStorage, DOM measurements, geolocation, etc."
    >
      <div className="space-y-2 text-sm">
        {viewport ? (
          <>
            <KV label="Viewport width" value={`${viewport.width}px`} />
            <KV label="Viewport height" value={`${viewport.height}px`} />
          </>
        ) : (
          <p className="text-muted-foreground italic">
            Waiting for client...
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          This function is only called inside useEffect so it never runs during
          SSR. Resize your browser to see it update.
        </p>
      </div>
    </DemoCard>
  )
}

function LoaderPatternDemo() {
  return (
    <DemoCard
      icon={<Shield className="h-5 w-5" />}
      title="Loader + Server Function"
      file="loader: () => getServerInfo()"
      description="Loaders are isomorphic — they run on both server (SSR) and client (navigation). Never access secrets directly in a loader. Delegate to a server function instead."
    >
      <div className="space-y-3 text-sm">
        <div className="rounded border border-destructive/30 bg-destructive/5 p-3">
          <p className="font-mono text-xs text-destructive">
            {'// ❌ loader runs on client too — secret leaks into bundle'}
          </p>
          <p className="font-mono text-xs text-destructive">
            {'loader: () => fetch(`/api?key=${process.env.SECRET}`)'}
          </p>
        </div>
        <div className="rounded border border-primary/30 bg-primary/5 p-3">
          <p className="font-mono text-xs text-primary">
            {'// ✅ server function keeps secrets server-side'}
          </p>
          <p className="font-mono text-xs text-primary">
            {'loader: () => getServerInfo()'}
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

function IsomorphicDemo() {
  const env = getEnvironmentLabel()

  return (
    <DemoCard
      icon={<ArrowLeftRight className="h-5 w-5" />}
      title="createIsomorphicFn"
      file="createIsomorphicFn().server(() => ...).client(() => ...)"
      description="Provides different implementations depending on the environment. The framework picks the right one at runtime. Good for logging, storage adapters, and feature detection."
    >
      <div className="text-sm">
        <KV label="Currently running on" value={env} />
        <p className="mt-2 text-xs text-muted-foreground">
          During SSR this shows "server". After hydration it shows "client".
          Unlike the hard boundary functions, this never throws — it always
          has an implementation for the current environment.
        </p>
      </div>
    </DemoCard>
  )
}

function ClientOnlyComponentDemo() {
  return (
    <DemoCard
      icon={<Monitor className="h-5 w-5" />}
      title="<ClientOnly> component"
      file="<ClientOnly fallback={...}>...</ClientOnly>"
      description="Renders children only after hydration. During SSR, renders the fallback. Use when an entire component tree needs browser APIs."
    >
      <div className="space-y-2 text-sm">
        <ClientOnly
          fallback={
            <p className="text-muted-foreground italic">
              Waiting for hydration...
            </p>
          }
        >
          <BrowserInfo />
        </ClientOnly>
        <p className="mt-2 text-xs text-muted-foreground">
          <strong className="text-foreground">
            {'<ClientOnly>'} vs createClientOnlyFn:
          </strong>{' '}
          Use the component when you need to guard an entire subtree of JSX.
          Use the function when you need a callable utility.
        </p>
      </div>
    </DemoCard>
  )
}

function BrowserInfo() {
  return (
    <div className="space-y-2">
      <KV label="Window width" value={`${window.innerWidth}px`} />
      <KV label="Language" value={navigator.language} />
      <KV
        label="Timezone"
        value={Intl.DateTimeFormat().resolvedOptions().timeZone}
      />
    </div>
  )
}

function HydratedDemo() {
  const hydrated = useHydrated()
  const [now, setNow] = useState<string>()

  useEffect(() => {
    setNow(new Date().toLocaleTimeString())
    const id = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <DemoCard
      icon={<Clock className="h-5 w-5" />}
      title="useHydrated"
      file="const hydrated = useHydrated()"
      description="Returns false during SSR and first client render, then true after hydration. Useful for conditional rendering that avoids hydration mismatches."
    >
      <div className="space-y-2 text-sm">
        <KV label="Hydrated" value={hydrated ? 'true' : 'false'} />
        <KV label="Live clock" value={now ?? 'Loading...'} />
        <p className="text-xs text-muted-foreground">
          The clock uses useEffect to avoid a hydration mismatch — the server
          and client would render different times otherwise.
        </p>
      </div>
    </DemoCard>
  )
}

function ProgressiveEnhancementDemo() {
  const [query, setQuery] = useState('')
  const hydrated = useHydrated()

  return (
    <DemoCard
      icon={<Layers className="h-5 w-5" />}
      title="Progressive Enhancement"
      file="Works without JS, enhanced with JS"
      description="Build forms that work as plain HTML, then enhance with client-side behavior. The form submits via GET without JavaScript; with JavaScript it can do instant search."
    >
      <form action="/posts" method="get" className="space-y-3">
        <div className="flex gap-2">
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Search
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {hydrated
            ? 'JS is loaded — input is controlled via useState, could do instant search.'
            : 'No JS yet — form still works via native HTML GET submission.'}
        </p>
      </form>
    </DemoCard>
  )
}


function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
        {value}
      </code>
    </div>
  )
}

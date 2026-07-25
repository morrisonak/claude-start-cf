import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard, CodeBlock } from '~/components/demo'
import { pageHead } from '~/lib/site'
import {
  Globe,
  Send,
  User,
  FileText,
  FolderTree,
  ArrowLeftRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// This file is a combined server route + component.
// The GET handler at /server-routes returns JSON, while the component renders
// the demo page. The route tree handles both — UI requests get the component,
// direct fetch requests to the handler get the JSON response.
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/server-routes')({
  head: () =>
    pageHead({
      title: 'API Routes — claude-start-cf Template',
      description:
        'HTTP API endpoints in TanStack Start: GET/POST handlers, dynamic params, splat routes, and when to use them over server functions.',
      path: '/server-routes',
    }),
  server: {
    handlers: {
      // This handler responds to direct GET requests (e.g. curl, fetch)
      // while the component renders when navigating in the browser.
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({
          message: 'This response came from a server handler on the same route as the page component.',
          received: body,
          timestamp: new Date().toISOString(),
        })
      },
    },
  },
  component: ServerRoutesPage,
})

function ServerRoutesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Server Routes (API Endpoints)
        </h1>
        <p className="mt-2 text-muted-foreground">
          Server routes are HTTP endpoints defined in your route files using the{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
            server
          </code>{' '}
          property. They live alongside your page routes and follow the same
          file-based conventions.
        </p>

        {/* File map */}
        <div className="mt-8 rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Routes in this demo</h2>
                <p className="text-xs text-muted-foreground">
                  File path → endpoint URL
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-1.5 font-mono text-sm">
              <RouteRow
                file="routes/api/hello.ts"
                path="/api/hello"
                methods="GET POST"
              />
              <RouteRow
                file="routes/api/echo.ts"
                path="/api/echo"
                methods="POST"
              />
              <RouteRow
                file="routes/api/users/$userId.ts"
                path="/api/users/:userId"
                methods="GET"
              />
              <RouteRow
                file="routes/server-routes.tsx"
                path="/server-routes"
                methods="POST + component"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <HelloGetDemo />
          <HelloPostDemo />
          <EchoDemo />
          <DynamicParamDemo />
          <CombinedRouteDemo />
          <ConventionsDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function HelloGetDemo() {
  const [name, setName] = useState('World')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    const res = await fetch(`/api/hello?name=${encodeURIComponent(name)}`)
    setResponse(await res.text())
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Globe className="h-5 w-5" />}
      title="GET /api/hello"
      file="routes/api/hello.ts → GET handler"
      description="A basic GET endpoint. Reads a query parameter and returns plain text. The simplest server route possible."
    >
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : 'GET'}
        </button>
      </div>
      {response !== null && (
        <div className="mt-3 rounded border bg-muted/50 p-3 font-mono text-xs">
          {response}
        </div>
      )}
      <CodeBlock
        code={`GET: async ({ request }) => {
  const url = new URL(request.url)
  const name = url.searchParams.get('name') || 'World'
  return new Response(\`Hello, \${name}!\`)
}`}
      />
    </DemoCard>
  )
}

function HelloPostDemo() {
  const [name, setName] = useState('Tanner')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    const res = await fetch('/api/hello', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setResponse(JSON.stringify(await res.json(), null, 2))
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Send className="h-5 w-5" />}
      title="POST /api/hello"
      file="routes/api/hello.ts → POST handler"
      description="Same file, different HTTP method. Parses JSON body with request.json() and returns a JSON response using Response.json()."
    >
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : 'POST'}
        </button>
      </div>
      {response !== null && (
        <div className="mt-3 overflow-x-auto rounded border bg-muted/50 p-3 font-mono text-xs whitespace-pre">
          {response}
        </div>
      )}
      <CodeBlock
        code={`POST: async ({ request }) => {
  const body = await request.json()
  return Response.json({
    message: \`Hello, \${body.name}!\`,
    receivedAt: new Date().toISOString(),
  })
}`}
      />
    </DemoCard>
  )
}

function EchoDemo() {
  const [body, setBody] = useState('{ "ping": "pong" }')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    try {
      const res = await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      setResponse(JSON.stringify(await res.json(), null, 2))
    } catch {
      setResponse('Error: invalid JSON')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<ArrowLeftRight className="h-5 w-5" />}
      title="POST /api/echo"
      file="routes/api/echo.ts → POST handler"
      description="Echoes back the request body, content type, method, and URL. Demonstrates reading request headers and setting custom response headers."
    >
      <div className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-1.5 font-mono text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : 'POST to /api/echo'}
        </button>
      </div>
      {response !== null && (
        <div className="mt-3 rounded border bg-muted/50 p-3 font-mono text-xs whitespace-pre overflow-x-auto">
          {response}
        </div>
      )}
    </DemoCard>
  )
}

function DynamicParamDemo() {
  const [userId, setUserId] = useState('1')
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}`)
    setStatus(res.status)
    setResponse(JSON.stringify(await res.json(), null, 2))
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<User className="h-5 w-5" />}
      title="GET /api/users/:userId"
      file="routes/api/users/$userId.ts → GET handler"
      description="Dynamic path params work the same as page routes. The $userId segment is captured and available via params.userId. Try IDs 1-3 for valid users, anything else for a 404."
    >
      <div className="flex gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          className="w-24 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : `GET /api/users/${userId}`}
        </button>
      </div>
      {response !== null && (
        <div className="mt-3">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                status === 200
                  ? 'bg-primary/10 text-primary'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {status}
            </span>
            <span className="text-xs text-muted-foreground">
              /api/users/{userId}
            </span>
          </div>
          <div className="overflow-x-auto rounded border bg-muted/50 p-3 font-mono text-xs whitespace-pre">
            {response}
          </div>
        </div>
      )}
      <CodeBlock
        code={`GET: async ({ params }) => {
  const user = mockUsers[params.userId]
  if (!user) {
    return Response.json(
      { error: 'User not found', userId: params.userId },
      { status: 404 },
    )
  }
  return Response.json(user)
}`}
      />
    </DemoCard>
  )
}

function CombinedRouteDemo() {
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    const res = await fetch('/server-routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'client', demo: true }),
    })
    setResponse(JSON.stringify(await res.json(), null, 2))
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<FileText className="h-5 w-5" />}
      title="Combined: server handler + component"
      file="routes/server-routes.tsx → POST handler + component"
      description="This page itself has a POST server handler. The same file defines both the UI component you're reading and an API endpoint. Browser navigation renders the component; a POST request hits the handler."
    >
      <button
        onClick={handleFetch}
        disabled={loading}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? '...' : 'POST to this page'}
      </button>
      {response !== null && (
        <div className="mt-3 overflow-x-auto rounded border bg-muted/50 p-3 font-mono text-xs whitespace-pre">
          {response}
        </div>
      )}
      <CodeBlock
        code={`export const Route = createFileRoute('/server-routes')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ message: '...', received: body })
      },
    },
  },
  component: ServerRoutesPage, // Same file!
})`}
      />
    </DemoCard>
  )
}

function ConventionsDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="File conventions"
      file="Same rules as page routes"
      description="Server routes follow the same file-based naming as TanStack Router page routes."
    >
      <div className="overflow-x-auto rounded border text-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-xs">File</th>
              <th className="px-3 py-2 text-left font-medium text-xs">
                Endpoint
              </th>
              <th className="px-3 py-2 text-left font-medium text-xs">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono text-xs">
            <tr>
              <td className="px-3 py-2">api/hello.ts</td>
              <td className="px-3 py-2 text-muted-foreground">/api/hello</td>
              <td className="px-3 py-2 text-muted-foreground">Static</td>
            </tr>
            <tr>
              <td className="px-3 py-2">api/users/$id.ts</td>
              <td className="px-3 py-2 text-muted-foreground">
                /api/users/:id
              </td>
              <td className="px-3 py-2 text-muted-foreground">Dynamic param</td>
            </tr>
            <tr>
              <td className="px-3 py-2">api/file/$.ts</td>
              <td className="px-3 py-2 text-muted-foreground">/api/file/*</td>
              <td className="px-3 py-2 text-muted-foreground">
                Wildcard (splat)
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">feed[.]json.ts</td>
              <td className="px-3 py-2 text-muted-foreground">/feed.json</td>
              <td className="px-3 py-2 text-muted-foreground">
                Escaped dot
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2">page.tsx</td>
              <td className="px-3 py-2 text-muted-foreground">/page</td>
              <td className="px-3 py-2 text-muted-foreground">
                Combined (handler + component)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Server routes vs server functions:</strong>{' '}
        Use server routes when you need raw HTTP endpoints (webhooks, APIs, file
        downloads). Use{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">createServerFn</code>{' '}
        when you need typed RPC calls from your components and loaders.
      </p>
    </DemoCard>
  )
}


function RouteRow({
  file,
  path,
  methods,
}: {
  file: string
  path: string
  methods: string
}) {
  return (
    <div className="flex flex-col gap-x-4 gap-y-0.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="break-all text-muted-foreground">{file}</span>
      <div className="flex items-center gap-2 pb-1.5 sm:pb-0">
        <span className="text-xs text-muted-foreground">{methods}</span>
        <code className="break-all text-foreground">{path}</code>
      </div>
    </div>
  )
}

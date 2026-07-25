import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import {
  getRequest,
  getRequestHeader,
  setResponseHeaders,
} from '@tanstack/react-start/server'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard } from '~/components/demo'
import { pageHead } from '~/lib/site'
import { getGreeting } from '~/utils/greetings.functions'
import {
  Server,
  Send,
  ShieldCheck,
  AlertTriangle,
  FolderTree,
  FileText,
  Wifi,
  FormInput,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// 1. Basic GET server function
// ---------------------------------------------------------------------------
const getServerTime = createServerFn({ method: 'GET' }).handler(async () => {
  return { time: new Date().toISOString(), pid: Math.floor(Math.random() * 10000) }
})

// ---------------------------------------------------------------------------
// 2. POST server function with input validation
// ---------------------------------------------------------------------------
const addNumbers = createServerFn({ method: 'POST' })
  .inputValidator((data: { a: number; b: number }) => {
    if (typeof data.a !== 'number' || typeof data.b !== 'number') {
      throw new Error('Both a and b must be numbers')
    }
    return data
  })
  .handler(async ({ data }) => {
    return { result: data.a + data.b, computedOn: 'server' }
  })

// ---------------------------------------------------------------------------
// 3. Server function that reads request context
// ---------------------------------------------------------------------------
const getRequestInfo = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const url = new URL(request.url)

  setResponseHeaders(
    new Headers({ 'X-Custom-Header': 'set-by-server-fn' }),
  )

  return {
    method: request.method,
    pathname: url.pathname,
    userAgent: getRequestHeader('user-agent') ?? 'unknown',
    accept: getRequestHeader('accept') ?? 'unknown',
    host: url.host,
  }
})

// ---------------------------------------------------------------------------
// 4. Server function with error handling
// ---------------------------------------------------------------------------
const riskyFunction = createServerFn({ method: 'POST' })
  .inputValidator((data: { shouldFail: boolean }) => data)
  .handler(async ({ data }) => {
    if (data.shouldFail) {
      throw new Error('Intentional server error — this is expected!')
    }
    return { success: true, message: 'No error this time.' }
  })

// ---------------------------------------------------------------------------
// 5. Form data server function
// ---------------------------------------------------------------------------
const submitContactForm = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData')
    }
    const name = data.get('name')?.toString() || ''
    const email = data.get('email')?.toString() || ''
    const message = data.get('message')?.toString() || ''
    if (!name || !email) {
      throw new Error('Name and email are required')
    }
    return { name, email, message }
  })
  .handler(async ({ data }) => {
    // In a real app: save to DB, send email, etc.
    return {
      received: true,
      echo: data,
      processedAt: new Date().toISOString(),
    }
  })

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/server-fns')({
  head: () =>
    pageHead({
      title: 'Server Functions — claude-start-cf Template',
      description:
        'The server function RPC pattern in TanStack Start: input validation, FormData, error handling, and file organization.',
      path: '/server-fns',
    }),
  loader: async () => {
    const time = await getServerTime()
    const requestInfo = await getRequestInfo()
    return { time, requestInfo }
  },
  component: ServerFnsPage,
})

function ServerFnsPage() {
  const { time, requestInfo } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight">Server Functions</h1>
        <p className="mt-2 text-muted-foreground">
          Server functions run on the server but can be called from anywhere —
          loaders, components, event handlers. On the client they become RPC
          calls automatically.
        </p>

        <div className="mt-10 space-y-8">
          <BasicGetDemo initialTime={time} />
          <PostWithValidationDemo />
          <RequestContextDemo requestInfo={requestInfo} />
          <ErrorHandlingDemo />
          <FormDataDemo />
          <UseServerFnDemo />
          <FileOrgDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demo sections
// ---------------------------------------------------------------------------

function BasicGetDemo({
  initialTime,
}: {
  initialTime: { time: string; pid: number }
}) {
  const [data, setData] = useState(initialTime)
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    const result = await getServerTime()
    setData(result)
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Server className="h-5 w-5" />}
      title="Basic GET server function"
      file="createServerFn({ method: 'GET' }).handler(async () => { ... })"
      description="The simplest pattern. Define a handler, call it from anywhere. During SSR it runs directly. From the client it becomes a fetch request."
    >
      <div className="space-y-2 text-sm">
        <KV label="Server time" value={data.time} />
        <KV label="Worker PID" value={String(data.pid)} />
      </div>
      <button
        onClick={handleFetch}
        disabled={loading}
        className="mt-4 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Call getServerTime()'}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        First load came from the loader (SSR). Clicking calls it client-side
        via RPC.
      </p>
    </DemoCard>
  )
}

function PostWithValidationDemo() {
  const [a, setA] = useState('3')
  const [b, setB] = useState('7')
  const [result, setResult] = useState<{
    result: number
    computedOn: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    setLoading(true)
    try {
      const res = await addNumbers({ data: { a: Number(a), b: Number(b) } })
      setResult(res)
    } catch {
      setResult(null)
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<ShieldCheck className="h-5 w-5" />}
      title="POST with input validation"
      file=".inputValidator((data) => { ... }).handler(async ({ data }) => { ... })"
      description="Input validators run before the handler. They validate and transform the data that crosses the network boundary. Use plain functions or Zod schemas."
    >
      <div className="flex items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">a</label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1 block w-20 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <span className="pb-2 text-muted-foreground">+</span>
        <div>
          <label className="text-xs text-muted-foreground">b</label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="mt-1 block w-20 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : 'Compute on server'}
        </button>
      </div>
      {result && (
        <div className="mt-3 space-y-1 text-sm">
          <KV label="Result" value={String(result.result)} />
          <KV label="Computed on" value={result.computedOn} />
        </div>
      )}
      <div className="mt-4 rounded border bg-muted/50 p-3">
        <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`const addNumbers = createServerFn({ method: 'POST' })
  .inputValidator((data: { a: number; b: number }) => {
    if (typeof data.a !== 'number') throw new Error('...')
    return data
  })
  .handler(async ({ data }) => {
    return { result: data.a + data.b }
  })`}
        </pre>
      </div>
    </DemoCard>
  )
}

function RequestContextDemo({
  requestInfo,
}: {
  requestInfo: {
    method: string
    pathname: string
    userAgent: string
    accept: string
    host: string
  }
}) {
  const [info, setInfo] = useState(requestInfo)
  const [loading, setLoading] = useState(false)

  async function handleRefetch() {
    setLoading(true)
    const result = await getRequestInfo()
    setInfo(result)
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Wifi className="h-5 w-5" />}
      title="Request context"
      file="getRequest(), getRequestHeader(), setResponseHeaders()"
      description="Inside a handler you can access the incoming request, read headers, and set response headers. Useful for auth checks, caching, and logging."
    >
      <div className="space-y-2 text-sm">
        <KV label="Method" value={info.method} />
        <KV label="Path" value={info.pathname} />
        <KV label="Host" value={info.host} />
        <KV
          label="User-Agent"
          value={
            info.userAgent.length > 50
              ? info.userAgent.slice(0, 50) + '...'
              : info.userAgent
          }
        />
      </div>
      <button
        onClick={handleRefetch}
        disabled={loading}
        className="mt-4 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Re-fetch from client'}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        On SSR the request comes from the initial page load. On re-fetch
        it comes from the client RPC call — notice the path changes.
      </p>
    </DemoCard>
  )
}

function ErrorHandlingDemo() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCall(shouldFail: boolean) {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await riskyFunction({ data: { shouldFail } })
      setResult(res.message)
    } catch (e: any) {
      setError(e.message ?? 'Unknown error')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<AlertTriangle className="h-5 w-5" />}
      title="Error handling"
      file="throw new Error() / throw redirect() / throw notFound()"
      description="Errors thrown in server functions are serialized to the client. You can also throw redirect() for navigation or notFound() for 404s."
    >
      <div className="flex gap-2">
        <button
          onClick={() => handleCall(false)}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Call (success)
        </button>
        <button
          onClick={() => handleCall(true)}
          disabled={loading}
          className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
        >
          Call (will throw)
        </button>
      </div>
      {result && (
        <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
          {result}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Caught: {error}
        </div>
      )}
      <div className="mt-4 rounded border bg-muted/50 p-3">
        <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`// Errors
throw new Error('Something went wrong')

// Redirects (auth, navigation)
throw redirect({ to: '/login' })

// 404s (missing resources)
throw notFound()`}
        </pre>
      </div>
    </DemoCard>
  )
}

function FormDataDemo() {
  const [result, setResult] = useState<{
    received: boolean
    echo: { name: string; email: string; message: string }
    processedAt: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await submitContactForm({ data: formData })
      setResult(res)
    } catch (err: any) {
      setError(err.message ?? 'Submission failed')
    }
  }

  return (
    <DemoCard
      icon={<FormInput className="h-5 w-5" />}
      title="FormData handling"
      file=".inputValidator((data) => { /* parse FormData */ })"
      description="Server functions can accept FormData directly. The input validator parses it into a typed object before the handler runs. Works with progressive enhancement — the form can submit without JS too."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <textarea
          name="message"
          placeholder="Message (optional)"
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Submit via server function
        </button>
      </form>
      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-3 space-y-1 text-sm">
          <KV label="Name" value={result.echo.name} />
          <KV label="Email" value={result.echo.email} />
          <KV label="Message" value={result.echo.message || '(empty)'} />
          <KV label="Processed at" value={result.processedAt} />
        </div>
      )}
    </DemoCard>
  )
}

function UseServerFnDemo() {
  const greetFn = useServerFn(getGreeting)
  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleGreet() {
    if (!name.trim()) return
    setLoading(true)
    const result = await greetFn({ data: { name } })
    setGreeting(result.message)
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Send className="h-5 w-5" />}
      title="useServerFn hook"
      file="const fn = useServerFn(myServerFn)"
      description="The useServerFn hook wraps a server function for use in components. It handles pending states and integrates with React's transition model."
    >
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          onKeyDown={(e) => e.key === 'Enter' && handleGreet()}
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleGreet}
          disabled={loading || !name.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : 'Greet'}
        </button>
      </div>
      {greeting && (
        <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
          {greeting}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        This calls{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">getGreeting</code> from{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">~/utils/greetings.functions.ts</code>,
        which imports server-only logic from{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">greetings.server.ts</code>.
      </p>
    </DemoCard>
  )
}

function FileOrgDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="File organization"
      file="*.functions.ts / *.server.ts / *.ts"
      description="Recommended pattern for organizing server-side code. Separates RPC boundaries from internal server logic."
    >
      <div className="space-y-4 text-sm">
        <div className="rounded border bg-muted/50 p-3">
          <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`src/utils/
├── greetings.functions.ts   # createServerFn wrappers (import anywhere)
├── greetings.server.ts      # Server-only helpers (DB, internal logic)
└── schemas.ts               # Shared types & validation (client-safe)`}
          </pre>
        </div>

        <div className="space-y-3">
          <FileBlock
            filename="greetings.server.ts"
            label="Server-only helper"
            code={`// Only import inside server function handlers
export function buildGreeting(name: string) {
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]
  return \`\${greeting}, \${name}!\`
}`}
          />
          <FileBlock
            filename="greetings.functions.ts"
            label="Server function wrapper"
            code={`import { createServerFn } from '@tanstack/react-start'
import { buildGreeting } from './greetings.server'

export const getGreeting = createServerFn({ method: 'GET' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return { message: buildGreeting(data.name) }
  })`}
          />
          <FileBlock
            filename="component.tsx"
            label="Client component (safe import)"
            code={`// ✅ Static import — build replaces with RPC stub
import { getGreeting } from '~/utils/greetings.functions'

const result = await getGreeting({ data: { name: 'World' } })`}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Key rule:</strong>{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">*.functions.ts</code> files
          can be imported anywhere. <code className="rounded bg-muted px-1 py-0.5 font-mono">*.server.ts</code> files
          should only be imported inside server function handlers — the build
          process tree-shakes them from the client bundle.
        </p>
      </div>
    </DemoCard>
  )
}


function FileBlock({
  filename,
  label,
  code,
}: {
  filename: string
  label: string
  code: string
}) {
  return (
    <div className="rounded border">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-xs">{filename}</span>
        <span className="text-xs text-muted-foreground">— {label}</span>
      </div>
      <div className="p-3">
        <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
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

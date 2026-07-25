import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard } from '~/components/demo'
import { pageHead } from '~/lib/site'
import { Lock, Globe, FileText, ShieldCheck, Cloud, KeyRound, Terminal } from 'lucide-react'

// ---------------------------------------------------------------------------
// Server function — can access ALL env vars (no VITE_ prefix needed)
// On the client this becomes an RPC call, so secrets stay server-side.
// ---------------------------------------------------------------------------
const getServerEnv = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    // Return metadata about what's available, never return actual secrets
    hasSecretApiKey: !!process.env.SECRET_API_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV ?? 'undefined',
    // Safe to return: presence and length only — never any actual characters
    secretKeyPreview: process.env.SECRET_API_KEY
      ? `set (${process.env.SECRET_API_KEY.length} chars)`
      : 'not set',
    // Cloudflare wrangler.jsonc [vars] — also accessible via process.env
    appEnvironment: process.env.APP_ENVIRONMENT ?? 'not set',
    demoWranglerVar: process.env.DEMO_WRANGLER_VAR ?? 'not set',
  }
})

// ---------------------------------------------------------------------------
// Route — loader delegates to server function for server-side env access
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/env')({
  head: () =>
    pageHead({
      title: 'Environment Variables — claude-start-cf Template',
      description:
        'How env vars work in TanStack Start on Cloudflare: VITE_ client vars, server-only vars, wrangler secrets, and .dev.vars.',
      path: '/env',
    }),
  loader: async () => {
    const serverEnv = await getServerEnv()
    return { serverEnv }
  },
  component: EnvPage,
})

function EnvPage() {
  const { serverEnv } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Environment Variables
        </h1>
        <p className="mt-2 text-muted-foreground">
          TanStack Start has two env var boundaries:{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
            VITE_
          </code>{' '}
          prefixed vars are baked into the client bundle at build time.
          Everything else is server-only.
        </p>

        {/* File hierarchy */}
        <div className="mt-8 rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Where config lives</h2>
                <p className="text-xs text-muted-foreground">
                  Cloudflare Workers config sources
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-1 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span>wrangler.jsonc vars</span>
                <span className="text-xs text-primary">
                  non-secret config — committed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>wrangler secret</span>
                <span className="text-xs text-primary">
                  production secrets — encrypted
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>.dev.vars</span>
                <span className="text-xs text-destructive">
                  local dev secrets — gitignored
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>.env</span>
                <span className="text-xs text-muted-foreground">
                  VITE_ build-time vars only — gitignored
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <ClientEnvDemo />
          <ServerEnvDemo serverEnv={serverEnv} />
          <SecurityBoundaryDemo />
          <CloudflareVarsDemo serverEnv={serverEnv} />
          <CloudflareSecretsDemo />
          <CloudflareAccessPatternDemo />
          <TypeSafetyDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demo sections
// ---------------------------------------------------------------------------

function ClientEnvDemo() {
  return (
    <DemoCard
      icon={<Globe className="h-5 w-5" />}
      title="Client variables (VITE_ prefix)"
      file="import.meta.env.VITE_APP_NAME"
      description="Variables with the VITE_ prefix are statically replaced at build time and included in the JavaScript bundle. Use for public config only — app name, public API URLs, feature flags."
    >
      <div className="space-y-2 text-sm">
        <KV
          label="VITE_APP_NAME"
          value={import.meta.env.VITE_APP_NAME ?? 'undefined'}
        />
        <KV
          label="VITE_APP_VERSION"
          value={import.meta.env.VITE_APP_VERSION ?? 'undefined'}
        />
        <KV
          label="VITE_PUBLIC_API_URL"
          value={import.meta.env.VITE_PUBLIC_API_URL ?? 'undefined'}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        These values are embedded in the JS at build time. Changing them
        requires a rebuild and redeploy.
      </p>
    </DemoCard>
  )
}

type ServerEnvData = {
  hasSecretApiKey: boolean
  hasDatabaseUrl: boolean
  nodeEnv: string
  secretKeyPreview: string
  appEnvironment: string
  demoWranglerVar: string
}

function ServerEnvDemo({
  serverEnv,
}: {
  serverEnv: ServerEnvData
}) {
  return (
    <DemoCard
      icon={<Lock className="h-5 w-5" />}
      title="Server variables (no prefix)"
      file="process.env.SECRET_API_KEY (inside createServerFn)"
      description="Variables without VITE_ prefix are only accessible in server functions. The server function returns metadata about the vars — never the actual values."
    >
      <div className="space-y-2 text-sm">
        <KV
          label="SECRET_API_KEY"
          value={serverEnv.hasSecretApiKey ? serverEnv.secretKeyPreview : 'not set'}
        />
        <KV
          label="DATABASE_URL"
          value={serverEnv.hasDatabaseUrl ? 'set (hidden)' : 'not set'}
        />
        <KV label="NODE_ENV" value={serverEnv.nodeEnv} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        The server function only returns whether vars are set, not their values.
        The actual secrets never leave the server.
      </p>
    </DemoCard>
  )
}

function SecurityBoundaryDemo() {
  // Attempting to access non-VITE vars from client code
  const attemptedSecret = (import.meta.env as any).SECRET_API_KEY
  const attemptedDbUrl = (import.meta.env as any).DATABASE_URL

  return (
    <DemoCard
      icon={<ShieldCheck className="h-5 w-5" />}
      title="Security boundary"
      file="import.meta.env.SECRET_API_KEY → undefined"
      description="Attempting to access non-VITE_ variables from client code returns undefined. Vite strips them from the bundle at build time."
    >
      <div className="space-y-3 text-sm">
        <div className="space-y-2">
          <KV
            label="import.meta.env.SECRET_API_KEY"
            value={attemptedSecret ?? 'undefined'}
          />
          <KV
            label="import.meta.env.DATABASE_URL"
            value={attemptedDbUrl ?? 'undefined'}
          />
        </div>
        <div className="rounded border border-destructive/30 bg-destructive/5 p-3">
          <p className="font-mono text-xs text-destructive">
            {'// ❌ These return undefined on the client'}
          </p>
          <p className="font-mono text-xs text-destructive">
            {'import.meta.env.SECRET_API_KEY // undefined'}
          </p>
          <p className="font-mono text-xs text-destructive">
            {'process.env.SECRET_API_KEY     // not available'}
          </p>
        </div>
        <div className="rounded border border-primary/30 bg-primary/5 p-3">
          <p className="font-mono text-xs text-primary">
            {'// ✅ Access secrets through server functions'}
          </p>
          <p className="font-mono text-xs text-primary">
            {'const getData = createServerFn().handler(async () => {'}
          </p>
          <p className="font-mono text-xs text-primary pl-4">
            {'return fetch(url, { headers: { Authorization: process.env.SECRET_API_KEY } })'}
          </p>
          <p className="font-mono text-xs text-primary">
            {'})'}
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

function TypeSafetyDemo() {
  return (
    <DemoCard
      icon={<ShieldCheck className="h-5 w-5" />}
      title="Type safety with env.d.ts"
      file="src/env.d.ts"
      description="Declare your env var types so TypeScript catches missing or mistyped variables at compile time."
    >
      <div className="space-y-3 text-sm">
        <div className="rounded border bg-muted/50 p-3">
          <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_PUBLIC_API_URL: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly SECRET_API_KEY: string
      readonly DATABASE_URL: string
    }
  }
}`}
          </pre>
        </div>
        <p className="text-xs text-muted-foreground">
          With this file, <code className="rounded bg-muted px-1 py-0.5 font-mono">import.meta.env.VITE_TYPO</code> would
          be a TypeScript error. See{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">src/env.d.ts</code> in
          this project for the full declaration.
        </p>
      </div>
    </DemoCard>
  )
}

function CloudflareVarsDemo({ serverEnv }: { serverEnv: ServerEnvData }) {
  return (
    <DemoCard
      icon={<Cloud className="h-5 w-5" />}
      title="Cloudflare vars (wrangler.jsonc)"
      file='wrangler.jsonc → "vars": { ... }'
      description="Non-secret config values defined in wrangler.jsonc under vars. These are plain text, committed to your repo, and available at runtime via process.env inside server functions. Use for environment labels, feature flags, region config."
    >
      <div className="space-y-2 text-sm">
        <KV label="APP_ENVIRONMENT" value={serverEnv.appEnvironment} />
        <KV label="DEMO_WRANGLER_VAR" value={serverEnv.demoWranglerVar} />
      </div>
      <div className="mt-4 rounded border bg-muted/50 p-3">
        <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`// wrangler.jsonc
{
  "vars": {
    "APP_ENVIRONMENT": "production",
    "DEMO_WRANGLER_VAR": "set-via-wrangler-jsonc"
  }
}`}
        </pre>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        These values are live — read from the Worker runtime on each request,
        not baked in at build time. You can also override per-environment using
        the Cloudflare dashboard.
      </p>
    </DemoCard>
  )
}

function CloudflareSecretsDemo() {
  return (
    <DemoCard
      icon={<KeyRound className="h-5 w-5" />}
      title="Cloudflare secrets (encrypted)"
      file="wrangler secret put SECRET_NAME"
      description="For actual secrets (API keys, database credentials, JWT secrets), use Cloudflare's encrypted secret storage. Secrets are never stored in your repo or wrangler.jsonc — they're set via the CLI or dashboard and encrypted at rest."
    >
      <div className="space-y-4 text-sm">
        {/* How to set */}
        <div>
          <p className="font-medium text-foreground mb-2">Setting secrets</p>
          <div className="space-y-2">
            <div className="rounded border bg-muted/50 p-3">
              <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`# Set a secret interactively (prompts for value)
wrangler secret put DATABASE_URL

# Set from a pipe (CI/CD)
echo "postgresql://..." | wrangler secret put DATABASE_URL

# Set for a specific environment
wrangler secret put DATABASE_URL --env staging`}
              </pre>
            </div>
          </div>
        </div>

        {/* How to list */}
        <div>
          <p className="font-medium text-foreground mb-2">Managing secrets</p>
          <div className="rounded border bg-muted/50 p-3">
            <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
{`# List all secrets (names only, values are hidden)
wrangler secret list

# Delete a secret
wrangler secret delete DATABASE_URL`}
            </pre>
          </div>
        </div>

        {/* How to access */}
        <div>
          <p className="font-medium text-foreground mb-2">Accessing in code</p>
          <div className="rounded border border-primary/30 bg-primary/5 p-3">
            <pre className="font-mono text-xs text-primary leading-relaxed">
{`// Secrets are accessed the same way as vars
const getDb = createServerFn().handler(async () => {
  const url = process.env.DATABASE_URL
  return db.connect(url)
})`}
            </pre>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Secrets and vars merge into the same <code className="rounded bg-muted px-1 py-0.5 font-mono">process.env</code> namespace
          at runtime. The only difference is how they're stored — vars are plain text in
          wrangler.jsonc, secrets are encrypted on Cloudflare's infrastructure.
        </p>
      </div>
    </DemoCard>
  )
}

function CloudflareAccessPatternDemo() {
  return (
    <DemoCard
      icon={<Terminal className="h-5 w-5" />}
      title="How process.env works on Workers"
      file="nodejs_compat → process.env"
      description="Cloudflare Workers don't natively have process.env. The nodejs_compat flag shims it, making wrangler vars and secrets available through the standard Node.js API."
    >
      <div className="space-y-4 text-sm">
        {/* The three sources */}
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Source</th>
                <th className="px-3 py-2 text-left font-medium">When available</th>
                <th className="px-3 py-2 text-left font-medium">Stored in repo?</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-2 font-mono">.dev.vars</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Local dev runtime
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Gitignored
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">.env</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Build time only (VITE_ vars)
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Gitignored
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">wrangler.jsonc vars</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Dev + production runtime
                </td>
                <td className="px-3 py-2 text-foreground">
                  Yes (plain text)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">wrangler secret</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Dev + production runtime
                </td>
                <td className="px-3 py-2 text-primary">
                  No (encrypted)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono">CF Dashboard</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Production runtime only
                </td>
                <td className="px-3 py-2 text-primary">
                  No (encrypted)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Decision guide */}
        <div className="space-y-2">
          <p className="font-medium text-foreground">Which to use?</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">wrangler.jsonc vars</strong> —
              Non-secret config: environment labels, feature flags, public API URLs.
              Committed to git so the whole team shares them.
            </p>
            <p>
              <strong className="text-foreground">wrangler secret put</strong> —
              Actual secrets: database URLs, API keys, JWT signing keys.
              Encrypted, never in source control. Set once per environment.
            </p>
            <p>
              <strong className="text-foreground">CF Dashboard</strong> —
              Same as secrets but managed through the web UI. Good for
              non-developers or one-off overrides.
            </p>
            <p>
              <strong className="text-foreground">.dev.vars</strong> —
              Local dev secrets. Loaded by Miniflare during{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono">npm run dev</code>.
              Not used in production.
            </p>
            <p>
              <strong className="text-foreground">.env</strong> —
              Vite build-time vars only (VITE_ prefix).
              Not used at runtime on Workers.
            </p>
          </div>
        </div>
      </div>
    </DemoCard>
  )
}


function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground font-mono text-xs">{label}</span>
      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
        {value}
      </code>
    </div>
  )
}

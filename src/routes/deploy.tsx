import { createFileRoute } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'
import {
  Rocket,
  CheckCircle,
  FileCode,
  Database,
  HardDrive,
  Lock,
  Upload,
  Terminal,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/deploy')({
  head: () => ({
    meta: [
      { title: 'Deploy — claude-start-cf Template' },
      {
        name: 'description',
        content:
          'Setup, configuration, and deployment guide for TanStack Start on Cloudflare Workers with D1, R2, and wrangler.',
      },
    ],
  }),
  component: DeployPage,
})

function DeployPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deploy</h1>
          <p className="mt-2 text-muted-foreground">
            Everything you need to set up, configure, and deploy this template to
            Cloudflare Workers.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <PrerequisitesDemo />
          <ProjectConfigDemo />
          <D1SetupDemo />
          <R2SetupDemo />
          <SecretsDemo />
          <DeploymentDemo />
          <LocalDevDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function PrerequisitesDemo() {
  return (
    <DemoCard
      icon={<CheckCircle className="h-5 w-5" />}
      title="Prerequisites"
      file="One-time setup"
      description="Before you begin, make sure you have Node.js installed and a Cloudflare account. Then install and authenticate the wrangler CLI."
    >
      <CodeBlock
        code={`# Install wrangler globally
npm install -g wrangler

# Authenticate with your Cloudflare account
wrangler login`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler login</code> opens
        your browser to authorize the CLI. You only need to do this once per machine.
      </p>
    </DemoCard>
  )
}

function ProjectConfigDemo() {
  return (
    <DemoCard
      icon={<FileCode className="h-5 w-5" />}
      title="Project Configuration"
      file="wrangler.jsonc"
      description="The wrangler.jsonc file is the central config for your Cloudflare project — worker name, compatibility settings, environment variables, and resource bindings."
    >
      <CodeBlock
        code={`{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "claude-start-cf",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",

  // Non-secret vars — available via process.env
  "vars": {
    "APP_ENVIRONMENT": "production",
    "DEMO_WRANGLER_VAR": "set-via-wrangler-jsonc"
  },

  // Resource bindings (D1, R2, KV, etc.)
  "d1_databases": [ ... ],
  "r2_buckets": [ ... ]
}`}
      />
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">name</strong> — The worker name on Cloudflare (also
          the default subdomain: <code className="rounded bg-muted px-1 py-0.5 font-mono">name.workers.dev</code>).
        </p>
        <p>
          <strong className="text-foreground">compatibility_date</strong> — Pins the Workers
          runtime behavior to a specific date. Update periodically to get new features.
        </p>
        <p>
          <strong className="text-foreground">nodejs_compat</strong> — Enables Node.js API
          compatibility in Workers (required by TanStack Start).
        </p>
      </div>
    </DemoCard>
  )
}

function D1SetupDemo() {
  return (
    <DemoCard
      icon={<Database className="h-5 w-5" />}
      title="D1 Database Setup"
      file="wrangler d1 create"
      description="Create a D1 database, add the binding to your config, and run migrations."
    >
      <CodeBlock
        code={`# Create a new D1 database
wrangler d1 create acme-db

# Output:
# ✅ Successfully created DB 'acme-db'
# database_id = "40793ebc-0810-..."
# database_name = "acme-db"`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Copy the output into your <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler.jsonc</code>:
      </p>
      <CodeBlock
        code={`"d1_databases": [
  {
    "binding": "DB",
    "database_name": "acme-db",
    "database_id": "40793ebc-0810-434d-..."
  }
]`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Run migrations against your remote database:
      </p>
      <CodeBlock
        code={`# Apply migrations to remote D1
wrangler d1 migrations apply acme-db --remote

# Or execute SQL directly
wrangler d1 execute acme-db --remote --command "SELECT * FROM users"`}
      />
    </DemoCard>
  )
}

function R2SetupDemo() {
  return (
    <DemoCard
      icon={<HardDrive className="h-5 w-5" />}
      title="R2 Bucket Setup"
      file="wrangler r2 bucket create"
      description="Create an R2 bucket for object storage and add the binding to your config."
    >
      <CodeBlock
        code={`# Create a new R2 bucket
wrangler r2 bucket create acme-bucket

# Output:
# ✅ Created bucket 'acme-bucket'`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Add the binding to <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler.jsonc</code>:
      </p>
      <CodeBlock
        code={`"r2_buckets": [
  {
    "binding": "BUCKET",
    "bucket_name": "acme-bucket"
  }
]`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        The binding name (<code className="rounded bg-muted px-1 py-0.5 font-mono">BUCKET</code>)
        is how you access it in code via{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">env.BUCKET</code> in Workers
        or through the Cloudflare context in server functions.
      </p>
    </DemoCard>
  )
}

function SecretsDemo() {
  return (
    <DemoCard
      icon={<Lock className="h-5 w-5" />}
      title="Secrets & Environment Variables"
      file=".dev.vars / wrangler secret"
      description="Three ways to set environment variables: wrangler.jsonc vars for non-secrets, wrangler secret for production secrets, and .dev.vars for local development."
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Non-secret vars (committed to repo)
          </h3>
          <CodeBlock
            code={`// wrangler.jsonc
"vars": {
  "APP_ENVIRONMENT": "production",
  "PUBLIC_API_URL": "https://api.example.com"
}`}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground">
            Production secrets (encrypted, never in repo)
          </h3>
          <CodeBlock
            code={`# Set a secret for production
wrangler secret put API_KEY
# Enter value when prompted

# List all secrets
wrangler secret list`}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground">
            Local development secrets
          </h3>
          <CodeBlock
            code={`# .dev.vars (gitignored)
API_KEY=sk-local-dev-key-here
DATABASE_URL=http://localhost:8787`}
          />
        </div>
      </div>

      <div className="mt-4 rounded border border-yellow-500/30 bg-yellow-500/5 p-3">
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          <strong>VITE_ prefix:</strong> Variables prefixed with{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">VITE_</code> are exposed
          to client-side code. Never use this prefix for secrets.
        </p>
      </div>
    </DemoCard>
  )
}

function DeploymentDemo() {
  return (
    <DemoCard
      icon={<Upload className="h-5 w-5" />}
      title="Deployment"
      file="npm run deploy"
      description="Deploy your app to Cloudflare Workers with a single command. Under the hood it builds with Vite then uploads via wrangler."
    >
      <CodeBlock
        code={`# Build and deploy to production
npm run deploy

# What this runs:
# 1. npm run build  → vite build && tsc --noEmit
# 2. wrangler deploy → uploads worker + assets to Cloudflare`}
      />
      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">Build step</strong> — Vite bundles your app (SSR +
          client), TanStack Start generates the server entry, and TypeScript checks types.
        </p>
        <p>
          <strong className="text-foreground">Deploy step</strong> — Wrangler uploads the worker
          bundle and static assets to Cloudflare's edge network. Your app is live at{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            name.workers.dev
          </code>{' '}
          (or your custom domain).
        </p>
      </div>
      <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-primary">
          <strong>First deploy?</strong> Make sure you've created your D1 database and R2 bucket
          first, and that the IDs in <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler.jsonc</code> match.
        </p>
      </div>
    </DemoCard>
  )
}

function LocalDevDemo() {
  return (
    <DemoCard
      icon={<Terminal className="h-5 w-5" />}
      title="Local Development"
      file="npm run dev"
      description="Run your app locally with Miniflare — a local Cloudflare Workers simulator that provides D1, R2, and other bindings without deploying."
    >
      <CodeBlock
        code={`# Start local dev server
npm run dev

# Runs Vite dev server with Cloudflare plugin
# → Local D1 database (SQLite file in .wrangler/)
# → Local R2 bucket (files in .wrangler/)
# → Hot module replacement
# → Server functions with Workers runtime`}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Local secrets are loaded from{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">.dev.vars</code> in your
        project root. This file is gitignored by default.
      </p>
      <div className="mt-3 rounded border border-primary/30 bg-primary/5 p-3">
        <p className="text-xs text-primary">
          <strong>Tip:</strong> Run{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            npm run cf-typegen
          </code>{' '}
          after changing <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler.jsonc</code> to
          regenerate TypeScript types for your bindings.
        </p>
      </div>
    </DemoCard>
  )
}

// ---------------------------------------------------------------------------
// Shared UI
// ---------------------------------------------------------------------------

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="mt-2 rounded border bg-muted/50 p-3">
      <pre className="font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre overflow-x-auto">
        {code}
      </pre>
    </div>
  )
}

function DemoCard({
  icon,
  title,
  file,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  file: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold">{title}</h2>
            <code className="text-xs text-muted-foreground">{file}</code>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

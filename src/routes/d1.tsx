import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDB } from '~/lib/env'
import { pageHead } from '~/lib/site'
import {
  MAX_NOTES,
  MAX_NOTE_TITLE_LENGTH,
  MAX_NOTE_BODY_LENGTH,
} from '~/lib/demo-limits'
import { SiteNav } from '~/components/SiteNav'
import { DemoCard, CodeBlock } from '~/components/demo'
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  FolderTree,
  Terminal,
  Code,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Note = {
  id: number
  title: string
  body: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Server functions — all D1 access happens here via getDB()
// ---------------------------------------------------------------------------
const initTable = createServerFn({ method: 'POST' }).handler(async () => {
  const db = getDB()
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    )
    .run()
  return { success: true }
})

const listNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDB()

  // Ensure the table exists before querying
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    )
    .run()

  const { results } = await db
    .prepare('SELECT * FROM notes ORDER BY id DESC')
    .all<Note>()
  return results
})

const createNote = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; body: string }) => {
    if (!data.title.trim()) throw new Error('Title is required')
    if (data.title.length > MAX_NOTE_TITLE_LENGTH)
      throw new Error(`Title is limited to ${MAX_NOTE_TITLE_LENGTH} characters`)
    if (data.body.length > MAX_NOTE_BODY_LENGTH)
      throw new Error(`Body is limited to ${MAX_NOTE_BODY_LENGTH} characters`)
    return data
  })
  .handler(async ({ data }) => {
    const db = getDB()
    // The notes table is shared by every visitor to the live demo, so cap it
    const { results } = await db
      .prepare('SELECT COUNT(*) as count FROM notes')
      .all<{ count: number }>()
    if ((results[0]?.count ?? 0) >= MAX_NOTES) {
      throw new Error(
        `Demo limit reached (${MAX_NOTES} notes). Delete some notes first.`,
      )
    }
    const result = await db
      .prepare('INSERT INTO notes (title, body) VALUES (?, ?)')
      .bind(data.title, data.body)
      .run()
    return { id: result.meta.last_row_id }
  })

const deleteNote = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    await db.prepare('DELETE FROM notes WHERE id = ?').bind(data.id).run()
    return { success: true }
  })

const getTableInfo = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDB()

  // Ensure table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
    )
    .run()

  const { results: schema } = await db
    .prepare("PRAGMA table_info('notes')")
    .all<{ cid: number; name: string; type: string; notnull: number; pk: number }>()

  const { results: countResult } = await db
    .prepare('SELECT COUNT(*) as count FROM notes')
    .all<{ count: number }>()

  return {
    schema,
    rowCount: countResult[0]?.count ?? 0,
  }
})

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/d1')({
  head: () =>
    pageHead({
      title: 'D1 Database — claude-start-cf Template',
      description:
        'Cloudflare D1 CRUD demo: parameterized queries, schema introspection, and server function data access from TanStack Start.',
      path: '/d1',
    }),
  loader: async () => {
    const [notes, tableInfo] = await Promise.all([listNotes(), getTableInfo()])
    return { notes, tableInfo }
  },
  component: D1Page,
})

function D1Page() {
  const { notes, tableInfo } = Route.useLoaderData()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await router.invalidate()
    setRefreshing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">D1 Database</h1>
            <p className="mt-2 text-muted-foreground">
              Cloudflare D1 is a serverless SQLite database that runs at the
              edge. Accessed via{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                getDB()
              </code>{' '}
              inside server functions.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        <div className="mt-10 space-y-8">
          <SetupDemo schema={tableInfo.schema} rowCount={tableInfo.rowCount} />
          <CreateNoteDemo onCreated={handleRefresh} />
          <NotesListDemo notes={notes} onDeleted={handleRefresh} />
          <EnvHelperDemo />
          <PatternDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function SetupDemo({
  schema,
  rowCount,
}: {
  schema: { cid: number; name: string; type: string; notnull: number; pk: number }[]
  rowCount: number
}) {
  return (
    <DemoCard
      icon={<Database className="h-5 w-5" />}
      title="Table schema"
      file="PRAGMA table_info('notes')"
      description="The notes table is created automatically on first load via CREATE TABLE IF NOT EXISTS. Here's the live schema from D1."
    >
      <div className="overflow-x-auto rounded border text-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-medium">
                Column
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium">PK</th>
              <th className="px-3 py-2 text-left text-xs font-medium">
                NOT NULL
              </th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono text-xs">
            {schema.map((col) => (
              <tr key={col.cid}>
                <td className="px-3 py-2">{col.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{col.type}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {col.pk ? 'yes' : ''}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {col.notnull ? 'yes' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {rowCount} row{rowCount !== 1 ? 's' : ''} in the database.
      </p>
    </DemoCard>
  )
}

function CreateNoteDemo({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createNote({ data: { title, body } })
      setTitle('')
      setBody('')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Plus className="h-5 w-5" />}
      title="Create a note"
      file="INSERT INTO notes (title, body) VALUES (?, ?)"
      description="Uses a POST server function with input validation. The data is bound with parameterized queries to prevent SQL injection."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body (optional)"
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save to D1'}
        </button>
      </form>
      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <CodeBlock
        code={`const createNote = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; body: string }) => {
    if (!data.title.trim()) throw new Error('Title is required')
    return data
  })
  .handler(async ({ data }) => {
    const db = getDB()
    const result = await db
      .prepare('INSERT INTO notes (title, body) VALUES (?, ?)')
      .bind(data.title, data.body)
      .run()
    return { id: result.meta.last_row_id }
  })`}
      />
    </DemoCard>
  )
}

function NotesListDemo({
  notes,
  onDeleted,
}: {
  notes: Note[]
  onDeleted: () => void
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: number) {
    setError(null)
    setDeletingId(id)
    try {
      await deleteNote({ data: { id } })
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DemoCard
      icon={<Database className="h-5 w-5" />}
      title="Notes from D1"
      file="SELECT * FROM notes ORDER BY id DESC"
      description="Loaded via the route loader on first render (SSR), refreshed client-side via router.invalidate(). Each row has a delete button that calls a POST server function."
    >
      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No notes yet. Create one above.
        </p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-medium text-sm">{note.title}</h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    #{note.id}
                  </span>
                </div>
                {note.body && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.body}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.created_at}
                </p>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                disabled={deletingId === note.id}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </DemoCard>
  )
}

function EnvHelperDemo() {
  return (
    <DemoCard
      icon={<Terminal className="h-5 w-5" />}
      title="Accessing D1 via getDB()"
      file="src/lib/env.ts"
      description="The env helper wraps the cloudflare:workers import and provides typed access to all bindings — D1, R2, KV, etc. Import getDB() in any server function."
    >
      <div className="space-y-3">
        <CodeBlock
          code={`// src/lib/env.ts
import { env } from 'cloudflare:workers'

export function getEnv(): Env {
  return env as Env
}

export function getDB(): D1Database {
  return getEnv().DB
}`}
        />
        <CodeBlock
          code={`// In any server function
import { getDB } from '~/lib/env'

const myServerFn = createServerFn().handler(async () => {
  const db = getDB()
  const { results } = await db
    .prepare('SELECT * FROM notes')
    .all()
  return results
})`}
        />
        <p className="text-xs text-muted-foreground">
          The <code className="rounded bg-muted px-1 py-0.5 font-mono">Env</code> type
          is auto-generated by{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler types</code> into{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">worker-configuration.d.ts</code>.
          Add bindings to wrangler.jsonc, run{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">wrangler types</code>,
          and the types update.
        </p>
      </div>
    </DemoCard>
  )
}

function PatternDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="Setup checklist"
      file="wrangler.jsonc + wrangler types"
      description="Steps to add D1 to a new project."
    >
      <div className="space-y-4 text-sm">
        <ol className="list-inside list-decimal space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">Create the database</strong>
            <CodeBlock code="wrangler d1 create my-db" />
          </li>
          <li>
            <strong className="text-foreground">
              Add the binding to wrangler.jsonc
            </strong>
            <CodeBlock
              code={`"d1_databases": [{
  "binding": "DB",
  "database_name": "my-db",
  "database_id": "..."
}]`}
            />
          </li>
          <li>
            <strong className="text-foreground">Regenerate types</strong>
            <CodeBlock code="wrangler types" />
          </li>
          <li>
            <strong className="text-foreground">
              Use getDB() in server functions
            </strong>
            <CodeBlock
              code={`const db = getDB()
await db.prepare('SELECT 1').run()`}
            />
          </li>
        </ol>

        <div className="rounded border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs text-primary">
            <strong>Migrations:</strong> For production apps, use{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              wrangler d1 migrations create
            </code>{' '}
            and{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              wrangler d1 migrations apply
            </code>{' '}
            instead of CREATE TABLE IF NOT EXISTS. The demo uses the simple
            approach for clarity.
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

import { useState, useRef, useCallback } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getBucket } from '~/lib/env'
import { pageHead } from '~/lib/site'
import { SiteNav } from '~/components/SiteNav'
import {
  HardDrive,
  Upload,
  Trash2,
  RefreshCw,
  FolderTree,
  Terminal,
  Download,
  FileIcon,
  Copy,
  Check,
  ImageIcon,
  Images,
  X,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type R2Object = {
  key: string
  size: number
  uploaded: string
  httpEtag: string
}

// ---------------------------------------------------------------------------
// Server functions — all R2 access happens here via getBucket()
// ---------------------------------------------------------------------------
const listObjects = createServerFn({ method: 'GET' }).handler(async () => {
  const bucket = getBucket()
  const listed = await bucket.list({ limit: 50 })
  return listed.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded.toISOString(),
    httpEtag: obj.httpEtag,
  }))
})

const uploadText = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string; content: string }) => {
    if (!data.key.trim()) throw new Error('Key is required')
    if (!data.content.trim()) throw new Error('Content is required')
    return data
  })
  .handler(async ({ data }) => {
    const bucket = getBucket()
    await bucket.put(data.key, data.content, {
      httpMetadata: { contentType: 'text/plain' },
    })
    return { key: data.key }
  })

const getObject = createServerFn({ method: 'GET' })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const bucket = getBucket()
    const obj = await bucket.get(data.key)
    if (!obj) throw new Error(`Object "${data.key}" not found`)
    const text = await obj.text()
    return {
      key: data.key,
      body: text,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      contentType: obj.httpMetadata?.contentType ?? 'unknown',
    }
  })

const deleteObject = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const bucket = getBucket()
    await bucket.delete(data.key)
    return { success: true }
  })

const headObject = createServerFn({ method: 'GET' })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const bucket = getBucket()
    const obj = await bucket.head(data.key)
    if (!obj) throw new Error(`Object "${data.key}" not found`)
    return {
      key: data.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      httpEtag: obj.httpEtag,
      contentType: obj.httpMetadata?.contentType ?? 'unknown',
    }
  })

const uploadImage = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { name: string; type: string; base64: string }) => {
      if (!data.name) throw new Error('File name is required')
      if (!data.type.startsWith('image/'))
        throw new Error('Only image files are allowed')
      return data
    },
  )
  .handler(async ({ data }) => {
    const bucket = getBucket()
    const binaryStr = atob(data.base64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const key = `images/${data.name}`
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: data.type },
    })
    return { key }
  })

const listImages = createServerFn({ method: 'GET' }).handler(async () => {
  const bucket = getBucket()
  const listed = await bucket.list({ prefix: 'images/', limit: 50 })
  return listed.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded.toISOString(),
    httpEtag: obj.httpEtag,
  }))
})

const deleteImage = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const bucket = getBucket()
    await bucket.delete(data.key)
    return { success: true }
  })

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export const Route = createFileRoute('/r2')({
  head: () =>
    pageHead({
      title: 'R2 Storage — claude-start-cf Template',
      description:
        'Cloudflare R2 object storage demo: drag & drop uploads, image gallery, object listing, and serving files from a Worker.',
      path: '/r2',
    }),
  loader: async () => {
    const [objects, images] = await Promise.all([listObjects(), listImages()])
    return { objects, images }
  },
  component: R2Page,
})

function R2Page() {
  const { objects, images } = Route.useLoaderData()
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
            <h1 className="text-3xl font-bold tracking-tight">R2 Storage</h1>
            <p className="mt-2 text-muted-foreground">
              Cloudflare R2 is S3-compatible object storage with zero egress
              fees. Accessed via{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                getBucket()
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
          <ImageUploadDemo onUploaded={handleRefresh} />
          <GalleryDemo images={images} onChanged={handleRefresh} />
          <UploadDemo onUploaded={handleRefresh} />
          <ObjectListDemo objects={objects} onChanged={handleRefresh} />
          <ReadObjectDemo />
          <EnvHelperDemo />
          <SetupDemo />
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Demos
// ---------------------------------------------------------------------------

function ImageUploadDemo({ onUploaded }: { onUploaded: () => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      )
      if (imageFiles.length === 0) {
        setError('No image files found. Only image files are accepted.')
        return
      }

      setError(null)
      setUploading(true)
      const keys: string[] = []

      for (const file of imageFiles) {
        try {
          const base64 = await fileToBase64(file)
          const result = await uploadImage({
            data: { name: file.name, type: file.type, base64 },
          })
          keys.push(result.key)
        } catch (err: any) {
          setError(err.message ?? `Failed to upload ${file.name}`)
          break
        }
      }

      setUploadedKeys((prev) => [...prev, ...keys])
      setUploading(false)
      if (keys.length > 0) onUploaded()
    },
    [onUploaded],
  )

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <DemoCard
      icon={<ImageIcon className="h-5 w-5" />}
      title="Drag & drop image upload"
      file="bucket.put(key, arrayBuffer, { httpMetadata })"
      description="Drop images onto the zone below or click to browse. Files are read as base64 on the client, decoded to bytes on the server, and stored in R2 under the images/ prefix."
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-muted/30'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        {uploading ? (
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          {uploading
            ? 'Uploading...'
            : dragging
              ? 'Drop images here'
              : 'Drag & drop images, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          PNG, JPG, GIF, WebP, SVG
        </p>
      </div>

      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {uploadedKeys.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Uploaded this session:
          </p>
          {uploadedKeys.map((key) => (
            <div
              key={key}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Check className="h-3 w-3 text-green-500" />
              <span className="font-mono">{key}</span>
            </div>
          ))}
        </div>
      )}

      <CodeBlock
        code={`// Client: read file as base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.split(',')[1]) // strip data:...;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Server: decode and upload to R2
const uploadImage = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    const bucket = getBucket()
    const bytes = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0))
    await bucket.put(\`images/\${data.name}\`, bytes, {
      httpMetadata: { contentType: data.type },
    })
  })`}
      />
    </DemoCard>
  )
}

function GalleryDemo({
  images,
  onChanged,
}: {
  images: R2Object[]
  onChanged: () => void
}) {
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  async function handleDelete(key: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingKey(key)
    await deleteImage({ data: { key } })
    if (lightbox === key) setLightbox(null)
    onChanged()
    setDeletingKey(null)
  }

  return (
    <DemoCard
      icon={<Images className="h-5 w-5" />}
      title="Image gallery"
      file="bucket.list({ prefix: 'images/' })"
      description="Images are served via an API route at /api/r2?key=... that streams the R2 object body with the correct Content-Type header. Click an image to view full size."
    >
      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No images yet. Upload some above.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.key}
              className="group relative cursor-pointer overflow-hidden rounded-lg border bg-muted/30"
              onClick={() => setLightbox(img.key)}
            >
              <div className="aspect-square">
                <img
                  src={`/api/r2?key=${encodeURIComponent(img.key)}`}
                  alt={img.key.replace('images/', '')}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white font-mono">
                  {img.key.replace('images/', '')}
                </p>
                <p className="text-xs text-white/60">{formatBytes(img.size)}</p>
              </div>
              <button
                onClick={(e) => handleDelete(img.key, e)}
                disabled={deletingKey === img.key}
                className="absolute right-1.5 top-1.5 rounded-md bg-black/50 p-1 text-white/70 opacity-0 transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-md bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={`/api/r2?key=${encodeURIComponent(lightbox)}`}
            alt={lightbox}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <CodeBlock
        code={`// API route: src/routes/api/r2.ts
// Serves R2 objects by key query parameter
export const Route = createFileRoute('/api/r2')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const key = url.searchParams.get('key')
        const bucket = getBucket()
        const obj = await bucket.get(key)
        if (!obj) return new Response('Not found', { status: 404 })

        return new Response(obj.body, {
          headers: {
            'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})

// Usage in JSX:
// <img src={\`/api/r2?key=\${encodeURIComponent(imageKey)}\`} />`}
      />
    </DemoCard>
  )
}

function UploadDemo({ onUploaded }: { onUploaded: () => void }) {
  const [key, setKey] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await uploadText({ data: { key, content } })
      setKey('')
      setContent('')
      onUploaded()
    } catch (err: any) {
      setError(err.message ?? 'Failed to upload')
    }
    setLoading(false)
  }

  return (
    <DemoCard
      icon={<Upload className="h-5 w-5" />}
      title="Upload an object"
      file="bucket.put(key, body, options)"
      description="Uses a POST server function. The key is the object path (supports slashes for folder-like structure). Content-type metadata is set via httpMetadata."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Key (e.g. notes/hello.txt)"
          required
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Text content"
          rows={3}
          required
          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !key.trim() || !content.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload to R2'}
        </button>
      </form>
      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <CodeBlock
        code={`const uploadText = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string; content: string }) => {
    if (!data.key.trim()) throw new Error('Key is required')
    return data
  })
  .handler(async ({ data }) => {
    const bucket = getBucket()
    await bucket.put(data.key, data.content, {
      httpMetadata: { contentType: 'text/plain' },
    })
    return { key: data.key }
  })`}
      />
    </DemoCard>
  )
}

function ObjectListDemo({
  objects,
  onChanged,
}: {
  objects: R2Object[]
  onChanged: () => void
}) {
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  async function handleDelete(key: string) {
    setDeletingKey(key)
    await deleteObject({ data: { key } })
    onChanged()
    setDeletingKey(null)
  }

  return (
    <DemoCard
      icon={<HardDrive className="h-5 w-5" />}
      title="Objects in bucket"
      file="bucket.list({ limit: 50 })"
      description="Loaded via the route loader on first render (SSR). Each object shows its key, size, and upload date. The delete button calls bucket.delete(key)."
    >
      {objects.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No objects yet. Upload one above.
        </p>
      ) : (
        <div className="space-y-2">
          {objects.map((obj) => (
            <div
              key={obj.key}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <h3 className="font-medium text-sm font-mono truncate">
                    {obj.key}
                  </h3>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatBytes(obj.size)}</span>
                  <span>{new Date(obj.uploaded).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(obj.key)}
                disabled={deletingKey === obj.key}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DemoCard>
  )
}

function ReadObjectDemo() {
  const [key, setKey] = useState('')
  const [result, setResult] = useState<{
    body: string
    size: number
    contentType: string
    uploaded: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleGet(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await getObject({ data: { key } })
      setResult(res)
    } catch (err: any) {
      setError(err.message ?? 'Failed to read object')
    }
    setLoading(false)
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <DemoCard
      icon={<Download className="h-5 w-5" />}
      title="Read an object"
      file="bucket.get(key) → obj.text()"
      description="Fetch an object by key via a GET server function. The R2Object body can be consumed as text, json, arrayBuffer, or a ReadableStream."
    >
      <form onSubmit={handleGet} className="flex gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Object key (e.g. notes/hello.txt)"
          required
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Reading...' : 'Get'}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{result.contentType}</span>
              <span>{formatBytes(result.size)}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="rounded border bg-muted/50 p-3">
            <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
              {result.body}
            </pre>
          </div>
        </div>
      )}

      <CodeBlock
        code={`const getObject = createServerFn({ method: 'GET' })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }) => {
    const bucket = getBucket()
    const obj = await bucket.get(data.key)
    if (!obj) throw new Error('Not found')

    const text = await obj.text()        // or .json(), .arrayBuffer()
    return {
      body: text,
      size: obj.size,
      contentType: obj.httpMetadata?.contentType,
    }
  })`}
      />
    </DemoCard>
  )
}

function EnvHelperDemo() {
  return (
    <DemoCard
      icon={<Terminal className="h-5 w-5" />}
      title="Accessing R2 via getBucket()"
      file="src/lib/env.ts"
      description="The env helper provides typed access to the R2 bucket binding. Import getBucket() in any server function."
    >
      <div className="space-y-3">
        <CodeBlock
          code={`// src/lib/env.ts
import { env } from 'cloudflare:workers'

export function getEnv(): Env {
  return env as Env
}

export function getBucket(): R2Bucket {
  return getEnv().BUCKET
}`}
        />
        <CodeBlock
          code={`// In any server function
import { getBucket } from '~/lib/env'

const myServerFn = createServerFn().handler(async () => {
  const bucket = getBucket()

  // Upload
  await bucket.put('key', 'value')

  // Read
  const obj = await bucket.get('key')
  const text = await obj?.text()

  // List
  const { objects } = await bucket.list({ prefix: 'notes/' })

  // Delete
  await bucket.delete('key')
})`}
        />
        <div className="overflow-x-auto rounded border text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Method
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Returns
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium">
                  Use Case
                </th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono text-xs">
              <tr>
                <td className="px-3 py-2">put(key, value)</td>
                <td className="px-3 py-2 text-muted-foreground">R2Object</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Upload / overwrite
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">get(key)</td>
                <td className="px-3 py-2 text-muted-foreground">
                  R2ObjectBody | null
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Read with body stream
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">head(key)</td>
                <td className="px-3 py-2 text-muted-foreground">
                  R2Object | null
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Metadata only, no body
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">list(options)</td>
                <td className="px-3 py-2 text-muted-foreground">
                  R2Objects
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Paginated listing with prefix filter
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">delete(key)</td>
                <td className="px-3 py-2 text-muted-foreground">void</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Remove object
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoCard>
  )
}

function SetupDemo() {
  return (
    <DemoCard
      icon={<FolderTree className="h-5 w-5" />}
      title="Setup checklist"
      file="wrangler.jsonc + wrangler types"
      description="Steps to add R2 to a new project."
    >
      <div className="space-y-4 text-sm">
        <ol className="list-inside list-decimal space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">Create the bucket</strong>
            <CodeBlock code="wrangler r2 bucket create my-bucket" />
          </li>
          <li>
            <strong className="text-foreground">
              Add the binding to wrangler.jsonc
            </strong>
            <CodeBlock
              code={`"r2_buckets": [{
  "binding": "BUCKET",
  "bucket_name": "my-bucket"
}]`}
            />
          </li>
          <li>
            <strong className="text-foreground">Regenerate types</strong>
            <CodeBlock code="wrangler types" />
          </li>
          <li>
            <strong className="text-foreground">
              Use getBucket() in server functions
            </strong>
            <CodeBlock
              code={`const bucket = getBucket()
await bucket.put('hello.txt', 'Hello, R2!')`}
            />
          </li>
        </ol>

        <div className="rounded border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs text-primary">
            <strong>Binary uploads:</strong> For file uploads from the browser,
            send the file as FormData to a POST server function. Use{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              request.formData()
            </code>{' '}
            to parse it, then pass the File/ArrayBuffer directly to{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              bucket.put()
            </code>
            . R2 accepts strings, ArrayBuffers, ReadableStreams, and Blobs.
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

// ---------------------------------------------------------------------------
// Shared UI
// ---------------------------------------------------------------------------

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

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

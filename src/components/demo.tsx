// Shared building blocks for the demo pages in src/routes/.

export function DemoCard({
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold">{title}</h2>
            <code className="block text-xs break-words text-muted-foreground">{file}</code>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="mt-2 rounded border bg-muted/50 p-3">
      <pre className="font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre overflow-x-auto">
        {code}
      </pre>
    </div>
  )
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

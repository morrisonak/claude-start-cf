// Guardrails for the public live demos. The D1/R2 pages are writable by
// anyone visiting the deployed site, so all demo access is scoped to
// dedicated prefixes and capped in size and count.

export const DEMO_PREFIXES = ['demo/', 'images/'] as const

/** Max image upload size (bytes, pre-base64). */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
/** Max length for the text-object upload demo. */
export const MAX_TEXT_LENGTH = 10_000
/** Max objects per demo prefix before uploads are rejected. */
export const MAX_DEMO_OBJECTS = 100
/** Max rows in the D1 notes demo table. */
export const MAX_NOTES = 100
export const MAX_NOTE_TITLE_LENGTH = 200
export const MAX_NOTE_BODY_LENGTH = 4000

export function isDemoKey(key: string): boolean {
  return DEMO_PREFIXES.some((p) => key.startsWith(p))
}

export function assertDemoKey(key: string): void {
  if (!isDemoKey(key)) {
    throw new Error(
      `Demo keys must start with ${DEMO_PREFIXES.map((p) => `"${p}"`).join(' or ')}`,
    )
  }
}

/** Strip any path components and unsafe characters from an uploaded filename. */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? ''
  return base.replace(/[^\w.-]+/g, '_').slice(0, 100) || 'file'
}

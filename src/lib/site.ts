export const SITE_URL = 'https://claude-start-cf.jmorrison.workers.dev'
export const SITE_NAME = 'claude-start-cf'
export const SITE_DESCRIPTION =
  'A base template for Claude-coded projects using TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.'

/**
 * Build the head() config for a page: title, description, canonical, and
 * Open Graph tags. Meta tags defined here override the defaults from
 * __root.tsx (TanStack Router dedupes by name/property, deepest route wins).
 */
export function pageHead({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  const url = `${SITE_URL}${path}`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

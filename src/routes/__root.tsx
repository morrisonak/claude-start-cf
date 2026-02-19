/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'

const SITE_URL = 'https://claude-start-cf.jmorrison.workers.dev'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'claude-start-cf — TanStack Start + Cloudflare Template' },
      {
        name: 'description',
        content:
          'A base template for Claude-coded projects using TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'claude-start-cf' },
      { property: 'og:title', content: 'claude-start-cf — TanStack Start + Cloudflare Template' },
      {
        property: 'og:description',
        content:
          'A base template for Claude-coded projects using TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.',
      },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: SITE_URL },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'claude-start-cf',
          url: SITE_URL,
          description:
            'A base template for Claude-coded projects using TanStack Start, Cloudflare Workers, D1, R2, and shadcn/ui.',
          publisher: {
            '@type': 'Organization',
            name: 'claude-start-cf',
            url: SITE_URL,
          },
        }),
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

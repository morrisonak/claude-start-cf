import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import contentCollections from '@content-collections/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    {
      // The Workers build resolves with the "browser" condition, which
      // gives html-react-parser the DOM-based parser and breaks SSR
      // (workerd has no document). Force the htmlparser2 server build.
      name: 'force-server-html-dom-parser',
      enforce: 'pre',
      applyToEnvironment: (environment) => environment.name === 'ssr',
      resolveId(source, importer, options) {
        if (source === 'html-dom-parser') {
          return this.resolve('html-dom-parser/lib/server/html-to-dom', importer, {
            ...options,
            skipSelf: true,
          })
        }
      },
    },
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    contentCollections(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
})

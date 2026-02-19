/// <reference types="vite/client" />

// ---------------------------------------------------------------------------
// Client-side environment variables (VITE_ prefix)
// Available via import.meta.env.VITE_*
// These are statically replaced at build time and included in the JS bundle.
// ---------------------------------------------------------------------------
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_PUBLIC_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// ---------------------------------------------------------------------------
// Server-side environment variables (no prefix)
// Available via process.env.* inside server functions only.
// On Cloudflare Workers these come from wrangler.jsonc [vars] or the dashboard.
// ---------------------------------------------------------------------------
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly SECRET_API_KEY: string
      readonly DATABASE_URL: string
      readonly NODE_ENV: 'development' | 'production' | 'test'
      // Cloudflare wrangler.jsonc [vars]
      readonly APP_ENVIRONMENT: string
      readonly DEMO_WRANGLER_VAR: string
    }
  }
}

export {}

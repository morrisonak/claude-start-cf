import { env } from 'cloudflare:workers'

/**
 * Get the Cloudflare environment bindings.
 * Use this in server functions to access D1, R2, KV, etc.
 */
export function getEnv(): Env {
  return env as Env
}

/**
 * Get the D1 database instance.
 */
export function getDB(): D1Database {
  return getEnv().DB
}

/**
 * Get the R2 bucket instance.
 */
export function getBucket(): R2Bucket {
  return getEnv().BUCKET
}

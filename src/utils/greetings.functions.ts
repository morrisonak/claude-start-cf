// ---------------------------------------------------------------------------
// Server function wrappers — safe to import from anywhere (client or server).
// The build process replaces the handler with an RPC stub on the client.
// ---------------------------------------------------------------------------

import { createServerFn } from '@tanstack/react-start'
import { buildGreeting } from './greetings.server'

export const getGreeting = createServerFn({ method: 'GET' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return { message: buildGreeting(data.name) }
  })

// ---------------------------------------------------------------------------
// Server-only helpers — only import these inside server function handlers.
// This file should never be imported from client code directly.
// ---------------------------------------------------------------------------

const greetings = [
  'Hello',
  'Howdy',
  'Greetings',
  'Salutations',
  'Hey there',
  'Good day',
]

export function buildGreeting(name: string): string {
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]
  return `${greeting}, ${name}! (generated server-side at ${new Date().toLocaleTimeString()})`
}

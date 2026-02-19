// ---------------------------------------------------------------------------
// Dynamic param server route — GET /api/users/:userId
// Demonstrates accessing $params from the URL.
// ---------------------------------------------------------------------------
import { createFileRoute } from '@tanstack/react-router'

const mockUsers: Record<string, { id: string; name: string; role: string }> = {
  '1': { id: '1', name: 'Alice', role: 'admin' },
  '2': { id: '2', name: 'Bob', role: 'editor' },
  '3': { id: '3', name: 'Charlie', role: 'viewer' },
}

export const Route = createFileRoute('/api/users/$userId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const user = mockUsers[params.userId]

        if (!user) {
          return Response.json(
            { error: 'User not found', userId: params.userId },
            { status: 404 },
          )
        }

        return Response.json(user)
      },
    },
  },
})

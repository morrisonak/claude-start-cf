import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SiteNav } from '~/components/SiteNav'

export const Route = createFileRoute('/posts')({
  component: PostsLayout,
})

function PostsLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 sm:py-16">
        <Outlet />
      </main>
    </div>
  )
}

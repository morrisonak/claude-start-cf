import { useState, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '~/lib/utils'
import { categories } from '~/lib/nav'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu'

const allLinks = [
  { to: '/', title: 'Home' },
  ...categories.flatMap((c) => c.items),
]

export function SiteNav() {
  const { location } = useRouterState()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Zap className="h-4 w-4 text-primary" />
          <span>claude-start-cf</span>
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {categories.map((cat) => (
              <NavigationMenuItem key={cat.label}>
                <NavigationMenuTrigger>{cat.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1 p-2">
                    {cat.items.map((item) => (
                      <li key={item.to}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.to}
                            className={cn(
                              'flex flex-col gap-0.5 rounded-sm p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                              location.pathname === item.to ||
                                location.pathname.startsWith(item.to + '/')
                                ? 'bg-accent/50 font-medium'
                                : '',
                            )}
                          >
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="border-t px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {allLinks.map(({ to, title }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'transition-colors hover:text-foreground',
                  location.pathname === to ||
                    (to !== '/' && location.pathname.startsWith(to))
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {title}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

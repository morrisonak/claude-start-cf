import {
  Zap,
  Variable,
  Server,
  Route as RouteIcon,
  Database,
  HardDrive,
  Rocket,
  FileText,
  Search,
  Bot,
  Info,
  Newspaper,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  to: string
  title: string
  description: string
  icon: LucideIcon
}

export type NavCategory = {
  /** Short label used in the nav bar */
  label: string
  /** Longer heading used on the homepage */
  title: string
  items: NavItem[]
}

// Single source of truth for the demo pages, used by both the homepage
// grid (src/routes/index.tsx) and the nav bar (src/components/SiteNav.tsx).
export const categories: NavCategory[] = [
  {
    label: 'Framework',
    title: 'Framework Patterns',
    items: [
      { to: '/execution', icon: Zap, title: 'Execution', description: 'Client vs server rendering' },
      { to: '/env', icon: Variable, title: 'Env Vars', description: 'Environment variable access' },
      { to: '/server-fns', icon: Server, title: 'Server Fns', description: 'Server function RPCs' },
      { to: '/server-routes', icon: RouteIcon, title: 'API Routes', description: 'HTTP API endpoints' },
    ],
  },
  {
    label: 'Cloudflare',
    title: 'Cloudflare Services',
    items: [
      { to: '/d1', icon: Database, title: 'D1', description: 'SQLite database at the edge' },
      { to: '/r2', icon: HardDrive, title: 'R2', description: 'Object storage uploads' },
      { to: '/deploy', icon: Rocket, title: 'Deploy', description: 'Setup, config & deployment' },
    ],
  },
  {
    label: 'Content',
    title: 'Content & SEO',
    items: [
      { to: '/markdown', icon: FileText, title: 'Markdown', description: 'MDX content rendering' },
      { to: '/seo', icon: Search, title: 'SEO', description: 'Meta tags & structured data' },
      { to: '/llmo', icon: Bot, title: 'LLMO', description: 'LLM-optimized content' },
    ],
  },
  {
    label: 'Pages',
    title: 'Routing & Pages',
    items: [
      { to: '/about', icon: Info, title: 'About', description: 'Static page example' },
      { to: '/posts', icon: Newspaper, title: 'Posts', description: 'Data fetching patterns' },
      { to: '/blog', icon: BookOpen, title: 'Blog', description: 'File-based blog with MDX' },
    ],
  },
]

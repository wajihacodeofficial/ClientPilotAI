import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function PublicNavbar() {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ClientPilot AI Logo" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              ClientPilot<span className="text-teal-600"> AI</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link>
            <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

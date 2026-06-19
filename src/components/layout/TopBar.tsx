import { Moon, Sun, Bell, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, Button } from '@/components/ui'

export function TopBar() {
  const darkMode = useAppStore((s) => s.darkMode)
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode)

  return (
    <header className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-5 z-10">
      {/* Left: workspace name */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Acme Software Agency
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </div>

      {/* Right: live indicator + actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live</span>
        </div>

        {/* Notifications (decorative) */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Toggle dark mode">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar fallback="WZ" size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-none">Wajiha</p>
            <p className="text-xs text-zinc-400 leading-none mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}

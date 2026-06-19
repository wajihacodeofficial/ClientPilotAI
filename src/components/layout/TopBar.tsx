import { Moon, Sun, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, Button } from '@/components/ui'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const darkMode = useAppStore((s) => s.darkMode)
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode)
  const userRole = useAppStore((s) => s.userRole)
  const userEmail = useAppStore((s) => s.userEmail)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const setUserEmail = useAppStore((s) => s.setUserEmail)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserRole(null)
    setUserEmail(null)
    navigate('/')
  }

  return (
    <header className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-5 z-10">
      {/* Left: workspace name */}
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="" className="h-5 w-5 rounded object-cover opacity-70" />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Acme Software Agency
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </div>

      {/* Right: live indicator + actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="text-xs font-medium text-teal-700 dark:text-teal-400">Live</span>
        </div>

        {/* Notifications */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-teal-500" />
        </button>

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Toggle dark mode">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar fallback={userRole === 'admin' ? 'AD' : 'US'} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-none">
              {userRole === 'admin' ? 'Admin User' : 'Normal User'}
            </p>
            <p className="text-[10px] text-zinc-400 leading-none mt-0.5 tracking-wide">
              {userEmail || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="text-zinc-500 hover:text-red-500">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

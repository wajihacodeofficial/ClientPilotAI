import { Moon, Sun, Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const { theme, setTheme } = useTheme()
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
    <header 
      className="h-[80px] shrink-0 flex items-center justify-between px-6 z-10 clay-floating rounded-none border-b border-white/5"
    >
      {/* Left: workspace name */}
      <div className="flex items-center gap-3 px-4 py-2 clay-inset cursor-pointer hover:bg-(--surface-raised) transition-colors">
        <img src="/logo.png" alt="" className="h-6 w-6 rounded-lg object-cover drop-shadow-md" />
        <span className="text-[15px] font-bold text-(--text-primary) tracking-wide">
          Acme Software Agency
        </span>
        <ChevronDown className="h-4 w-4 text-(--text-secondary)" />
      </div>

      {/* Right: live indicator + actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full clay-inset">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--primary) opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-(--primary)" />
          </span>
          <span className="text-[11px] font-extrabold text-(--primary) tracking-widest uppercase">Live</span>
        </div>

        {/* Notifications */}
        <button className="relative h-10 w-10 flex items-center justify-center clay-raised text-(--text-secondary) hover:text-(--text-primary)">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-(--accent)" />
        </button>

        {/* Dark mode toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="relative h-10 w-16 flex items-center clay-inset p-1"
          title="Toggle dark mode"
        >
          <div className={`h-8 w-8 rounded-full clay-raised flex items-center justify-center transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
            {theme === 'dark' ? <Moon className="h-4 w-4 text-(--primary)" /> : <Sun className="h-4 w-4 text-(--primary)" />}
          </div>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity ml-2">
          <div className="h-11 w-11 rounded-full clay-raised flex items-center justify-center text-(--primary) font-bold text-sm shrink-0">
            {userRole === 'admin' ? 'AD' : 'US'}
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-(--text-primary) leading-none">
              {userRole === 'admin' ? 'Admin User' : 'Normal User'}
            </p>
            <p className="text-[11px] text-(--text-secondary) leading-none mt-1.5 font-semibold">
              {userEmail || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          title="Log out" 
          className="relative h-10 w-10 flex items-center justify-center clay-raised hover:text-(--danger) text-(--text-secondary) ml-2"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

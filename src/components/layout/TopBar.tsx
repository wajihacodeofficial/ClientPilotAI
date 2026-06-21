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
    <header 
      className="h-[80px] shrink-0 flex items-center justify-between px-6 z-10"
      style={{
        background: 'rgba(18,38,28,.55)',
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255,255,255,.05)'
      }}
    >
      {/* Left: workspace name */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)] cursor-pointer hover:bg-white/10 transition-colors">
        <img src="/logo.png" alt="" className="h-6 w-6 rounded-lg object-cover drop-shadow-md" />
        <span className="text-[15px] font-bold text-white tracking-wide">
          Acme Software Agency
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--mint)] drop-shadow-[0_0_2px_rgba(99,217,160,0.5)]" />
      </div>

      {/* Right: live indicator + actions */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--forest-900)] border border-[var(--mint)] shadow-[0_0_15px_rgba(99,217,160,0.2)] animate-pulse-glow">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--mint)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--mint)] shadow-[0_0_8px_var(--mint)]" />
          </span>
          <span className="text-[11px] font-extrabold text-[var(--mint)] tracking-widest uppercase">Live</span>
        </div>

        {/* Notifications */}
        <button className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)]" />
        </button>

        {/* Dark mode toggle */}
        <button 
          onClick={toggleDarkMode} 
          className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white transition-all"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity ml-2">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[var(--emerald)] to-[var(--forest-600)] shadow-[0_8px_16px_rgba(80,227,164,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-[var(--mint)] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {userRole === 'admin' ? 'AD' : 'US'}
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-white leading-none">
              {userRole === 'admin' ? 'Admin User' : 'Normal User'}
            </p>
            <p className="text-[11px] text-[var(--mint)] leading-none mt-1.5 font-semibold">
              {userEmail || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          title="Log out" 
          className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-[var(--text-secondary)] transition-all ml-2"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

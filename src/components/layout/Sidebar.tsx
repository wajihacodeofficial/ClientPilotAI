import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Radar, Kanban, Users, Settings, ChevronLeft, ChevronRight, FileText,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, role: 'user' },
  { to: '/app/discover', label: 'Lead Discovery', icon: Radar, end: false, role: 'user' },
  { to: '/app/pipeline', label: 'Pipeline', icon: Kanban, end: false, role: 'user' },
  { to: '/app/leads', label: 'Leads', icon: Users, end: false, role: 'user' },
  { to: '/app/admin', label: 'Admin Panel', icon: LayoutDashboard, end: false, role: 'admin' },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false, role: 'admin' },
]

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggle = useAppStore((s) => s.toggleSidebar)
  const userRole = useAppStore((s) => s.userRole)
  const location = useLocation()

  const filteredNavItems = navItems.filter(item => {
    if (item.role === 'admin' && userRole !== 'admin') return false;
    if (item.role === 'user' && userRole !== 'user') return false;
    return true;
  });

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 270 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(30px)',
        border: '1px solid var(--surface-glass-border)',
        borderRadius: '0 32px 32px 0',
        boxShadow: 'var(--sidebar-shadow)'
      }}
      className="relative shrink-0 h-screen flex flex-col overflow-hidden z-20"
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo image */}
          <img
            src="/logo.png"
            alt="ClientPilot AI"
            className="h-8 w-8 rounded-md shrink-0 object-cover"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="text-[14px] font-extrabold text-white leading-none whitespace-nowrap">
                  ClientPilot<span className="text-[var(--mint)] drop-shadow-[0_0_8px_rgba(99,217,160,0.5)]"> AI</span>
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-none mt-1 whitespace-nowrap font-mono tracking-widest uppercase">
                  Lead Acquisition
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {filteredNavItems.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={cn('nav-item', isActive && 'active')}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* Agency badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] backdrop-blur-md"
          >
            <p className="text-[10px] font-bold text-[var(--mint)] uppercase tracking-widest drop-shadow-[0_0_4px_rgba(99,217,160,0.3)]">Workspace</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">Acme Software Agency</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center h-10 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  )
}

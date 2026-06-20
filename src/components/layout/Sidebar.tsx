import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Radar, Kanban, Users, Settings, ChevronLeft, ChevronRight,
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
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative shrink-0 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden z-20"
    >
      {/* Logo / Brand */}
      <div className="h-14 flex items-center px-3.5 shrink-0 border-b border-zinc-100 dark:border-zinc-800">
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
                <p className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-none whitespace-nowrap">
                  ClientPilot<span className="text-teal-600"> AI</span>
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5 whitespace-nowrap font-mono">
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
            className="mx-2 mb-3 px-3 py-2.5 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-100 dark:border-teal-900"
          >
            <p className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Workspace</p>
            <p className="text-xs font-medium text-teal-900 dark:text-teal-200 mt-0.5 truncate">Acme Software Agency</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center h-8 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  )
}

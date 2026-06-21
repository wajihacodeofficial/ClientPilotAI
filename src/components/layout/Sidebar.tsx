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
    <motion.div className="py-4 pl-4 h-screen"
      animate={{ width: collapsed ? 80 + 16 : 280 + 16 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.aside
        className="clay-floating h-full flex flex-col overflow-hidden relative z-20"
      >
      {/* Logo / Brand */}
      <div className="h-20 flex items-center px-5 shrink-0">
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
                <p className="text-[15px] font-bold text-(--text-primary) leading-none whitespace-nowrap">
                  ClientPilot<span className="text-(--primary) ml-1 font-black">AI</span>
                </p>
                <p className="text-[10px] text-(--text-secondary) leading-none mt-1 whitespace-nowrap font-mono tracking-widest uppercase">
                  Lead Acquisition
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {filteredNavItems.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-[14px] transition-all relative overflow-hidden',
                isActive 
                  ? 'clay-inset bg-(--primary-soft) text-(--primary)' 
                  : 'text-(--text-secondary) hover:bg-(--surface-raised) hover:text-(--text-primary)'
              )}
              title={collapsed ? label : undefined}
            >
              {isActive && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-(--primary)" />
              )}
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "ml-1")} />
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
            className="mx-4 mb-4 px-4 py-3 clay-inset"
          >
            <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-widest">Workspace</p>
            <p className="text-[13px] font-bold text-(--text-primary) mt-1 truncate">Acme Software Agency</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div className="p-4 pt-0">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center h-10 clay-raised text-(--text-secondary) hover:text-(--primary)"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      </motion.aside>
    </motion.div>
  )
}

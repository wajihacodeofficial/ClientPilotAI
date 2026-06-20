import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { LeadDetailPanel } from '../leads/LeadDetailPanel'
import { useAppStore } from '@/store/useAppStore'

export function AppShell() {
  const initRealtime = useAppStore(s => s.initRealtime)

  useEffect(() => {
    const cleanup = initRealtime()
    return () => cleanup()
  }, [initRealtime])

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <LeadDetailPanel />
    </div>
  )
}

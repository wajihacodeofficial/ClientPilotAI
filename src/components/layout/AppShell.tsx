import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { LeadDetailPanel } from '../leads/LeadDetailPanel'
import { useAppStore } from '@/store/useAppStore'
import { getProposals, getAllLeads } from '@/lib/mockApi'

export function AppShell() {
  const initRealtime = useAppStore(s => s.initRealtime)
  const setProposals = useAppStore(s => s.setProposals)
  const setLeads = useAppStore(s => s.setLeads)

  useEffect(() => {
    const cleanup = initRealtime()

    // Pre-fetch workspace leads and proposals
    getProposals().then(setProposals).catch(console.error)
    getAllLeads().then(setLeads).catch(console.error)

    return () => cleanup()
  }, [initRealtime, setProposals, setLeads])

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
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

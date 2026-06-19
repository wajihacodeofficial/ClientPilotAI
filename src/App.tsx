import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadDiscoveryPage } from '@/pages/LeadDiscoveryPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { LeadsPage } from '@/pages/LeadsPage'
import { LoginPage } from '@/pages/LoginPage'

// A simple settings stub
function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
      <p className="text-sm text-zinc-500 mt-2">Manage your workspace preferences here.</p>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/discover" element={<LeadDiscoveryPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadDiscoveryPage } from '@/pages/LeadDiscoveryPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { LeadsPage } from '@/pages/LeadsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAppStore } from '@/store/useAppStore'
import { Navigate } from 'react-router-dom'

// Role Guard for Admin Panel
function AdminGuard({ children }: { children: React.ReactNode }) {
  const userRole = useAppStore((s) => s.userRole)
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
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
            <Route path="/settings" element={<AdminGuard><SettingsPage /></AdminGuard>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App

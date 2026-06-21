import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadDiscoveryPage } from '@/pages/LeadDiscoveryPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { LeadsPage } from '@/pages/LeadsPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { ProposalsPage } from '@/pages/ProposalsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { LandingPage } from '@/pages/LandingPage'
import { AboutPage } from '@/pages/AboutPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { useAppStore } from '@/store/useAppStore'

// Role Guard for Admin Panel
function AdminGuard({ children }: { children: React.ReactNode }) {
  const userRole = useAppStore((s) => s.userRole)
  if (userRole !== 'admin') {
    return <Navigate to="/app" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public marketing pages ─────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* ── Auth pages ─────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />

        {/* ── Protected app routes ───────────────────────────── */}
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/discover" element={<LeadDiscoveryPage />} />
            <Route path="/app/pipeline" element={<PipelinePage />} />
            <Route path="/app/leads" element={<LeadsPage />} />
            <Route path="/app/messages" element={<MessagesPage />} />
            <Route path="/app/proposals" element={<ProposalsPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route
              path="/app/admin"
              element={
                <AdminGuard>
                  <AdminDashboardPage />
                </AdminGuard>
              }
            />
            <Route
              path="/app/settings"
              element={
                <AdminGuard>
                  <SettingsPage />
                </AdminGuard>
              }
            />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

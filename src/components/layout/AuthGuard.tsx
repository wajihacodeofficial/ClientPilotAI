import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import { useAppStore } from '@/store/useAppStore'
import { Loader2 } from 'lucide-react'

export function AuthGuard() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Demo mode: if a role is set via the demo login buttons, bypass real auth
  const userRole = useAppStore((s) => s.userRole)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const setUserEmail = useAppStore((s) => s.setUserEmail)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUserEmail(session.user.email ?? null)
        setUserRole(session.user.email?.includes('admin') ? 'admin' : 'user')
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setUserEmail(session.user.email ?? null)
        setUserRole(session.user.email?.includes('admin') ? 'admin' : 'user')
      } else {
        // Only clear if we are not in demo bypass mode
        const currentRole = useAppStore.getState().userRole
        if (currentRole !== 'admin' && currentRole !== 'user') {
          setUserEmail(null)
          setUserRole(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [setUserRole, setUserEmail])

  // If a demo role is set, grant access immediately without waiting
  if (userRole !== null) {
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

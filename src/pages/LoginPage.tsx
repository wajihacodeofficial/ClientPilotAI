import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAppStore } from '@/store/useAppStore'
import { Button, Input, Label, Card, Separator } from '@/components/ui'
import { Zap, Loader2 } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setUserRole = useAppStore(s => s.setUserRole)
  const setUserEmail = useAppStore(s => s.setUserEmail)
  
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      if (authData.user) {
        setUserEmail(authData.user.email ?? null)
        
        // Fetch role from profile table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()
          
        const role = (!profileError && profile) ? (profile.role as 'admin' | 'user') : 'user'
        setUserRole(role)
        
        if (role === 'admin') {
          navigate('/app/admin')
        } else {
          navigate('/app')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setLoading(true)
    setError(null)
    const demoEmail = role === 'admin' ? 'admin@clientpilotai.com' : 'user@clientpilotai.com'
    const demoPassword = role === 'admin' ? 'Client@123' : 'User@123'
    
    setEmail(demoEmail)
    setPassword(demoPassword)
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      if (error) throw error
      
      if (authData.user) {
        setUserEmail(authData.user.email ?? null)
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()
          
        const userRole = (!profileError && profile) ? (profile.role as 'admin' | 'user') : 'user'
        setUserRole(userRole)
        
        if (userRole === 'admin') {
          navigate('/app/admin')
        } else {
          navigate('/app')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2">
        <img src="/logo.png" alt="" className="h-6 w-6 rounded" />
        <span className="font-bold text-zinc-900 dark:text-zinc-100">ClientPilot AI</span>
      </Link>

      <Card className="w-full max-w-sm p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access your account.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2.5 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            Don't have an account?
          </span>{' '}
          <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
            Sign up
          </Link>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <p className="text-xs text-center text-zinc-500 font-medium uppercase tracking-wider">Demo Login (Bypass Auth)</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => handleDemoLogin('admin')}>
              Login as Admin
            </Button>
            <Button variant="outline" className="flex-1 text-xs" onClick={() => handleDemoLogin('user')}>
              Login as User
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

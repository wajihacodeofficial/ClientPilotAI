import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button, Input, Label, Card } from '@/components/ui'
import { Zap, Loader2 } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError('Check your email for the confirmation link.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        navigate('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-sm p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isSignUp ? 'Enter your details to sign up.' : 'Enter your credentials to access your account.'}
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
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </Card>
    </div>
  )
}

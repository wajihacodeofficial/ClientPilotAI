import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAppStore } from '@/store/useAppStore'
import { Loader2 } from 'lucide-react'

interface LoginPageProps {
  initialMode?: 'login' | 'signup'
}

export function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Validation shake states
  const [shakeEmail, setShakeEmail] = useState(false)
  const [shakePassword, setShakePassword] = useState(false)
  const [shakeName, setShakeName] = useState(false)

  const setUserRole = useAppStore((s) => s.setUserRole)
  const setUserEmail = useAppStore((s) => s.setUserEmail)
  const navigate = useNavigate()
  const location = useLocation()

  // Keep state in sync with URL/route if it changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup')
    } else {
      setMode('login')
    }
    setError(null)
  }, [location.pathname])

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let hasValidationError = false;

    if (mode === 'signup' && !fullName.trim()) {
      setShakeName(true)
      setTimeout(() => setShakeName(false), 400)
      hasValidationError = true;
    }
    if (!email.trim() || !validateEmail(email)) {
      setShakeEmail(true)
      setTimeout(() => setShakeEmail(false), 400)
      hasValidationError = true;
    }
    if (password.length < 6) {
      setShakePassword(true)
      setTimeout(() => setShakePassword(false), 400)
      hasValidationError = true;
      setError('Password must be at least 6 characters.')
    }

    if (hasValidationError) {
      setLoading(false)
      return;
    }

    try {
      if (mode === 'login') {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        if (authData.user) {
          setUserEmail(authData.user.email ?? null)
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
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })
        if (signUpError) throw signUpError
        setError('Check your email for the confirmation link.')
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
      const { data: authData, error: demoError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      if (demoError) throw demoError

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

  const handleStateToggle = (targetMode: 'login' | 'signup') => {
    setError(null)
    setMode(targetMode)
    navigate(targetMode === 'login' ? '/login' : '/signup')
  }

  return (
    <div className="viewport-container" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#1A4A32' }}>
      
      {/* INJECT STYLES DIRECTLY */}
      <style>{`
        .viewport-container {
          --forest-dark:    #0D2B1F;
          --forest-mid:     #1A4A32;
          --forest-med:     #2D6A4F;
          --forest-accent:  #40916C;
          --forest-bright:  #52B788;
          --forest-light:   #74C69D;
          --forest-pale:    #B7E4C7;
          --mint-glow:      #D8F3DC;
          --off-white:      #F0FFF4;
          --gold-accent:    #FFB347;
          --cream:          #FFF8F0;
          
          --clay-bg-light: inset 3px 3px 6px rgba(255, 255, 255, 0.9), 
                           inset -3px -3px 6px rgba(45, 106, 79, 0.15), 
                           0 8px 16px rgba(45, 106, 79, 0.1);
          --clay-btn: inset 3px 3px 6px rgba(255, 255, 255, 0.4), 
                      inset -3px -4px 6px rgba(0, 0, 0, 0.3), 
                      0 6px 12px rgba(13, 43, 31, 0.25);
          --clay-input: inset 2px 2px 4px rgba(0, 0, 0, 0.05),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.8);
        }

        .dots-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#2D6A4F 1.5px, transparent 1.5px);
          background-size: 24px 24px;
          opacity: 0.25;
          pointer-events: none;
        }

        .hero-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -2px;
          text-transform: uppercase;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
        }

        .svg-float-torus {
          animation: floatSlow 3s ease-in-out infinite;
          transform-origin: center;
        }

        .svg-float-cyan {
          animation: floatMedium 3.5s ease-in-out infinite;
          animation-delay: 1s;
          transform-origin: center;
        }

        .svg-float-pink {
          animation: floatFast 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
          transform-origin: center;
        }

        .svg-character {
          animation: floatFast 4s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .svg-hand {
          animation: handNudge 3s ease-in-out infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }

        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-4deg); }
        }

        @keyframes floatFast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes handNudge {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-15px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }

        .shake-animation {
          animation: shake 0.4s ease-in-out;
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important;
        }

        @media (max-width: 768px) {
          .left-panel-responsive {
            width: 100% !important;
            height: 200px !important;
            padding: 24px !important;
            flex-direction: row !important;
            align-items: center !important;
          }
          .illustration-stage {
            display: none !important;
          }
          .right-panel-responsive {
            width: 100% !important;
            padding: 24px !important;
            background-color: #0D2B1F !important;
          }
          .pointer-hand-responsive {
            display: none !important;
          }
        }
      `}</style>

      {/* LEFT PANEL */}
      <div className="left-panel-responsive" style={{ width: '55%', height: '100%', background: 'linear-gradient(135deg, #0D2B1F 0%, #1A4A32 100%)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', overflow: 'hidden', zIndex: 10 }}>
        <div className="dots-overlay"></div>
        
        {/* Top Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 20 }}>
          <img src="/logo.png" alt="ClientPilot AI Logo" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', boxShadow: '0 6px 12px rgba(0,0,0,0.2)' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFF8F0', letterSpacing: '-0.5px' }}>ClientPilot AI</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#74C69D', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Acquire High-Value Clients on Autopilot.</div>
          </div>
        </div>

        {/* Hero Text */}
        <div style={{ marginTop: '40px', position: 'relative', zIndex: 20 }}>
          <h1 className="hero-title" style={{ color: '#ffffff' }}>
            <span>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</span>
            <span style={{ display: 'block', color: '#74C69D' }}>Now!</span>
          </h1>
        </div>

        {/* 3D Graphic Scene */}
        <div className="illustration-stage" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', position: 'relative', zIndex: 15 }}>
          <svg style={{ width: '90%', maxWidth: '420px', height: 'auto', filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.35))' }} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="clayShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#05140e" flood-opacity="0.5" />
              </filter>
              <linearGradient id="portalGrad" x1="100" y1="80" x2="100" y2="380" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#40916C" />
                <stop offset="100%" stop-color="#2D6A4F" />
              </linearGradient>
              <linearGradient id="torusGrad" x1="60" y1="80" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FFD166" />
                <stop offset="50%" stop-color="#FFB347" />
                <stop offset="100%" stop-color="#D48A1D" />
              </linearGradient>
              <linearGradient id="pinkGrad" x1="320" y1="310" x2="380" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FF85A2" />
                <stop offset="100%" stop-color="#FF6B9D" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="300" y1="200" x2="420" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#4EECD6" />
                <stop offset="100%" stop-color="#2EC4B6" />
              </linearGradient>
            </defs>

            <ellipse cx="250" cy="420" rx="180" ry="24" fill="#05140E" opacity="0.6" filter="blur(8px)" />

            <path d="M 120 425 Q 160 395 210 425 Z" fill="#1A4A32" filter="url(#clayShadow)" />
            <path d="M 280 430 Q 320 400 370 428 Z" fill="#2D6A4F" filter="url(#clayShadow)" />
            <path d="M 210 435 Q 240 415 270 435 Z" fill="#B7E4C7" filter="url(#clayShadow)" />

            <g filter="url(#clayShadow)">
              <path d="M 330 260 Q 360 210 390 220" stroke="#1A4A32" stroke-width="6" stroke-linecap="round" fill="none" />
              <path d="M 360 220 Q 390 190 380 170 Q 350 190 360 220 Z" fill="#52B788" />
              <path d="M 345 235 Q 380 215 385 195 Q 355 210 345 235 Z" fill="#40916C" />
              <path d="M 370 215 Q 410 210 405 190 Q 380 195 370 215 Z" fill="#52B788" />
              <path d="M 385 220 Q 420 230 425 215 Q 395 215 385 220 Z" fill="#2D6A4F" />
            </g>

            <rect x="150" y="100" width="180" height="300" rx="90" fill="url(#portalGrad)" filter="url(#clayShadow)" />
            <rect x="170" y="120" width="140" height="270" rx="70" fill="#0D2B1F" opacity="0.85" />

            <g className="svg-float-torus" filter="url(#clayShadow)">
              <path d="M 120 100 C 86.86 100 60 126.86 60 160 C 60 193.14 86.86 220 120 220 C 153.14 220 180 193.14 180 160 C 180 126.86 153.14 100 120 100 Z M 120 135 C 133.81 135 145 146.19 145 160 C 145 173.81 133.81 185 120 185 C 106.19 185 95 173.81 95 160 C 95 146.19 106.19 135 120 135 Z" 
                    fill="url(#torusGrad)" transform="rotate(20 120 160)" />
            </g>

            <g className="svg-float-cyan" filter="url(#clayShadow)">
              <ellipse cx="370" cy="180" rx="25" ry="12" fill="#4EECD6" />
              <path d="M 345 180 L 345 220 A 25 12 0 0 0 395 220 L 395 180 Z" fill="url(#cyanGrad)" />
            </g>

            <g filter="url(#clayShadow)">
              <rect x="180" y="320" width="30" height="70" rx="15" fill="#0F6E56" />
              <rect x="225" y="250" width="30" height="140" rx="15" fill="#52B788" />
              <rect x="270" y="290" width="30" height="100" rx="15" fill="#74C69D" />
            </g>

            <g className="svg-character" filter="url(#clayShadow)">
              <rect x="220" y="365" width="44" height="45" rx="20" fill="#9B8EC4" />
              <circle cx="242" cy="345" r="22" fill="#9B8EC4" />
              <circle cx="236" cy="345" r="2.5" fill="#0D2B1F" />
              <circle cx="248" cy="345" r="2.5" fill="#0D2B1F" />
              <path d="M 239 350 Q 242 353 245 350" stroke="#0D2B1F" stroke-width="2" stroke-linecap="round" fill="none" />
            </g>

            <g className="svg-float-pink" filter="url(#clayShadow)">
              <rect x="100" y="280" width="22" height="48" rx="11" fill="url(#pinkGrad)" transform="rotate(-40 100 280)" />
            </g>
          </svg>
        </div>

        <div style={{ fontSize: '13px', color: '#B7E4C7', zIndex: 20, fontWeight: 600 }}>
          © 2026 ClientPilot AI. Secure & private.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel-responsive" style={{ width: '45%', height: '100%', backgroundColor: '#1A4A32', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}>
        
        {/* Pointer Hand (ELEMENT 8) */}
        <div className="pointer-hand-responsive svg-hand" style={{ position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)', width: '120px', height: '120px', zIndex: 100, pointerEvents: 'none' }}>
          <svg width="120" height="120" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="drop-shadow(-5px 10px 10px rgba(0,0,0,0.3))">
              <rect x="40" y="55" width="110" height="36" rx="18" fill="#C8956C" />
              <rect x="40" y="55" width="110" height="12" rx="6" fill="#DDB088" opacity="0.4" />
              <rect x="110" y="47" width="40" height="52" rx="10" fill="#40916C" />
              <rect x="5" y="45" width="45" height="15" rx="7.5" fill="#C8956C" />
              <rect x="25" y="58" width="30" height="13" rx="6.5" fill="#B48259" />
              <rect x="28" y="69" width="28" height="13" rx="6.5" fill="#B48259" />
            </g>
          </svg>
        </div>

        {/* Card Panel */}
        <div style={{
          backgroundColor: '#F0FFF4',
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          borderRadius: '28px',
          boxShadow: 'inset 4px 4px 0px rgba(255, 255, 255, 0.9), 0 20px 45px rgba(13, 43, 31, 0.45)',
          border: '3.5px solid #2D6A4F',
          zIndex: 30
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0D2B1F', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '14px', color: '#40916C', fontWeight: 700 }}>
              {mode === 'signup' ? 'Unlock your predictive client acquisition portal' : 'Enter credentials to pilot your acquisition'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <button type="button" className="btn-social" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px', backgroundColor: '#ffffff', border: '2px solid #B7E4C7', borderRadius: '14px', color: '#0D2B1F', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--clay-bg-light)' }}>
              Google
            </button>
            <button type="button" className="btn-social" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px', backgroundColor: '#ffffff', border: '2px solid #B7E4C7', borderRadius: '14px', color: '#0D2B1F', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--clay-bg-light)' }}>
              Facebook
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#40916C', fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '20px' }}>
            <div style={{ flex: 1, borderBottom: '2px solid #B7E4C7', marginRight: '12px' }}></div>
            OR
            <div style={{ flex: 1, borderBottom: '2px solid #B7E4C7', marginLeft: '12px' }}></div>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
            {mode === 'signup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B1F', paddingLeft: '4px' }}>Full Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className={`form-input ${shakeName ? 'shake-animation' : ''}`}
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', height: '52px', backgroundColor: '#ffffff', border: '2px solid #B7E4C7', borderRadius: '14px', padding: '0 16px 0 16px', fontSize: '14px', fontWeight: 700, color: '#0D2B1F', outline: 'none', boxShadow: 'var(--clay-input)' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B1F', paddingLeft: '4px' }}>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className={`form-input ${shakeEmail ? 'shake-animation' : ''}`}
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', height: '52px', backgroundColor: '#ffffff', border: '2px solid #B7E4C7', borderRadius: '14px', padding: '0 16px 0 16px', fontSize: '14px', fontWeight: 700, color: '#0D2B1F', outline: 'none', boxShadow: 'var(--clay-input)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0D2B1F', paddingLeft: '4px' }}>Password</label>
                {mode === 'login' && (
                  <a href="#" style={{ fontSize: '12px', fontWeight: 700, color: '#40916C', textDecoration: 'none' }}>Forgot password?</a>
                )}
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className={`form-input ${shakePassword ? 'shake-animation' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', height: '52px', backgroundColor: '#ffffff', border: '2px solid #B7E4C7', borderRadius: '14px', padding: '0 40px 0 16px', fontSize: '14px', fontWeight: 700, color: '#0D2B1F', outline: 'none', boxShadow: 'var(--clay-input)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#74C69D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '54px',
                border: 'none',
                borderRadius: '14px',
                background: 'linear-gradient(180deg, #40916C 0%, #2D6A4F 100%)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: 'var(--clay-btn)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                mode === 'signup' ? 'Create Account →' : 'Sign In →'
              )}
            </button>
          </form>

          {/* DEMO BYPASS BUTTONS */}
          {mode === 'login' && (
            <div style={{ marginTop: '20px', borderTop: '2px solid #B7E4C7', paddingTop: '16px' }}>
              <p style={{ fontSize: '11px', textAlign: 'center', color: '#2D6A4F', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Demo Sign In
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  style={{ flex: 1, height: '36px', backgroundColor: '#ffffff', border: '1.5px solid #2D6A4F', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#2D6A4F', cursor: 'pointer' }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('user')}
                  style={{ flex: 1, height: '36px', backgroundColor: '#ffffff', border: '1.5px solid #2D6A4F', borderRadius: '10px', fontSize: '12px', fontWeight: 800, color: '#2D6A4F', cursor: 'pointer' }}
                >
                  User
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', fontWeight: 700, color: '#2D6A4F' }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button className="btn-toggle-state" onClick={() => handleStateToggle('login')} style={{ background: 'none', border: 'none', color: '#40916C', fontWeight: 800, cursor: 'pointer' }}>
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button className="btn-toggle-state" onClick={() => handleStateToggle('signup')} style={{ background: 'none', border: 'none', color: '#40916C', fontWeight: 800, cursor: 'pointer' }}>
                  Sign Up
                </button>
              </>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}

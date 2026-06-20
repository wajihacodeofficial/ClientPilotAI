import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 20, textDecoration: 'none' }}>
          <img src="/logo.png" alt="ClientPilot AI Logo" style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', boxShadow: '0 6px 12px rgba(0,0,0,0.2)' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFF8F0', letterSpacing: '-0.5px' }}>ClientPilot AI</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#74C69D', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Acquire High-Value Clients on Autopilot.</div>
          </div>
        </Link>

        {/* Hero Text */}
        <div style={{ marginTop: '40px', position: 'relative', zIndex: 20, height: '140px' }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, rotateX: -90, y: -20 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: 90, y: 20 }}
              transition={{ duration: 0.4 }}
              className="hero-title"
              style={{ color: '#ffffff', position: 'absolute', top: 0, left: 0 }}
            >
              <span>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</span>
              <span style={{ display: 'block', color: '#74C69D' }}>Now!</span>
            </motion.h1>
          </AnimatePresence>
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
              <linearGradient id="mintBodyGradient" x1="90" y1="80" x2="230" y2="250" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d1fae5" />
                <stop offset="0.5" stopColor="#a7f3d0" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="rocketBody" x1="225" y1="240" x2="275" y2="360" gradientUnits="userSpaceOnUse">
                <stop stopColor="#74C69D" />
                <stop offset="0.5" stopColor="#40916C" />
                <stop offset="1" stopColor="#1A4A32" />
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

            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.g
                  key="scout"
                  initial={{ opacity: 0, scale: 0.7, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: -30 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="svg-character"
                  filter="url(#clayShadow)"
                >
                  <ellipse cx="250" cy="405" rx="45" ry="12" fill="#000" fillOpacity="0.15" />
                  <rect x="210" y="270" width="80" height="120" rx="40" fill="url(#mintBodyGradient)" />
                  <rect x="220" y="285" width="60" height="40" rx="16" fill="#0f172a" />
                  <circle cx="238" cy="305" r="10" fill="#ffffff" />
                  <circle cx="239" cy="305" r="5" fill="#059669" />
                  <circle cx="262" cy="305" r="10" fill="#ffffff" />
                  <circle cx="261" cy="305" r="5" fill="#059669" />
                  <path d="M 244 338 Q 250 344 256 338" stroke="#047857" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  <rect x="195" y="310" width="18" height="36" rx="9" fill="#059669" transform="rotate(-15 195 310)" />
                  <rect x="287" y="310" width="18" height="36" rx="9" fill="#059669" transform="rotate(15 287 310)" />
                  <path d="M 250 270 L 250 245" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="250" cy="240" r="5" fill="#FFB347" />
                </motion.g>
              ) : (
                <motion.g
                  key="bolt"
                  initial={{ opacity: 0, scale: 0.7, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: -30 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="svg-character"
                  filter="url(#clayShadow)"
                >
                  <ellipse cx="250" cy="405" rx="40" ry="10" fill="#000" fillOpacity="0.15" />
                  {/* Flames */}
                  <path d="M 240 360 Q 250 405 260 360 Q 250 385 240 360 Z" fill="#ff9f1c" />
                  <path d="M 243 360 Q 250 395 257 360 Q 250 380 243 360 Z" fill="#ff5a5f" />
                  {/* Rocket Body */}
                  <rect x="225" y="240" width="50" height="120" rx="25" fill="url(#rocketBody)" />
                  {/* Window / Screen */}
                  <rect x="233" y="265" width="34" height="34" rx="12" fill="#0f172a" />
                  {/* Eyes / Face in window */}
                  <circle cx="243" cy="278" r="4" fill="#ffffff" />
                  <circle cx="243" cy="278" r="2" fill="#059669" />
                  <circle cx="257" cy="278" r="4" fill="#ffffff" />
                  <circle cx="257" cy="278" r="2" fill="#059669" />
                  <path d="M 246 288 Q 250 292 254 288" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  {/* Fins */}
                  <path d="M 225 320 L 205 350 L 225 350 Z" fill="#047857" />
                  <path d="M 275 320 L 295 350 L 275 350 Z" fill="#047857" />
                  {/* Antenna/tip */}
                  <path d="M 250 240 L 250 220" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="250" cy="216" r="4" fill="#FFB347" />
                </motion.g>
              )}
            </AnimatePresence>

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
        <motion.div
          key={`card-${mode}`}
          initial={{ scale: 0.95, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            backgroundColor: '#F0FFF4',
            width: '100%',
            maxWidth: '440px',
            padding: '40px 36px',
            borderRadius: '28px',
            boxShadow: 'inset 4px 4px 0px rgba(255, 255, 255, 0.9), 0 20px 45px rgba(13, 43, 31, 0.45)',
            border: '3.5px solid #2D6A4F',
            zIndex: 30
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0D2B1F', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{ fontSize: '14px', color: '#40916C', fontWeight: 700 }}>
                  {mode === 'signup' ? 'Unlock your predictive client acquisition portal' : 'Enter credentials to pilot your acquisition'}
                </p>
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

              {/* Social Login Buttons at Bottom */}
              <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#40916C', fontSize: '11px', fontWeight: 900, letterSpacing: '1.5px', margin: '20px 0 10px 0' }}>
                <div style={{ flex: 1, borderBottom: '2px solid #B7E4C7', marginRight: '12px' }}></div>
                OR
                <div style={{ flex: 1, borderBottom: '2px solid #B7E4C7', marginLeft: '12px' }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '48px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #B7E4C7',
                    borderRadius: '14px',
                    color: '#0D2B1F',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: 'var(--clay-input)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '48px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #B7E4C7',
                    borderRadius: '14px',
                    color: '#0D2B1F',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: 'var(--clay-input)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="#1877F2" style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  )
}

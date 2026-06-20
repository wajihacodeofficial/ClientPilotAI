import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  Plus,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  Target,
  Send,
  Check
} from 'lucide-react'

// Mock testimonials
const TESTIMONIALS = [
  {
    text: "ClientPilot AI booked us 4 discovery calls in the first week. The outreach reads like we wrote it ourselves.",
    author: "Marcus T., CEO of DevForge Agency",
    tone: "mint"
  },
  {
    text: "We replaced our entire SDR process. Saves us $8k/month.",
    author: "Priya S., Founder at LaunchStack",
    tone: "lavender"
  },
  {
    text: "The AI qualification is scary good. It knows which leads are ready to buy before we even reach out.",
    author: "Jordan K., Partner at NorthCode",
    tone: "peach"
  }
]

// FAQ Items
const FAQ_ITEMS = [
  {
    q: "How does the lead discovery work?",
    a: "We query real-time directories, mapping locations and search footprints using high-accuracy web scrapers. This pulls up active local business info and aggregates social and digital footprint data."
  },
  {
    q: "Is the outreach actually personalized?",
    a: "Yes, our system doesn't rely on simple mail merge templates. GPT-4 reads through the lead's digital presence gaps and details specific strategies to fix them, writing a unique email for every single business."
  },
  {
    q: "Can I use my own email domain?",
    a: "Absolutely. You can connect your GSuite, Office 365, or SMTP domains in a couple of clicks to ensure emails go directly from your address."
  },
  {
    q: "What makes this different from Apollo or Hunter?",
    a: "Unlike static database brokers, ClientPilot AI performs real-time scans on live local data. This prevents outreach to outdated business pages and automatically scores them for digital readiness before you send anything."
  },
  {
    q: "Is there a free trial?",
    a: "Yes, we offer a 14-day free trial on all plans. You can cancel at any time directly from your dashboard settings."
  }
]

// Count-up helper component
function StatCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && active) {
        let current = 0
        const duration = 1500
        const stepTime = Math.max(Math.floor(duration / target), 15)
        const timer = setInterval(() => {
          if (target <= 10) {
            current += 0.1
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Number(current.toFixed(1)))
            }
          } else {
            current += Math.ceil(target / 40)
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(current)
            }
          }
        }, stepTime)
        observer.disconnect()
      }
    }, { threshold: 0.1 })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      active = false
      observer.disconnect()
    }
  }, [target])

  return (
    <div ref={ref} className="font-mono">
      {target >= 1000 ? count.toLocaleString() : count}
      {suffix}
    </div>
  )
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] relative overflow-hidden font-sans selection:bg-[#10b981] selection:text-white pb-0">
      
      {/* CSS Styles injection for exact Claymorphism shadows */}
      <style>{`
        .clay-shadow-teal {
          box-shadow: 
            0 1px 0 1px rgba(255,255,255,0.6) inset,
            0 -4px 0 0 rgba(0,0,0,0.15) inset,
            0 8px 24px rgba(16,185,129,0.25),
            0 2px 4px rgba(0,0,0,0.1);
        }
        .clay-shadow-white {
          box-shadow:
            0 1px 0 1px rgba(255,255,255,0.9) inset,
            0 -4px 0 0 rgba(15,23,42,0.06) inset,
            0 8px 20px rgba(15,23,42,0.05),
            0 2px 4px rgba(15,23,42,0.03);
        }
        .clay-shadow-mint {
          box-shadow:
            0 1.5px 0 1px rgba(255,255,255,0.7) inset,
            0 -5px 0 0 rgba(5,150,105,0.18) inset,
            0 8px 20px rgba(5,150,105,0.1),
            0 2px 4px rgba(0,0,0,0.04);
        }
        .clay-shadow-lavender {
          box-shadow:
            0 1.5px 0 1px rgba(255,255,255,0.7) inset,
            0 -5px 0 0 rgba(109,40,217,0.15) inset,
            0 8px 20px rgba(109,40,217,0.1),
            0 2px 4px rgba(0,0,0,0.04);
        }
        .clay-shadow-peach {
          box-shadow:
            0 1.5px 0 1px rgba(255,255,255,0.7) inset,
            0 -5px 0 0 rgba(220,38,38,0.1) inset,
            0 8px 20px rgba(220,38,38,0.06) ,
            0 2px 4px rgba(0,0,0,0.03);
        }
        .shimmer-badge::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 3s infinite ease-in-out;
        }
        @keyframes shimmer {
          0% { left: -150%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 flex items-center ${scrolled ? 'bg-[#f8fafc]/70 backdrop-blur-md shadow-md h-[70px]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-[#0f172a] no-underline">
            <img
              src="/logo.png"
              alt="ClientPilot AI Logo"
              className="w-10 h-10 rounded-xl object-cover clay-shadow-mint"
            />
            <span>ClientPilot<span className="text-[#10b981]">AI</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-semibold hover:bg-[#d1fae5] hover:text-[#059669] px-4 py-2 rounded-full transition-all duration-200">Home</a>
            <a href="#features" className="text-sm font-semibold hover:bg-[#d1fae5] hover:text-[#059669] px-4 py-2 rounded-full transition-all duration-200">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold hover:bg-[#d1fae5] hover:text-[#059669] px-4 py-2 rounded-full transition-all duration-200">How It Works</a>
            <a href="#pricing" className="text-sm font-semibold hover:bg-[#d1fae5] hover:text-[#059669] px-4 py-2 rounded-full transition-all duration-200">Pricing</a>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm font-semibold text-[#1e293b] hover:opacity-85 transition-opacity">Sign In</Link>
            <Link to="/signup" className="px-5 py-2.5 rounded-full text-white font-bold text-sm bg-linear-to-br from-[#10b981] to-[#059669] clay-shadow-teal hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-44 pb-28 bg-[radial-gradient(circle_at_top_left,rgba(224,242,254,0.65),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(209,250,229,0.65),transparent_45%)]" id="home">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 flex flex-col items-start">
            <div className="shimmer-badge relative overflow-hidden inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-linear-to-br from-[#d1fae5] to-[#a7f3d0] clay-shadow-mint text-[#059669] text-xs font-bold mb-6">
              Now with GPT-5.5 powered lead scoring            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-[#0f172a] leading-tight">
              Acquire High-Value<br />Clients on <span className="bg-linear-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent">Autopilot.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#1e293b] mb-10 max-w-[580px] leading-relaxed">
              The ultimate client acquisition engine for modern software agencies. We scan local markets, analyze digital presence, and generate hyper-personalized outreach in seconds.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link to="/signup" className="px-8 py-4 rounded-full text-white font-bold text-base bg-linear-to-br from-[#10b981] to-[#059669] clay-shadow-teal hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
                Start Discovering Free →
              </Link>
              <a href="#how-it-works" className="px-8 py-4 rounded-full font-bold text-base border-3 border-[#a7f3d0] text-[#059669] clay-shadow-white hover:scale-[1.03] active:scale-[0.97] hover:bg-white/40 transition-all duration-200">
                How it works
              </a>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            {/* Scout character */}
            <motion.div
              animate={{ translateY: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-full max-w-[340px]"
            >
              <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="160" cy="290" rx="75" ry="14" fill="#000" fill-opacity="0.08" />
                <path d="M160 80L160 50" stroke="#059669" stroke-width="8" stroke-linecap="round" />
                <circle cx="160" cy="40" r="12" fill="url(#antennaGlow)" />
                <circle cx="160" cy="40" r="8" fill="#10b981" />
                <rect x="75" y="150" width="30" height="60" rx="15" fill="#059669" transform="rotate(-15 75 150)" />
                <rect x="52" y="125" width="8" height="40" rx="4" fill="#64748b" transform="rotate(35 52 125)" />
                <circle cx="40" cy="115" r="22" stroke="#475569" stroke-width="6" fill="#e0f2fe" fill-opacity="0.8" />
                <circle cx="34" cy="109" r="6" fill="#ffffff" fill-opacity="0.6" />
                <rect x="215" y="150" width="30" height="60" rx="15" fill="#059669" transform="rotate(15 215 150)" />
                <rect x="90" y="80" width="140" height="170" rx="70" fill="url(#mintBodyGradient)" />
                <rect x="110" y="105" width="100" height="65" rx="28" fill="#0f172a" />
                <circle cx="140" cy="138" r="16" fill="#ffffff" />
                <circle cx="142" cy="138" r="8" fill="#059669" />
                <circle cx="138" cy="134" r="3" fill="#ffffff" />
                <circle cx="180" cy="138" r="16" fill="#ffffff" />
                <circle cx="178" cy="138" r="8" fill="#059669" />
                <circle cx="174" cy="134" r="3" fill="#ffffff" />
                <path d="M150 190 Q160 198 170 190" stroke="#047857" stroke-width="6" stroke-linecap="round" fill="none" />
                <defs>
                  <linearGradient id="mintBodyGradient" x1="90" y1="80" x2="230" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#d1fae5" />
                    <stop offset="0.5" stop-color="#a7f3d0" />
                    <stop offset="1" stop-color="#059669" />
                  </linearGradient>
                  <radialGradient id="antennaGlow" cx="0.5" cy="0.5" r="0.5">
                    <stop stop-color="#a7f3d0" />
                    <stop offset="1" stop-color="#10b981" stop-opacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-28" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-[650px] mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Everything you need to close more deals</h2>
            <p className="text-[#1e293b] text-base">Stop scraping Google Maps manually. ClientPilot AI automates the entire pipeline from discovery to first contact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CARD 1 */}
            <div className="bg-white border-2 border-white rounded-[32px] p-10 clay-shadow-white hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-[#d1fae5] to-[#a7f3d0] clay-shadow-mint mb-6 text-[#059669]">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">Smart Discovery</h3>
              <p className="text-sm text-[#1e293b] leading-relaxed">Scan Google Maps, Yelp, and local directories. Find businesses in any niche, any city, in seconds.</p>
            </div>

            {/* CARD 2 */}
            <div className="bg-white border-2 border-white rounded-[32px] p-10 clay-shadow-white hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-[#ede9fe] to-[#ddd6fe] clay-shadow-lavender mb-6 text-[#8b5cf6]">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Qualification</h3>
              <p className="text-sm text-[#1e293b] leading-relaxed">GPT-4 scores every lead on website quality, social presence, and growth signals automatically.</p>
            </div>

            {/* CARD 3 */}
            <div className="bg-white border-2 border-white rounded-[32px] p-10 clay-shadow-white hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-linear-to-br from-[#ffedd5] to-[#fed7aa] clay-shadow-peach mb-6 text-[#ea580c]">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">Automated Outreach</h3>
              <p className="text-sm text-[#1e293b] leading-relaxed">Hyper-personalized cold emails written and sent automatically. Sound human, scale infinitely.</p>
            </div>
          </div>

          {/* Spark Character */}
          <div className="flex justify-center mt-12">
            <motion.div
              whileInView={{ scale: [1, 1.15, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-[160px]"
            >
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="180" rx="45" ry="8" fill="#000" fill-opacity="0.06" />
                <path d="M50 130 C30 130 20 110 30 90 C20 70 40 50 60 60 C70 40 100 40 110 55 C130 40 155 55 150 80 C165 90 165 110 150 125 C155 145 130 155 115 145 C100 160 70 155 50 130 Z" fill="url(#lavenderBody)" />
                <path d="M150 45 L155 35 L165 30 L155 25 L150 15 L145 25 L135 30 L145 35 Z" fill="#e9c46a" />
                <path d="M45 40 L48 33 L55 30 L48 27 L45 20 L42 27 L35 30 L42 33 Z" fill="#e9c46a" />
                <path d="M95 70 L75 110 L95 110 L85 140 L120 95 L98 95 Z" fill="#ffb703" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round" />
                <defs>
                  <linearGradient id="lavenderBody" x1="30" y1="50" x2="160" y2="150">
                    <stop stop-color="#ede9fe" />
                    <stop offset="0.6" stop-color="#ddd6fe" />
                    <stop offset="1" stop-color="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28 bg-[#f1f5f9] relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-[650px] mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">3 Steps to Your Next Client</h2>
            <p className="text-[#1e293b] text-base">Get set up in less than 5 minutes and let our AI agents begin sourcing opportunities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[4px] border-t-4 border-dashed border-[#059669] opacity-35 z-0"></div>
            
            <div className="flex flex-col items-center text-center z-10">
              <div className="w-[52px] h-[52px] rounded-full bg-linear-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-xl flex items-center justify-center clay-shadow-teal mb-6">1</div>
              <div className="bg-white border-2 border-white rounded-[28px] p-8 clay-shadow-white w-full">
                <h3 className="text-lg font-bold mb-2">🔍 Define Your Market</h3>
                <p className="text-sm text-[#1e293b]">Tell us your niche and city. We handle the rest.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center z-10">
              <div className="w-[52px] h-[52px] rounded-full bg-linear-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-xl flex items-center justify-center clay-shadow-teal mb-6">2</div>
              <div className="bg-white border-2 border-white rounded-[28px] p-8 clay-shadow-white w-full">
                <h3 className="text-lg font-bold mb-2">🤖 AI Does the Work</h3>
                <p className="text-sm text-[#1e293b]">We find, score, and write outreach for every lead.</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center z-10">
              <div className="w-[52px] h-[52px] rounded-full bg-linear-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-xl flex items-center justify-center clay-shadow-teal mb-6">3</div>
              <div className="bg-white border-2 border-white rounded-[28px] p-8 clay-shadow-white w-full">
                <h3 className="text-lg font-bold mb-2">📬 Watch Replies Roll In</h3>
                <p className="text-sm text-[#1e293b]">Sit back while qualified prospects land in your inbox.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="max-w-7xl mx-auto px-6 mt-[-40px] relative z-20">
        <div className="bg-linear-to-br from-[#0f172a] to-[#1e293b] py-14 px-6 rounded-[40px] border-3 border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-5xl font-extrabold text-[#10b981] mb-2">
                <StatCounter target={50000} suffix="+" />
              </div>
              <div className="text-[#f1f5f9] text-base font-semibold">Leads Generated</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-extrabold text-[#10b981] mb-2">
                <StatCounter target={98} suffix="%" />
              </div>
              <div className="text-[#f1f5f9] text-base font-semibold">Deliverability Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-extrabold text-[#10b981] mb-2">
                <StatCounter target={3} suffix="x" />
              </div>
              <div className="text-[#f1f5f9] text-base font-semibold">Average Reply Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CLAYMEN SQUAD SECTION */}
      <section className="py-20 bg-linear-to-br from-[#d1fae5] to-[#f0fdf4]" id="squad">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-[700px] mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Meet Your AI Growth Squad</h2>
            <p className="text-[#1e293b] text-base">
              Your autonomous agents work 24/7 to source leads, qualify metrics, and draft bespoke outreach for your agency.
            </p>
          </div>
          <div className="relative inline-block max-w-4xl mx-auto rounded-[36px] overflow-hidden border-4 border-white clay-shadow-teal bg-white/60 p-4">
            <img 
              src="/claymen.png" 
              alt="ClientPilot AI Claymen Squad" 
              className="w-full h-auto rounded-[28px] object-cover" 
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-[650px] mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Endorsed by Fast-Growing Agencies</h2>
            <p className="text-[#1e293b] text-base">Client acquisition doesn't have to be a manual grind. Here's what founders say.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx}
                className={`p-10 rounded-[32px] border-2 border-white flex flex-col justify-between ${
                  t.tone === 'mint' ? 'bg-linear-to-br from-[#d1fae5] to-[#f0fdf4] clay-shadow-mint' :
                  t.tone === 'lavender' ? 'bg-linear-to-br from-[#ede9fe] to-[#faf5ff] clay-shadow-lavender' :
                  'bg-linear-to-br from-[#ffedd5] to-[#fffbef] clay-shadow-peach'
                }`}
              >
                <p className="text-base font-medium italic mb-6 text-[#1e293b]">"{t.text}"</p>
                <span className="text-sm font-bold text-[#0f172a]">{t.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-28 bg-[#f1f5f9]" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-[650px] mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#1e293b] text-base">Choose a plan that fits your agency's scale. All plans include 14-day free trials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Plan 1 */}
            <div className="bg-white rounded-[36px] p-12 border-2 border-white clay-shadow-white flex flex-col h-full">
              <span className="text-sm uppercase tracking-wider text-[#1e293b] font-bold mb-2">Starter</span>
              <div className="text-4xl font-extrabold text-[#0f172a] mb-6">$49<span className="text-sm font-medium text-[#1e293b]">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> 500 leads/month
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> AI qualification
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> Email templates
                </li>
              </ul>
              <Link to="/signup" className="mt-auto px-6 py-3.5 rounded-full text-center font-bold bg-[#f8fafc] text-[#0f172a] border-2 border-[#f1f5f9] clay-shadow-white hover:scale-[1.03] active:scale-[0.97] transition-all">
                Get Started
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="bg-white rounded-[36px] p-12 border-3 border-[#10b981] clay-shadow-teal flex flex-col relative h-[105%] popular-glow">
              <div className="absolute top-[-18px] right-[28px] bg-linear-to-br from-[#10b981] to-[#059669] text-white px-4 py-2 rounded-full text-xs font-extrabold clay-shadow-teal">Most Popular</div>
              <span className="text-sm uppercase tracking-wider text-[#1e293b] font-bold mb-2">Growth</span>
              <div className="text-4xl font-extrabold text-[#0f172a] mb-6">$149<span className="text-sm font-medium text-[#1e293b]">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> 2,500 leads/month
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> Automated outreach
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> GPT-4 personalization
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> Priority support
                </li>
              </ul>
              <Link to="/signup" className="mt-auto px-6 py-3.5 rounded-full text-center font-bold text-white bg-linear-to-br from-[#10b981] to-[#059669] clay-shadow-teal hover:scale-[1.03] active:scale-[0.97] transition-all">
                Get Started
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="bg-white rounded-[36px] p-12 border-2 border-white clay-shadow-white flex flex-col h-full">
              <span className="text-sm uppercase tracking-wider text-[#1e293b] font-bold mb-2">Agency</span>
              <div className="text-4xl font-extrabold text-[#0f172a] mb-6">$399<span className="text-sm font-medium text-[#1e293b]">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> Unlimited leads
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> White-label reports
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> API access
                </li>
                <li className="flex items-center gap-3 text-sm text-[#1e293b]">
                  <Check className="w-5 h-5 text-[#10b981]" /> Dedicated manager
                </li>
              </ul>
              <Link to="/signup" className="mt-auto px-6 py-3.5 rounded-full text-center font-bold bg-[#f8fafc] text-[#0f172a] border-2 border-[#f1f5f9] clay-shadow-white hover:scale-[1.03] active:scale-[0.97] transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Frequently Asked Questions</h2>
            <p className="text-[#1e293b] text-base">Got questions about how our Claymorphism engine sources prospects? Here are answers.</p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-white rounded-[24px] clay-shadow-white overflow-hidden">
                <div 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="p-6 flex justify-between items-center cursor-pointer select-none"
                >
                  <span className="font-bold text-sm md:text-base text-[#0f172a]">{item.q}</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                    activeFaq === idx ? 'bg-red-100 text-red-600 rotate-45' : 'bg-[#d1fae5] text-[#059669]'
                  }`}>+</span>
                </div>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-[#1e293b] leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-linear-to-br from-[#10b981] to-[#059669] rounded-[48px] p-16 text-center border-3 border-white/15 clay-shadow-teal relative overflow-hidden">
            
            {/* Spark character left */}
            <div className="hidden lg:block absolute left-[6%] bottom-[15%] w-32 pointer-events-none">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="180" rx="45" ry="8" fill="#000" fill-opacity="0.15" />
                <path d="M50 130 C30 130 20 110 30 90 C20 70 40 50 60 60 C70 40 100 40 110 55 C130 40 155 55 150 80 C165 90 165 110 150 125 C155 145 130 155 115 145 C100 160 70 155 50 130 Z" fill="url(#lavenderBodyCTA)" />
                <path d="M95 70 L75 110 L95 110 L85 140 L120 95 L98 95 Z" fill="#ffb703" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round" />
                <defs>
                  <linearGradient id="lavenderBodyCTA" x1="30" y1="50" x2="160" y2="150">
                    <stop stop-color="#ede9fe" />
                    <stop offset="0.6" stop-color="#ddd6fe" />
                    <stop offset="1" stop-color="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Bolt rocket right */}
            <div className="hidden lg:block absolute right-[6%] top-[15%] w-32 pointer-events-none transform rotate-20">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="180" rx="35" ry="7" fill="#000" fill-opacity="0.15" />
                <path d="M85 140 Q100 180 115 140 Q100 160 85 140 Z" fill="#ff9f1c" />
                <path d="M90 140 Q100 170 110 140 Q100 155 90 140 Z" fill="#ff5a5f" />
                <rect x="75" y="30" width="50" height="110" rx="25" fill="url(#rocketBody)" />
                <circle cx="100" cy="70" r="14" fill="#0f172a" />
                <circle cx="100" cy="70" r="10" fill="#e2e8f0" />
                <path d="M75 120 L55 140 L75 140 Z" fill="#047857" />
                <path d="M125 120 L145 140 L125 140 Z" fill="#047857" />
                <defs>
                  <linearGradient id="rocketBody" x1="75" y1="30" x2="125" y2="140">
                    <stop stop-color="#10b981" />
                    <stop offset="0.6" stop-color="#059669" />
                    <stop offset="1" stop-color="#047857" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 max-w-[650px] mx-auto text-white">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to Fill Your Pipeline?</h2>
              <p className="text-white/90 text-base md:text-lg mb-10">Join 2,000+ agencies acquiring clients on autopilot.</p>
              <Link to="/signup" className="inline-block px-10 py-4 rounded-full text-base font-bold bg-white text-[#0f172a] clay-shadow-white hover:scale-[1.03] active:scale-[0.97] transition-all">
                Start Discovering Free →
              </Link>
              <p className="text-xs text-white/70 mt-4">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f8fafc] py-20 border-t-3 border-[#a7f3d0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
            
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-[#0f172a] no-underline">
                <img
                  src="/logo.png"
                  alt="ClientPilot AI Logo"
                  className="w-10 h-10 rounded-xl object-cover clay-shadow-mint"
                />
                <span>ClientPilot<span className="text-[#10b981]">AI</span></span>
              </Link>
              <p className="text-[#1e293b] text-sm max-w-[320px]">
                Acquire high-value clients on autopilot. Personalized lead qualification and outreach designed for software agencies.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm uppercase tracking-wider font-extrabold">Product</h4>
              <ul className="space-y-2 text-sm text-[#1e293b]">
                <li><a href="#home" className="hover:text-[#10b981] transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-[#10b981] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#10b981] transition-colors">How it works</a></li>
                <li><a href="#pricing" className="hover:text-[#10b981] transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm uppercase tracking-wider font-extrabold">Company</h4>
              <ul className="space-y-2 text-sm text-[#1e293b]">
                <li><Link to="/about" className="hover:text-[#10b981] transition-colors">About</Link></li>
                <li><a href="#blog" className="hover:text-[#10b981] transition-colors">Blog</a></li>
                <li><a href="#careers" className="hover:text-[#10b981] transition-colors">Careers</a></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm uppercase tracking-wider font-extrabold">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-11 h-11 rounded-full bg-white clay-shadow-white border-1.5 border-white flex items-center justify-center text-[#1e293b] hover:scale-[1.08] hover:bg-[#d1fae5] hover:text-[#059669] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white clay-shadow-white border-1.5 border-white flex items-center justify-center text-[#1e293b] hover:scale-[1.08] hover:bg-[#d1fae5] hover:text-[#059669] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white clay-shadow-white border-1.5 border-white flex items-center justify-center text-[#1e293b] hover:scale-[1.08] hover:bg-[#d1fae5] hover:text-[#059669] transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
                </a>
              </div>
            </div>

          </div>
          <div className="border-t border-[#f1f5f9] pt-8 text-center text-xs text-[#1e293b]">
            <p>© 2025 ClientPilot AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

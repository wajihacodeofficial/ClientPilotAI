import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Users,
  Star,
  Send,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  MessageSquare,
  Volume2,
  ChevronRight,
  Menu,
  X,
  Play,
  CheckSquare,
  Square,
  Briefcase,
  AlertCircle
} from 'lucide-react'

// Define the steps for loading
const LOADING_STEPS = [
  'Initializing client-pilot clay container...',
  'Sculpting forest green components...',
  'Synchronizing local leads & contacts...',
  'Inflating 3D workspace surfaces...'
]

// Mock Clients data
const INITIAL_CLIENTS = [
  { id: '1', name: 'Pinecrest Holdings', industry: 'Logistics', status: 'Active', value: '$12,500', health: 'high' },
  { id: '2', name: 'Mossy Oak Capital', industry: 'Finance', status: 'Warm Lead', value: '$8,200', health: 'medium' },
  { id: '3', name: 'Fernway Creative', industry: 'Design Agency', status: 'Outreach Sent', value: '$4,500', health: 'medium' },
  { id: '4', name: 'Evergreen Devs', industry: 'SaaS', status: 'Proposal', value: '$24,000', health: 'high' },
  { id: '5', name: 'Bramble & Co', industry: 'E-commerce', status: 'Inactive', value: '$0', health: 'low' },
]

export function ClayDashboardPage() {
  const [phase, setPhase] = useState<'prompt' | 'loading' | 'dashboard'>('prompt')
  const [loadingStep, setLoadingStep] = useState(0)
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [workspaceName, setWorkspaceName] = useState('My Forest CRM')
  const [niche, setNiche] = useState('B2B Tech Agencies')
  
  // Dashboard state
  const [clients, setClients] = useState(INITIAL_CLIENTS)
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Scrape digital gaps for Mossy Oak Capital', completed: true },
    { id: '2', text: 'Generate clay-based outreach message for Fernway Creative', completed: false },
    { id: '3', text: 'Review Bramble & Co inactive status reasons', completed: false },
    { id: '4', text: 'Follow up on Evergreen Devs proposal', completed: false },
  ])
  const [newTaskText, setNewTaskText] = useState('')
  
  // AI Chat feed
  const [aiChats, setAiChats] = useState([
    { sender: 'ai', message: 'Hello! I am your forest green client pilot copilot. Your clay workspace is successfully configured.' },
    { sender: 'ai', message: 'Insight: Fernway Creative has 3 active digital gaps in their SEO & local footprint. Recommend outreach now.' }
  ])
  const [promptInput, setPromptInput] = useState('')
  const [isTypingAI, setIsTypingAI] = useState(false)

  // Manage loading transition simulation
  useEffect(() => {
    if (phase !== 'loading') return
    
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1
        } else {
          clearInterval(interval)
          setTimeout(() => {
            setPhase('dashboard')
          }, 600)
          return prev
        }
      })
    }, 1100)

    return () => clearInterval(interval)
  }, [phase])

  // Actions
  const handleStartLoading = (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceDescription.trim()) return
    setLoadingStep(0)
    setPhase('loading')
  }

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskText.trim(), completed: false }])
    setNewTaskText('')
  }

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptInput.trim()) return
    const userMsg = promptInput.trim()
    setAiChats(prev => [...prev, { sender: 'user', message: userMsg }])
    setPromptInput('')
    setIsTypingAI(true)

    // Simulate AI response
    setTimeout(() => {
      let reply = "I've analyzed that request against your clay data model. Let me organize your deals and suggest optimization."
      if (userMsg.toLowerCase().includes('client') || userMsg.toLowerCase().includes('lead')) {
        reply = "I suggest targeting Evergreen Devs ($24,000 value). They fit perfectly into the high-conversion category and have a strong score of 92."
      } else if (userMsg.toLowerCase().includes('task')) {
        reply = "I've added your requested task checklist and auto-prioritized it based on revenue impact."
      }
      setAiChats(prev => [...prev, { sender: 'ai', message: reply }])
      setIsTypingAI(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#071307] text-[#e2f0e2] relative overflow-hidden font-sans selection:bg-[#5aad5a] selection:text-[#0a1f0a] pb-12">
      {/* Decorative Forest Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1b431b] blur-[140px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#163c16] blur-[150px] opacity-35 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: Prompt Screen */}
        {phase === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex items-center justify-center p-6 min-h-[calc(100vh-100px)]"
          >
            <div 
              className="w-full max-w-xl p-8 rounded-[32px] border border-[rgba(90,173,90,0.25)]"
              style={{
                background: 'linear-gradient(135deg, #0e2a0e, #061606)',
                boxShadow: '12px 12px 30px rgba(0, 0, 0, 0.6), inset 3px 3px 10px rgba(120, 220, 120, 0.2), inset -6px -6px 15px rgba(2, 6, 2, 0.7)'
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #1b4d1b, #0e2e0e)',
                    boxShadow: 'inset 2px 2px 6px rgba(120, 220, 120, 0.3), inset -2px -2px 6px rgba(2, 6, 2, 0.6)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#5aad5a]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">ClientPilot Claymorphism</h1>
                  <p className="text-xs text-[#8abf8a] font-mono">Forest Green Edition</p>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-white mb-3">Describe your ideal CRM workspace</h2>
              <p className="text-xs text-[#8abf8a] mb-6 leading-relaxed">
                Describe your agency niches, client acquisition goals, or desired pipeline structure. We will sculpt a personalized forest clay workspace tailored to your prompt.
              </p>

              <form onSubmit={handleStartLoading} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#8abf8a] uppercase tracking-wider block">Workspace Prompt</label>
                  <textarea
                    rows={4}
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="e.g. A CRM for my software agency focused on acquiring local dental clinics and logistics firms. I want a pipeline tracking cold outreach up to onboarding."
                    required
                    className="w-full p-4 rounded-2xl bg-[#081708] border border-[rgba(90,173,90,0.15)] text-[#e2f0e2] text-sm focus:outline-none focus:border-[#5aad5a] placeholder-[#407040] transition-all"
                    style={{
                      boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(120, 220, 120, 0.05)'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8abf8a] uppercase tracking-wider block">Workspace Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#081708] border border-[rgba(90,173,90,0.15)] text-[#e2f0e2] text-sm focus:outline-none focus:border-[#5aad5a] transition-all"
                      style={{
                        boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8abf8a] uppercase tracking-wider block">Niche target</label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#081708] border border-[rgba(90,173,90,0.15)] text-[#e2f0e2] text-sm focus:outline-none focus:border-[#5aad5a] transition-all"
                      style={{
                        boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 rounded-2xl font-bold text-[#0a1f0a] transition-all flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #8eff8e, #4ea14e)',
                    boxShadow: '4px 4px 15px rgba(90, 173, 90, 0.4), inset 2px 2px 5px rgba(255, 255, 255, 0.6), inset -3px -3px 6px rgba(2, 20, 2, 0.4)'
                  }}
                >
                  Create Workspace
                  <ArrowRight className="w-5 h-5 text-[#0a1f0a]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: 4-Step Loading Transition */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-6 text-center"
          >
            {/* Pulsing Clay Orb & Spinner */}
            <div className="relative w-44 h-44 mb-10 flex items-center justify-center">
              {/* Rotating outer spinner */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-[#5aad5a]"
                style={{
                  boxShadow: '0 0 15px rgba(90, 173, 90, 0.15)'
                }}
              />
              
              {/* Internal pulsing 3D Clay Orb */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  borderRadius: ["42% 58% 70% 30% / 45% 45% 55% 55%", "70% 30% 52% 48% / 60% 40% 60% 40%", "42% 58% 70% 30% / 45% 45% 55% 55%"]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #388e38, #0e2a0e)',
                  boxShadow: 'inset 8px 8px 20px rgba(180, 255, 180, 0.4), inset -10px -10px 25px rgba(1, 10, 1, 0.8), 8px 8px 24px rgba(0, 0, 0, 0.5)'
                }}
              >
                <Sparkles className="w-12 h-12 text-[#b0fcb0] animate-pulse" />
              </motion.div>
            </div>

            {/* Steps checklist */}
            <div className="w-full max-w-sm space-y-4 text-left">
              {LOADING_STEPS.map((step, idx) => {
                const isCompleted = idx < loadingStep
                const isActive = idx === loadingStep
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border"
                    style={{
                      background: isCompleted 
                        ? 'linear-gradient(135deg, #102a10, #081608)' 
                        : isActive 
                        ? 'linear-gradient(135deg, #143514, #0b1e0b)' 
                        : 'transparent',
                      borderColor: isCompleted 
                        ? 'rgba(90, 173, 90, 0.3)' 
                        : isActive 
                        ? 'rgba(90, 173, 90, 0.15)' 
                        : 'rgba(90, 173, 90, 0.05)',
                      boxShadow: isActive 
                        ? 'inset 2px 2px 6px rgba(120, 220, 120, 0.1), inset -2px -2px 6px rgba(0,0,0,0.4)' 
                        : isCompleted 
                        ? 'inset 2px 2px 6px rgba(120, 220, 120, 0.05)'
                        : 'none'
                    }}
                  >
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[#5aad5a] flex items-center justify-center">
                        <CheckCircle className="w-4.5 h-4.5 text-[#0a1f0a]" />
                      </div>
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-[#5aad5a] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[rgba(90,173,90,0.3)]" />
                    )}
                    <span 
                      className={`text-xs font-mono font-medium ${
                        isCompleted ? 'text-[#8abf8a] line-through' : isActive ? 'text-white' : 'text-[#487048]'
                      }`}
                    >
                      {step}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Dashboard */}
        {phase === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            
            {/* Sidebar Column (Clay sidebar) */}
            <div className="lg:col-span-1 space-y-6">
              <div 
                className="p-6 rounded-[28px] border border-[rgba(90,173,90,0.2)] flex flex-col space-y-6"
                style={{
                  background: 'linear-gradient(135deg, #0e2a0e, #071707)',
                  boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                }}
              >
                <div className="flex items-center gap-3 pb-4 border-b border-[rgba(90,173,90,0.15)]">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #1d521d, #0d2a0d)',
                      boxShadow: 'inset 2px 2px 5px rgba(120, 220, 120, 0.25), inset -2px -2px 5px rgba(2, 6, 2, 0.5)'
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-[#5aad5a]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{workspaceName}</h3>
                    <p className="text-[10px] text-[#8abf8a] font-mono">{niche}</p>
                  </div>
                </div>

                {/* Quick actions inside sidebar */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-[#4e7a4e] uppercase tracking-wider">Navigation</p>
                  <nav className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[linear-gradient(145deg,#133713,#0b230b)] text-[#8eff8e] text-xs font-semibold shadow-inner border border-[rgba(90,173,90,0.1)]">
                      <span>Workspace Home</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <button 
                      onClick={() => setPhase('prompt')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#123012] text-[#8abf8a] text-xs font-medium transition-all"
                    >
                      <span>Re-sculpt workspace</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                </div>

                {/* AI Workspace Health */}
                <div 
                  className="p-4 rounded-2xl border border-[rgba(90,173,90,0.15)]"
                  style={{
                    background: 'linear-gradient(135deg, #091f09, #051205)',
                    boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  <p className="text-[10px] font-bold text-[#4e7a4e] uppercase tracking-wider mb-2">Workspace Health</p>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl font-bold text-white font-mono">94%</span>
                    <span className="text-[10px] text-[#8eff8e] bg-[rgba(142,255,142,0.1)] px-1.5 py-0.5 rounded-full font-mono font-bold">+2.4%</span>
                  </div>
                  <div className="w-full bg-[#0a180a] rounded-full h-2 shadow-inner overflow-hidden">
                    <div className="bg-[#5aad5a] h-full rounded-full" style={{ width: '94%' }} />
                  </div>
                  <p className="text-[10px] text-[#6d9e6d] mt-2 leading-relaxed">Personalized outbound outreach shows high efficiency score.</p>
                </div>
              </div>
            </div>

            {/* Main CRM Column - takes remaining 3 cols */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Stat 1 */}
                <div 
                  className="p-5 rounded-3xl border border-[rgba(90,173,90,0.2)] flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #0f2e0f, #081908)',
                    boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8abf8a]">Active Pipeline Value</span>
                    <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,#1c541c,#0d2c0d)] flex items-center justify-center shadow-inner border border-[rgba(90,173,90,0.15)]">
                      <DollarSign className="w-4 h-4 text-[#8eff8e]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white font-mono">$49,200</h3>
                    <p className="text-[10px] text-[#8eff8e] flex items-center gap-1 mt-1 font-mono">
                      <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last week
                    </p>
                  </div>
                </div>

                {/* Stat 2 */}
                <div 
                  className="p-5 rounded-3xl border border-[rgba(90,173,90,0.2)] flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #0f2e0f, #081908)',
                    boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8abf8a]">Client Pilots active</span>
                    <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,#1c541c,#0d2c0d)] flex items-center justify-center shadow-inner border border-[rgba(90,173,90,0.15)]">
                      <Users className="w-4 h-4 text-[#8eff8e]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white font-mono">5 Agencies</h3>
                    <p className="text-[10px] text-[#8eff8e] flex items-center gap-1 mt-1 font-mono">
                      <TrendingUp className="w-3.5 h-3.5" /> 2 added today
                    </p>
                  </div>
                </div>

                {/* Stat 3 */}
                <div 
                  className="p-5 rounded-3xl border border-[rgba(90,173,90,0.2)] flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #0f2e0f, #081908)',
                    boxShadow: '8px 8px 20px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-[#8abf8a]">Qualify/Outreach Conversion</span>
                    <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,#1c541c,#0d2c0d)] flex items-center justify-center shadow-inner border border-[rgba(90,173,90,0.15)]">
                      <Star className="w-4 h-4 text-[#8eff8e]" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white font-mono">84.5%</h3>
                    <p className="text-[10px] text-[#e9c46a] flex items-center gap-1 mt-1 font-mono">
                      <TrendingDown className="w-3.5 h-3.5" /> -1.5% fluctuations
                    </p>
                  </div>
                </div>

              </div>

              {/* Deal Pipeline Row (sculpted stages) */}
              <div 
                className="p-6 rounded-[28px] border border-[rgba(90,173,90,0.2)]"
                style={{
                  background: 'linear-gradient(135deg, #0e2a0e, #071707)',
                  boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#5aad5a]" />
                    Deal Pipeline Stages
                  </h3>
                  <span className="text-[10px] font-mono text-[#8abf8a] bg-[rgba(90,173,90,0.15)] px-2 py-0.5 rounded-full">Automated Qualify</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { stage: 'Discovered', count: 18, color: '#5aad5a' },
                    { stage: 'Outreach Sent', count: 12, color: '#8eff8e' },
                    { stage: 'Proposal Active', count: 5, color: '#e9c46a' },
                    { stage: 'Closed Won', count: 8, color: '#5aad5a' },
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl text-center border border-[rgba(90,173,90,0.12)] flex flex-col justify-between"
                      style={{
                        background: 'linear-gradient(135deg, #081d08, #040f04)',
                        boxShadow: 'inset 2px 2px 5px rgba(120, 220, 120, 0.05), inset -3px -3px 6px rgba(0,0,0,0.4)'
                      }}
                    >
                      <span className="text-[10px] text-[#8abf8a] block font-medium truncate">{item.stage}</span>
                      <div className="my-2">
                        <span className="text-lg font-bold font-mono text-white">{item.count}</span>
                      </div>
                      <div className="w-full bg-[#030903] h-1.5 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full" style={{ width: `${(item.count/20)*100}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two columns content: Clients and AI/Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Client List with Clay Badges */}
                <div 
                  className="p-6 rounded-[28px] border border-[rgba(90,173,90,0.2)] flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #0e2a0e, #071707)',
                    boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-[rgba(90,173,90,0.15)] mb-4">
                      <h4 className="text-sm font-bold text-white">Client List</h4>
                      <span className="text-xs text-[#8abf8a] font-mono">{clients.length} listed</span>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {clients.map(client => (
                        <div 
                          key={client.id}
                          className="p-3.5 rounded-2xl border border-[rgba(90,173,90,0.1)] flex items-center justify-between"
                          style={{
                            background: 'linear-gradient(135deg, #0a1f0a, #051005)',
                            boxShadow: 'inset 2px 2px 5px rgba(120, 220, 120, 0.05), 3px 3px 8px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{client.name}</span>
                            <span className="text-[10px] text-[#6d9e6d] font-mono">{client.industry}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{client.value}</span>
                            <span 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-(--shadow-sm)`}
                              style={{
                                background: client.health === 'high' 
                                  ? 'linear-gradient(135deg, #1e461e, #0e200e)' 
                                  : client.health === 'medium'
                                  ? 'linear-gradient(135deg, #3d3d1a, #1d1d0d)'
                                  : 'linear-gradient(135deg, #3f1a1a, #1f0d0d)',
                                color: client.health === 'high' 
                                  ? '#8eff8e' 
                                  : client.health === 'medium'
                                  ? '#e9c46a'
                                  : '#ff8e8e',
                                border: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              {client.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checklist & AI Insights */}
                <div className="space-y-6">
                  
                  {/* Task Checklist */}
                  <div 
                    className="p-6 rounded-[28px] border border-[rgba(90,173,90,0.2)] flex flex-col justify-between"
                    style={{
                      background: 'linear-gradient(135deg, #0e2a0e, #071707)',
                      boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                    }}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white pb-3 border-b border-[rgba(90,173,90,0.15)] mb-3 flex items-center justify-between">
                        <span>Workspace Checklist</span>
                        <span className="text-[10px] text-[#8abf8a] font-mono">
                          {tasks.filter(t => t.completed).length}/{tasks.length} done
                        </span>
                      </h4>

                      <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
                        {tasks.map(task => (
                          <div 
                            key={task.id}
                            onClick={() => handleToggleTask(task.id)}
                            className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-[#123312] transition-colors"
                          >
                            {task.completed ? (
                              <CheckSquare className="w-4.5 h-4.5 text-[#5aad5a] shrink-0" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-[#8abf8a] shrink-0" />
                            )}
                            <span className={`text-xs ${task.completed ? 'text-[#5a805a] line-through' : 'text-[#e2f0e2]'}`}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add quick task..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#081708] border border-[rgba(90,173,90,0.15)] text-[#e2f0e2] text-xs focus:outline-none placeholder-[#407040] shadow-inner"
                      />
                      <button 
                        type="submit"
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:brightness-110 shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #8eff8e, #4ea14e)',
                          boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.4)',
                        }}
                      >
                        <Plus className="w-4 h-4 text-[#0a1f0a]" />
                      </button>
                    </form>
                  </div>

                  {/* AI Insights bubbles */}
                  <div 
                    className="p-6 rounded-[28px] border border-[rgba(90,173,90,0.2)] flex flex-col justify-between"
                    style={{
                      background: 'linear-gradient(135deg, #0e2a0e, #071707)',
                      boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.15), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[rgba(90,173,90,0.15)]">
                        <MessageSquare className="w-4 h-4 text-[#5aad5a]" />
                        <h4 className="text-sm font-bold text-white">AI Copilot Analysis</h4>
                      </div>
                      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                        {aiChats.map((chat, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                              chat.sender === 'ai' 
                                ? 'bg-[linear-gradient(135deg,#0a210a,#051105)] text-[#e2f0e2] mr-auto border border-[rgba(90,173,90,0.1)] shadow-sm'
                                : 'bg-[linear-gradient(135deg,#1d4d1d,#0e2e0e)] text-[#8eff8e] ml-auto border border-[rgba(142,255,142,0.1)] shadow-sm'
                            }`}
                            style={{
                              boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.02), 3px 3px 6px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            {chat.message}
                          </div>
                        ))}
                        {isTypingAI && (
                          <div className="flex items-center gap-1 text-[10px] text-[#8abf8a] italic">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pilot AI is analyzing...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Quick-action AI Prompt Bar */}
              <div 
                className="p-3 rounded-3xl border border-[rgba(90,173,90,0.2)]"
                style={{
                  background: 'linear-gradient(135deg, #0c240c, #061406)',
                  boxShadow: '8px 8px 24px rgba(0, 0, 0, 0.4), inset 3px 3px 8px rgba(120, 220, 120, 0.1), inset -5px -5px 12px rgba(2, 6, 2, 0.6)'
                }}
              >
                <form onSubmit={handleSendPrompt} className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-2xl bg-[#081708] flex items-center justify-center border border-[rgba(90,173,90,0.1)] shadow-inner">
                    <Sparkles className="w-5 h-5 text-[#5aad5a]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ask ClientPilot AI to qualify a lead, script outreach or add clients..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-[#e2f0e2] text-sm focus:outline-none placeholder-[#407040] px-2"
                  />
                  <button 
                    type="submit"
                    className="px-5 h-10 rounded-2xl text-[#0a1f0a] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #8eff8e, #4ea14e)',
                      boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.4)',
                    }}
                  >
                    Send
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

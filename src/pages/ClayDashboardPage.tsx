import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  Users,
  DollarSign,
  TrendingUp,
  FolderOpen,
  CheckSquare,
  Plus,
  Trash2,
  Send,
  Eye,
  Edit2,
  ChevronRight,
  Sun,
  LayoutDashboard,
  Kanban,
  CheckCircle,
  Clock,
  Layers,
  Inbox,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'

// Define the steps for loading phase
const LOADING_STEPS = [
  'Initializing ClientPilot clay container...',
  'Sculpting forest green components...',
  'Synchronizing local leads & contacts...',
  'Inflating 3D workspace surfaces...'
]

export function ClayDashboardPage() {
  const [phase, setPhase] = useState<'prompt' | 'loading' | 'dashboard'>('prompt')
  const [loadingStep, setLoadingStep] = useState(0)
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [workspaceName, setWorkspaceName] = useState('GrowthVault')
  const [niche, setNiche] = useState('Acme Agencies')
  
  // Dashboard Sub-Views
  const [activeTab, setActiveTab] = useState<'admin' | 'user' | 'settings'>('admin')
  const [sidebarItem, setSidebarItem] = useState('Dashboard')
  
  // Slide-out Notification panel
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChatDrawer, setShowChatDrawer] = useState(false)
  
  // Active modal state
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Tasks State
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Sculpt 3D landing page review', completed: true, priority: 'green' },
    { id: '2', text: 'Generate clay-based outreach campaigns', completed: false, priority: 'gold' },
    { id: '3', text: 'Perform SEO digital gap audit on Pinecrest', completed: false, priority: 'red' },
    { id: '4', text: 'Follow up on Evergreen Devs proposal', completed: false, priority: 'gold' },
  ])
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'green' | 'gold' | 'red'>('green')

  // Chat Feed
  const [aiChats, setAiChats] = useState([
    { sender: 'ai', message: 'Welcome to GrowthVault. I have finished sculpting your Forest Green CRM workspace.' },
    { sender: 'ai', message: 'Ready to qualify leads and trigger personalized outreach?' }
  ])
  const [promptInput, setPromptInput] = useState('')
  const [isTypingAI, setIsTypingAI] = useState(false)

  // Simulation loading transition
  useEffect(() => {
    if (phase !== 'loading') return
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1
        } else {
          clearInterval(interval)
          setTimeout(() => setPhase('dashboard'), 600)
          return prev
        }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleStartLoading = (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceDescription.trim()) return
    setLoadingStep(0)
    setPhase('loading')
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    setTasks([...tasks, {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority
    }])
    setNewTaskText('')
  }

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptInput.trim()) return
    const msg = promptInput.trim()
    setAiChats(prev => [...prev, { sender: 'user', message: msg }])
    setPromptInput('')
    setIsTypingAI(true)
    setTimeout(() => {
      setAiChats(prev => [...prev, { sender: 'ai', message: "I've processed your data with OpenAI scoring. Recommend targeting Mossy Oak Capital ($8,200)." }])
      setIsTypingAI(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen text-[#e2f0e2] relative overflow-hidden font-sans pb-12" style={{
      background: 'linear-gradient(135deg, #0D2B1F 0%, #1A4A32 50%, #2D6A4F 100%)',
      fontFamily: "'Nunito', sans-serif"
    }}>
      
      {/* 3D DECORATIVE SHAPES IN BACKGROUND */}
      <div className="absolute top-[10%] left-[5%] w-32 h-32 opacity-15 pointer-events-none animate-[spin_12s_linear_infinite]">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="#FFB347" strokeWidth="15" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.3))" />
        </svg>
      </div>
      <div className="absolute bottom-[15%] right-[8%] w-24 h-24 opacity-10 pointer-events-none animate-[bounce_4s_ease-in-out_infinite]">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="20" y="20" width="60" height="60" rx="20" fill="#2EC4B6" filter="drop-shadow(0 8px 12px rgba(0,0,0,0.3))" />
        </svg>
      </div>
      <div className="absolute top-[60%] left-[2%] w-20 h-28 opacity-10 pointer-events-none animate-[bounce_5s_ease-in-out_infinite]">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="35" y="10" width="30" height="80" rx="15" fill="#FF6B9D" />
        </svg>
      </div>

      <style>{`
        /* Custom clay classes */
        .clay-card-dark {
          background: rgba(240, 255, 244, 0.08);
          border: 3px solid #2D6A4F;
          border-radius: 32px;
          box-shadow: inset 4px 4px 10px rgba(255, 255, 255, 0.05),
                      inset -4px -4px 10px rgba(0, 0, 0, 0.4),
                      0 15px 30px rgba(13, 43, 31, 0.5);
          backdrop-filter: blur(12px);
        }
        
        .clay-card-light {
          background: #F0FFF4;
          border: 3px solid #2D6A4F;
          border-radius: 28px;
          box-shadow: inset 3px 3px 6px rgba(255, 255, 255, 0.9),
                      inset -3px -3px 6px rgba(45, 106, 79, 0.15),
                      0 12px 24px rgba(13, 43, 31, 0.35);
          color: #0D2B1F;
        }

        .clay-button-primary {
          background: linear-gradient(180deg, #40916C 0%, #2D6A4F 100%);
          box-shadow: inset 3px 3px 6px rgba(255, 255, 255, 0.3),
                      inset -3px -4px 6px rgba(0, 0, 0, 0.3),
                      0 6px 12px rgba(13, 43, 31, 0.3);
          border: none;
          color: #fff;
          font-weight: 800;
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .clay-button-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: inset 3px 3px 6px rgba(255, 255, 255, 0.4),
                      0 10px 20px rgba(13, 43, 31, 0.4);
        }

        .clay-button-secondary {
          background: #ffffff;
          box-shadow: inset 3px 3px 6px rgba(255, 255, 255, 0.9),
                      inset -3px -3px 6px rgba(45, 106, 79, 0.15),
                      0 6px 12px rgba(13, 43, 31, 0.15);
          border: 2px solid #B7E4C7;
          border-radius: 14px;
          color: #0D2B1F;
          font-weight: 800;
          transition: all 0.2s ease;
        }

        .clay-button-secondary:hover {
          transform: translateY(-2px);
          border-color: #40916C;
        }

        .clay-input {
          background: #ffffff;
          border: 2.5px solid #B7E4C7;
          border-radius: 18px;
          color: #0D2B1F;
          box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.05),
                      inset -2px -2px 4px rgba(255, 255, 255, 0.8);
          font-weight: 700;
          outline: none;
          height: 54px;
          transition: all 0.2s ease;
        }

        .clay-input:focus {
          border-color: #40916C;
          box-shadow: 0 0 0 4px rgba(82, 183, 136, 0.2);
        }

        .badge-capsule {
          border-radius: 50px;
          font-weight: 800;
          font-size: 11px;
          padding: 4px 12px;
          box-shadow: inset 1px 1px 3px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.1);
        }
      `}</style>

      <AnimatePresence mode="wait">
        
        {/* PHASE 1: Prompt Screen */}
        {phase === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center p-6 min-h-[calc(100vh-50px)]"
          >
            <div className="w-full max-w-xl p-10 clay-card-dark">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#52B788] to-[#2D6A4F] flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white">GrowthVault 3D Dashboard</h1>
                  <p className="text-xs text-[#74C69D] font-bold">Sculpted Workspace Builder</p>
                </div>
              </div>

              <form onSubmit={handleStartLoading} className="space-y-6">
                <div>
                  <label className="text-xs font-extrabold text-[#B7E4C7] uppercase tracking-wider block mb-2">Configure Workspace prompt</label>
                  <textarea
                    rows={3}
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="Describe target niches, active campaigns, and dashboard visuals..."
                    required
                    className="w-full p-4 rounded-2xl bg-[#0D2B1F] border-2 border-[#2D6A4F] text-white text-sm focus:outline-none focus:border-[#52B788] placeholder-[#2D6A4F] shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-[#B7E4C7] uppercase tracking-wider block mb-2">Workspace Name</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-4 h-12 rounded-xl bg-[#0D2B1F] border-2 border-[#2D6A4F] text-white text-sm focus:outline-none focus:border-[#52B788] shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-[#B7E4C7] uppercase tracking-wider block mb-2">Niche Target</label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full px-4 h-12 rounded-xl bg-[#0D2B1F] border-2 border-[#2D6A4F] text-white text-sm focus:outline-none focus:border-[#52B788] shadow-inner"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full h-14 clay-button-primary flex items-center justify-center gap-2">
                  Sculpt Workspace Now
                  <ArrowRight />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: Pulsing Orb Spinner */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <div className="relative w-44 h-44 mb-10 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-[#52B788] opacity-50"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #40916C, #0D2B1F)',
                  boxShadow: 'inset 8px 8px 16px rgba(255, 255, 255, 0.3), inset -8px -8px 16px rgba(0,0,0,0.5), 0 10px 24px rgba(13, 43, 31, 0.4)'
                }}
              >
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </motion.div>
            </div>

            <div className="w-full max-w-sm space-y-3.5">
              {LOADING_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#2D6A4F]/20"
                  style={{ background: idx < loadingStep ? 'rgba(240, 255, 244, 0.05)' : 'transparent' }}
                >
                  {idx < loadingStep ? (
                    <CheckCircle className="w-5 h-5 text-[#52B788]" />
                  ) : idx === loadingStep ? (
                    <Loader2 className="w-5 h-5 text-[#FFB347] animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5 text-[#2D6A4F] opacity-40" />
                  )}
                  <span className={`text-xs font-mono ${idx <= loadingStep ? 'text-white' : 'text-[#2D6A4F]'} ${idx < loadingStep ? 'line-through opacity-50' : ''}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Complete Redesigned Dashboard */}
        {phase === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full mx-auto px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative"
          >
            
            {/* LEFT SIDEBAR (Width: 280px equivalent on grid) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="clay-card-dark p-6 flex flex-col space-y-6 min-h-[calc(100vh-100px)]">
                
                {/* Branding Logo */}
                <div className="flex items-center gap-3 pb-4 border-b-2 border-[#2D6A4F]/30">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#74C69D] to-[#40916C] flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base leading-none">GrowthVault</h3>
                    <span className="text-[10px] font-bold text-[#74C69D] mt-1 block">Achieve your potential.</span>
                  </div>
                </div>

                {/* Dashboard Mode Toggles */}
                <div className="bg-[#0D2B1F]/60 p-1.5 rounded-2xl border-2 border-[#2D6A4F]/30 grid grid-cols-2 gap-1 shadow-inner">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'admin' ? 'bg-[#40916C] text-white shadow-md' : 'text-[#74C69D] hover:text-white'}`}
                  >
                    Admin UI
                  </button>
                  <button
                    onClick={() => setActiveTab('user')}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'user' ? 'bg-[#40916C] text-white shadow-md' : 'text-[#74C69D] hover:text-white'}`}
                  >
                    User UI
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-1.5">
                  {[
                    { label: 'Dashboard', icon: LayoutDashboard, tab: 'admin' },
                    { label: 'Leads & Tasks', icon: Kanban, tab: 'user' },
                    { label: 'Settings', icon: Settings, tab: 'settings' }
                  ].map((item, index) => {
                    const isSelected = activeTab === item.tab
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSidebarItem(item.label)
                          setActiveTab(item.tab as any)
                        }}
                        className={`w-full h-[58px] px-4 rounded-2xl flex items-center gap-3.5 transition-all transform active:scale-95 ${
                          isSelected 
                            ? 'bg-[#40916C] text-white shadow-lg shadow-[#40916C]/25 border-2 border-[#52B788]' 
                            : 'hover:translate-y-[-3px] text-[#74C69D] hover:text-white bg-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${isSelected ? 'bg-white/20' : 'bg-[#1A4A32]'}`}>
                          <item.icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-sm font-extrabold">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>

                {/* Reset Trigger */}
                <button
                  onClick={() => setPhase('prompt')}
                  className="w-full py-3 rounded-xl border border-dashed border-[#74C69D]/30 hover:border-[#74C69D] text-[#74C69D] text-xs font-extrabold transition-all text-center"
                >
                  Configure Workspace
                </button>
              </div>
            </div>

            {/* MAIN APP SHELL COLUMN */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* TOP HEADER */}
              <header className="clay-card-dark p-3.5 flex items-center justify-between gap-4">
                
                {/* Search Box */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2D6A4F] w-4.5 h-4.5" />
                  <input
                    type="text"
                    placeholder="Search GrowthVault workspace..."
                    className="w-full pl-11 pr-4 h-11 bg-white border-2 border-[#B7E4C7] rounded-xl text-[#0D2B1F] font-bold text-xs shadow-inner focus:outline-none focus:border-[#40916C]"
                  />
                </div>

                {/* Action Buttons & Avatar */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-11 h-11 rounded-full bg-[#1A4A32] hover:bg-[#2D6A4F] flex items-center justify-center border-2 border-[#2D6A4F]/30 relative transition-all shadow-md active:scale-95"
                  >
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF6B9D] rounded-full" />
                  </button>

                  <button
                    onClick={() => setShowChatDrawer(!showChatDrawer)}
                    className="w-11 h-11 rounded-full bg-[#1A4A32] hover:bg-[#2D6A4F] flex items-center justify-center border-2 border-[#2D6A4F]/30 transition-all shadow-md active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 text-white" />
                  </button>

                  {/* User Avatar */}
                  <div className="flex items-center gap-2.5 ml-2.5 border-l-2 border-[#2D6A4F]/30 pl-4">
                    <div className="relative w-11 h-11 rounded-full bg-[#FFB347] border-2 border-[#2D6A4F] flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-[#0D2B1F]" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#52B788] border-2 border-[#1A4A32] rounded-full" />
                    </div>
                  </div>
                </div>
              </header>

              <AnimatePresence mode="wait">
                
                {/* SUB-VIEW 1: ADMIN DASHBOARD */}
                {activeTab === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    {/* HERO WELCOME CARD */}
                    <div className="clay-card-light p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
                      <div className="md:col-span-8 space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-[#0D2B1F]">Welcome back Admin</h1>
                        <p className="text-sm text-[#2D6A4F] font-bold max-w-[500px]">Monitor your business growth and performance. Access lead generation pipelines and scoring logs.</p>
                      </div>
                      
                      {/* Floating clay illustration */}
                      <div className="md:col-span-4 flex justify-center relative min-h-[120px]">
                        <motion.div
                          animate={{ rotateY: [0, 6, 0] }}
                          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                          className="w-full max-w-[140px]"
                        >
                          <svg viewBox="0 0 120 120" fill="none" className="w-full h-auto">
                            <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#071307" flood-opacity="0.3" />
                            </filter>
                            <g filter="url(#clayShadow)">
                              <rect x="20" y="60" width="16" height="40" rx="8" fill="#40916C" />
                              <rect x="44" y="30" width="16" height="70" rx="8" fill="#52B788" />
                              <rect x="68" y="45" width="16" height="55" rx="8" fill="#74C69D" />
                              <path d="M25 50 L50 20 L75 35 L100 10" stroke="#FFB347" strokeWidth="6" strokeLinecap="round" fill="none" />
                            </g>
                          </svg>
                        </motion.div>
                      </div>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { title: 'Total Users', value: '1,482', change: '+12.4%', color: '#52B788', spark: [30, 45, 35, 60, 50, 75] },
                        { title: 'Revenue', value: '$34,900', change: '+8.1%', color: '#FFB347', spark: [50, 40, 60, 55, 70, 85] },
                        { title: 'Active Projects', value: '42 Active', change: '+5%', color: '#74C69D', spark: [20, 30, 25, 45, 35, 50] },
                        { title: 'Conversion', value: '84.5%', change: '-1.2%', color: '#FF6B9D', spark: [90, 85, 88, 80, 82, 84] }
                      ].map((card, idx) => (
                        <div
                          key={idx}
                          className="clay-card-light p-5 hover:translate-y-[-6px] hover:scale-[1.02] transition-all transform flex flex-col justify-between h-[175px]"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-extrabold text-[#2D6A4F]">{card.title}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#1A4A32]/10 text-[#2D6A4F]">{card.change}</span>
                          </div>

                          <div className="my-2">
                            <h3 className="text-2xl font-black text-[#0D2B1F] tracking-tight">{card.value}</h3>
                          </div>

                          {/* Sparkline */}
                          <div className="h-8 w-full mt-2 opacity-85">
                            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <path
                                d={`M ${card.spark.map((val, i) => `${i * 20}, ${30 - (val / 3.5)}`).join(' L ')}`}
                                fill="none"
                                stroke={card.color}
                                strokeWidth="4.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ANALYTICS SECTION */}
                    <div className="clay-card-dark p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-black text-white">Analytics Overview</h3>
                          <span className="text-xs text-[#74C69D] font-bold">Conversion rates & pipeline metrics</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded-xl bg-[#1A4A32] text-xs font-bold border border-[#2D6A4F]">Weekly</button>
                          <button className="px-3 py-1.5 rounded-xl bg-transparent text-xs font-bold text-[#74C69D]">Monthly</button>
                        </div>
                      </div>

                      {/* Rounded curve interactive chart */}
                      <div className="h-52 w-full bg-[#0D2B1F]/50 rounded-2xl border-2 border-[#2D6A4F]/20 relative overflow-hidden flex items-end p-2 shadow-inner">
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 200" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stop-color="#52B788" stop-opacity="0.3" />
                              <stop offset="100%" stop-color="#52B788" stop-opacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 0,160 Q 100,60 200,120 T 400,50 T 500,90 L 500,200 L 0,200 Z"
                            fill="url(#chartGrad)"
                          />
                          <path
                            d="M 0,160 Q 100,60 200,120 T 400,50 T 500,90"
                            fill="none"
                            stroke="#52B788"
                            strokeWidth="6"
                            strokeLinecap="round"
                          />
                          {/* Dot Highlight */}
                          <circle cx="200" cy="120" r="8" fill="#FFB347" stroke="#ffffff" strokeWidth="3.5" />
                        </svg>
                        <div className="absolute top-4 left-6 bg-[#1A4A32] p-2.5 rounded-xl border border-[#2D6A4F] text-[11px] font-extrabold text-[#8eff8e] shadow-md">
                          Peak Growth: +42 Leads/Day
                        </div>
                      </div>
                    </div>

                    {/* RECENT USERS TABLE CARDS */}
                    <div className="clay-card-dark p-6 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-[#2D6A4F]/20">
                        <h4 className="text-sm font-black text-white">Recent Workspace Users</h4>
                        <button className="text-xs font-bold text-[#74C69D] hover:text-white">View All</button>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { name: 'Sarah Connor', role: 'Campaign Manager', status: 'Active', value: '$12,400' },
                          { name: 'Bruce Wayne', role: 'Outreach Director', status: 'Pending', value: '$45,000' },
                          { name: 'Clark Kent', role: 'Data Scraper', status: 'Active', value: '$9,200' },
                          { name: 'Peter Parker', role: 'AI Auditor', status: 'Blocked', value: '$0' }
                        ].map((user, index) => (
                          <div
                            key={index}
                            className="p-3.5 rounded-2xl bg-[#1A4A32]/40 border border-[#2D6A4F]/20 flex flex-wrap items-center justify-between gap-3 shadow-inner hover:translate-x-1.5 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#74C69D] flex items-center justify-center text-[#0D2B1F] font-black text-sm shadow-md">
                                {user.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div>
                                <span className="text-xs font-extrabold text-white block leading-none">{user.name}</span>
                                <span className="text-[10px] text-[#74C69D] font-bold mt-1 block">{user.role}</span>
                              </div>
                            </div>

                            <span className={`badge-capsule ${
                              user.status === 'Active' ? 'bg-[#52B788]/20 text-[#52B788]' :
                              user.status === 'Pending' ? 'bg-[#FFB347]/20 text-[#FFB347]' : 'bg-[#FF6B9D]/20 text-[#FF6B9D]'
                            }`}>
                              {user.status}
                            </span>

                            <span className="text-xs font-mono font-extrabold text-white">{user.value}</span>

                            <div className="flex gap-1.5">
                              <button className="w-8 h-8 rounded-xl bg-[#1A4A32] flex items-center justify-center hover:bg-[#2D6A4F] text-[#74C69D] transition-colors shadow-sm">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="w-8 h-8 rounded-xl bg-[#1A4A32] flex items-center justify-center hover:bg-[#2D6A4F] text-[#74C69D] transition-colors shadow-sm">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SUB-VIEW 2: USER DASHBOARD */}
                {activeTab === 'user' && (
                  <motion.div
                    key="user"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    {/* HERO WELCOME */}
                    <div className="clay-card-light p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
                      <div className="md:col-span-8 space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-[#0D2B1F]">Welcome back, Waji</h1>
                        <p className="text-sm text-[#2D6A4F] font-bold">Track your qualified clients and task checklists efficiently.</p>
                      </div>
                      
                      {/* Floating Laptop / Mascot */}
                      <div className="md:col-span-4 flex justify-center">
                        <motion.div
                          animate={{ translateY: [0, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="w-24 h-24"
                        >
                          <svg viewBox="0 0 100 100" fill="none">
                            <rect x="10" y="20" width="80" height="50" rx="10" fill="#2D6A4F" />
                            <rect x="20" y="28" width="60" height="34" rx="4" fill="#F0FFF4" />
                            <rect x="5" y="70" width="90" height="8" rx="4" fill="#FFB347" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Projects', val: '12' },
                        { label: 'Clients', val: '45' },
                        { label: 'Invoices', val: '31' },
                        { label: 'Tasks Done', val: '14' }
                      ].map((item, index) => (
                        <div key={index} className="clay-card-dark p-4.5 text-center">
                          <span className="text-[10px] text-[#74C69D] font-extrabold uppercase tracking-wider block">{item.label}</span>
                          <h2 className="text-2xl font-black text-white mt-1.5 font-mono">{item.val}</h2>
                        </div>
                      ))}
                    </div>

                    {/* TASK SECTION & PROJECT KANBAN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Tasks Card */}
                      <div className="clay-card-dark p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center pb-3 border-b border-[#2D6A4F]/20 mb-4">
                            <h4 className="text-sm font-black text-white">Task Capsules</h4>
                            <span className="text-xs font-mono text-[#74C69D]">{tasks.filter(t=>t.completed).length}/{tasks.length} done</span>
                          </div>

                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {tasks.map(task => (
                              <div
                                key={task.id}
                                onClick={() => handleToggleTask(task.id)}
                                className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                                  task.completed ? 'bg-[#52B788]/15 border-2 border-[#52B788]/20' : 'bg-[#1A4A32]/40 border border-[#2D6A4F]/20'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    task.completed ? 'bg-[#52B788] border-[#52B788]' : 'border-[#74C69D]'
                                  }`}>
                                    {task.completed && <CheckSquare className="w-3.5 h-3.5 text-[#0D2B1F]" />}
                                  </div>
                                  <span className={`text-xs font-bold ${task.completed ? 'line-through text-[#74C69D] opacity-60' : 'text-white'}`}>
                                    {task.text}
                                  </span>
                                </div>
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  task.priority === 'red' ? 'bg-[#FF6B9D]' : task.priority === 'gold' ? 'bg-[#FFB347]' : 'bg-[#52B788]'
                                }`} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Add Task Form */}
                        <form onSubmit={handleAddTask} className="mt-4 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add new custom task..."
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            className="flex-1 px-3 h-10 bg-white border-2 border-[#B7E4C7] rounded-xl text-[#0D2B1F] text-xs font-bold"
                          />
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as any)}
                            className="px-2 h-10 bg-[#1A4A32] border border-[#2D6A4F] rounded-xl text-xs font-bold text-white focus:outline-none"
                          >
                            <option value="green">Low</option>
                            <option value="gold">Medium</option>
                            <option value="red">High</option>
                          </select>
                          <button type="submit" className="w-10 h-10 rounded-xl bg-[#52B788] hover:bg-[#74C69D] flex items-center justify-center text-[#0D2B1F] shadow-md">
                            <Plus />
                          </button>
                        </form>
                      </div>

                      {/* Kanban / Sticky Notes View */}
                      <div className="clay-card-dark p-6">
                        <div className="flex justify-between items-center pb-3 border-b border-[#2D6A4F]/20 mb-4">
                          <h4 className="text-sm font-black text-white">Sticky Note Kanban</h4>
                          <span className="badge-capsule bg-[#FFB347]/20 text-[#FFB347]">Active Review</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { title: 'Todo', tasks: ['OSM Scan', 'Data validation'], color: '#ede9fe' },
                            { title: 'In Progress', tasks: ['AI templates'], color: '#ffedd5' },
                            { title: 'Completed', tasks: ['Setup db'], color: '#d1fae5' }
                          ].map((column, colIdx) => (
                            <div key={colIdx} className="space-y-2">
                              <h5 className="text-[10px] font-black text-[#74C69D] uppercase tracking-wider text-center mb-1">{column.title}</h5>
                              {column.tasks.map((tText, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="p-3 rounded-xl hover:rotate-3 transition-transform cursor-grab border border-black/10"
                                  style={{
                                    backgroundColor: column.color,
                                    color: '#0D2B1F',
                                    boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.7), 2px 4px 8px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  <p className="text-[11px] font-extrabold leading-tight">{tText}</p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* SUB-VIEW 3: SETTINGS PAGE */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="clay-card-light p-8">
                      <h2 className="text-2xl font-black mb-6 text-[#0D2B1F]">Workspace Settings</h2>
                      
                      <div className="space-y-5">
                        {[
                          { title: 'AI Scoring Engine', desc: 'Use GPT-4 scoring to qualify digital gaps.' },
                          { title: 'Local scraping loops', desc: 'Scan target radius continuously in background.' },
                          { title: 'Dark clay mode', desc: 'Use deep high contrast styling templates.' }
                        ].map((opt, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-[#B7E4C7] shadow-inner">
                            <div>
                              <span className="text-sm font-extrabold text-[#0D2B1F] block">{opt.title}</span>
                              <span className="text-xs text-[#2D6A4F]">{opt.desc}</span>
                            </div>
                            
                            {/* Pill Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                              <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-[#52B788]" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>

            {/* SLIDE-OUT NOTIFICATIONS PANEL */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="fixed top-24 right-6 w-80 clay-card-dark p-5 z-50 shadow-2xl"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-[#2D6A4F]/20 mb-4">
                    <h4 className="text-sm font-black text-white">Notifications</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-xs font-bold text-[#74C69D]">Clear</button>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { title: 'New lead qualified', msg: 'Evergreen Devs scored 92/100', time: '2m ago' },
                      { title: 'Scraper task complete', msg: '5 new clients found in Karachi', time: '10m ago' }
                    ].map((n, i) => (
                      <div key={i} className="p-3 bg-[#1A4A32]/40 rounded-xl border border-[#2D6A4F]/10 relative shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#FFB347] absolute top-3.5 right-3.5" />
                        <h5 className="text-xs font-extrabold text-white leading-none mb-1">{n.title}</h5>
                        <p className="text-[10px] text-[#74C69D] leading-tight mb-2">{n.msg}</p>
                        <span className="text-[9px] text-[#2D6A4F] font-bold font-mono">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SLIDE-OUT CHAT PANEL */}
            <AnimatePresence>
              {showChatDrawer && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="fixed top-24 right-6 w-88 clay-card-dark p-5 z-50 shadow-2xl flex flex-col justify-between h-[500px]"
                >
                  <div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#2D6A4F]/20 mb-4">
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#52B788]" /> Pilot AI Copilot
                      </h4>
                      <button onClick={() => setShowChatDrawer(false)} className="text-xs font-extrabold text-[#74C69D]">Close</button>
                    </div>

                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                      {aiChats.map((c, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            c.sender === 'ai' 
                              ? 'bg-[#1A4A32]/60 text-white mr-auto border border-[#2D6A4F]/20'
                              : 'bg-[#40916C]/65 text-white ml-auto border border-[#52B788]/20'
                          }`}
                        >
                          {c.message}
                        </div>
                      ))}
                      {isTypingAI && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#74C69D] italic">
                          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing workspace...
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSendPrompt} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask copilot..."
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="flex-1 px-3 h-10 bg-white border border-[#B7E4C7] rounded-xl text-[#0D2B1F] text-xs font-bold focus:outline-none"
                    />
                    <button type="submit" className="px-3 h-10 rounded-xl bg-[#52B788] hover:bg-[#74C69D] flex items-center justify-center text-[#0D2B1F] shadow-sm">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

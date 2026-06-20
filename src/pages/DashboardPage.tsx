import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, Star, Send, BarChart2, Activity, Sparkles,
  CheckCircle2, Zap, ArrowUpRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { getDashboardStats } from '@/lib/mockApi'
import { streamingActivityEvents } from '@/data/mockLeads'
import type { DashboardStats, ActivityEvent } from '@/types'
import { formatRelativeTime, cn } from '@/lib/utils'

// ============================================================
// Sparkline (tiny inline chart)
// ============================================================
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 64, h = 28, pad = 2
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="3" fill={color} />
    </svg>
  )
}

// ============================================================
// Stat Card
// ============================================================
interface StatCardProps {
  label: string
  value: string | number
  trend: number
  sparkline: number[]
  icon: React.ReactNode
  accent: string
  delay?: number
}

function StatCard({ label, value, trend, sparkline, icon, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
      className="clay-card-dark p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center border-2 border-white/10 shadow-inner', accent)}>
          {icon}
        </div>
        <div className="bg-black/10 px-2 py-1.5 rounded-xl border border-white/5">
          <Sparkline data={sparkline} color={trend >= 0 ? '#52B788' : '#FFB347'} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{value}</p>
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-[#52B788]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[#FFB347]" />
          )}
          <span className={cn('text-xs font-extrabold', trend >= 0 ? 'text-[#74C69D]' : 'text-[#FFB347]')}>
            {trend >= 0 ? '+' : ''}{trend}% vs last week
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// Activity event icons
// ============================================================
function ActivityIcon({ type }: { type: ActivityEvent['type'] }) {
  const map = {
    scored: { icon: <Star className="h-3.5 w-3.5" />, bg: 'bg-[#8b5cf6]/20 text-[#c084fc] border-[#8b5cf6]/30' },
    outreach_sent: { icon: <Send className="h-3.5 w-3.5" />, bg: 'bg-[#52B788]/20 text-[#74C69D] border-[#52B788]/30' },
    stage_changed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, bg: 'bg-[#FFB347]/20 text-[#FFD166] border-[#FFB347]/30' },
    discovered: { icon: <Zap className="h-3.5 w-3.5" />, bg: 'bg-[#2EC4B6]/20 text-[#4EECD6] border-[#2EC4B6]/30' },
  }
  const { icon, bg } = map[type]
  return <div className={cn('h-7 w-7 rounded-full flex items-center justify-center shrink-0 border', bg)}>{icon}</div>
}

// ============================================================
// Custom chart colors
// ============================================================
const SCORE_COLORS = ['#52B788', '#FFB347', '#40916C']
const FOREST_ACCENT = '#52B788'

// ============================================================
// Dashboard Page
// ============================================================
export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [streamIdx, setStreamIdx] = useState(0)

  useEffect(() => {
    getDashboardStats().then((s) => {
      setStats(s)
      setActivity(s.recentActivity)
      setLoading(false)
    })
  }, [])

  // Stream new activity items every 4s (capped after streaming all items)
  useEffect(() => {
    if (!stats) return
    if (streamIdx >= streamingActivityEvents.length) return
    const t = setTimeout(() => {
      const newEvent = { ...streamingActivityEvents[streamIdx], timestamp: new Date().toISOString(), id: `stream-${streamIdx}` }
      setActivity((prev) => [newEvent, ...prev].slice(0, 12))
      setStreamIdx((i) => i + 1)
    }, 4000 + streamIdx * 500)
    return () => clearTimeout(t)
  }, [stats, streamIdx])

  if (loading) return <DashboardSkeleton />

  const s = stats!
  const statCards = [
    {
      label: 'Total Leads Discovered',
      value: s.totalLeads,
      trend: 18,
      sparkline: [3, 5, 4, 7, 6, 9, 8, 11, 9, 13, 11, 15, 12, 14],
      icon: <Users className="h-5 w-5 text-white" />,
      accent: 'bg-gradient-to-br from-[#40916C] to-[#2D6A4F]',
    },
    {
      label: 'Qualified Leads',
      value: s.qualifiedLeads,
      trend: 12,
      sparkline: [1, 2, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 8],
      icon: <Star className="h-5 w-5 text-white" />,
      accent: 'bg-gradient-to-br from-[#52B788] to-[#40916C]',
    },
    {
      label: 'Outreach Sent',
      value: s.outreachSent,
      trend: -3,
      sparkline: [2, 3, 2, 4, 3, 4, 3, 5, 4, 4, 3, 5, 4, 3],
      icon: <Send className="h-5 w-5 text-white" />,
      accent: 'bg-gradient-to-br from-[#FFB347] to-[#D48A1D]',
    },
    {
      label: 'Conversion Rate',
      value: `${s.conversionRate}%`,
      trend: 2.1,
      sparkline: [4, 5, 4, 6, 5, 7, 6, 8, 7, 7, 8, 9, 8, 9],
      icon: <BarChart2 className="h-5 w-5 text-white" />,
      accent: 'bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl relative overflow-hidden min-h-screen text-[#e2f0e2]" style={{
      background: 'linear-gradient(135deg, #0D2B1F 0%, #1A4A32 50%, #2D6A4F 100%)',
      fontFamily: "'Nunito', sans-serif"
    }}>
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[10%] right-[10%] w-24 h-24 opacity-5 pointer-events-none animate-[spin_10s_linear_infinite]">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" stroke="#FFB347" strokeWidth="15" />
        </svg>
      </div>
      <div className="absolute bottom-[20%] left-[5%] w-28 h-28 opacity-5 pointer-events-none animate-[bounce_6s_ease-in-out_infinite]">
        <svg viewBox="0 0 100 100" fill="none">
          <rect x="20" y="20" width="60" height="60" rx="20" fill="#2EC4B6" />
        </svg>
      </div>

      <style>{`
        .clay-card-dark {
          background: rgba(240, 255, 244, 0.06);
          border: 3px solid #2D6A4F;
          border-radius: 28px;
          box-shadow: inset 4px 4px 10px rgba(255, 255, 255, 0.05),
                      inset -4px -4px 10px rgba(0, 0, 0, 0.4),
                      0 15px 30px rgba(13, 43, 31, 0.45);
          backdrop-filter: blur(12px);
        }
        .clay-card-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #ffffff;
        }
      `}</style>

      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Overview</h1>
          <p className="text-sm text-[#74C69D] mt-0.5 font-bold">
            Real-time pipeline intelligence for your agency
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 px-4 py-2 border-2 border-[#2D6A4F] rounded-full text-xs font-bold shadow-md">
          <span className="h-2.5 w-2.5 rounded-full bg-[#52B788] animate-pulse"></span>
          Live Sync Active
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.08} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leads over time - takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="lg:col-span-2 clay-card-dark p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-[#52B788]" />
            <h2 className="clay-card-title">Lead Discovery — Last 14 Days</h2>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={s.leadsPerDay} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={FOREST_ACCENT} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={FOREST_ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A4A32" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#74C69D', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#74C69D', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0D2B1F', border: '2px solid #2D6A4F', borderRadius: 16, fontSize: 12, color: '#e2f0e2' }} />
                <Area type="monotone" dataKey="count" stroke={FOREST_ACCENT} strokeWidth={3} fill="url(#leadsGradient)" dot={{ r: 4, stroke: '#1A4A32', strokeWidth: 2, fill: FOREST_ACCENT }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Score distribution - 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.3 }}
          className="clay-card-dark p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#FFB347]" />
            <h2 className="clay-card-title">Score Distribution</h2>
          </div>
          <div className="w-full flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={s.scoreBandData}
                  dataKey="count"
                  nameKey="band"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {s.scoreBandData.map((_, i) => (
                    <Cell key={i} fill={SCORE_COLORS[i]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#e2f0e2', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ background: '#0D2B1F', border: '2px solid #2D6A4F', borderRadius: 16, fontSize: 12, color: '#e2f0e2' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Funnel + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Conversion funnel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="lg:col-span-2 clay-card-dark p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ArrowUpRight className="h-5 w-5 text-[#52B788]" />
            <h2 className="clay-card-title">Conversion Funnel</h2>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={s.funnelData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1A4A32" opacity={0.6} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#74C69D', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: '#e2f0e2', fontWeight: 'bold' }} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#0D2B1F', border: '2px solid #2D6A4F', borderRadius: 16, fontSize: 12, color: '#e2f0e2' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={28}>
                  {s.funnelData.map((_, i) => (
                    <Cell key={i} fill={['#8b5cf6', '#52B788', '#FFB347', '#2EC4B6'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.3 }}
          className="clay-card-dark p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-[#52B788]" />
            <h2 className="clay-card-title">Recent Activity</h2>
          </div>
          <div className="flex-1 max-h-[250px] overflow-y-auto space-y-0 pr-1">
            <AnimatePresence initial={false}>
              {activity.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3 py-3 border-b border-[#2D6A4F]/30 last:border-0"
                >
                  <ActivityIcon type={event.type} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{event.leadName}</p>
                    <p className="text-xs text-[#74C69D] leading-tight mt-0.5">{event.detail}</p>
                    <p className="text-[10px] text-emerald-300/60 mt-1 font-semibold">{formatRelativeTime(event.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================
// Skeleton Loading State
// ============================================================
function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-7xl min-h-screen text-[#e2f0e2]" style={{
      background: 'linear-gradient(135deg, #0D2B1F 0%, #1A4A32 50%, #2D6A4F 100%)',
    }}>
      <div className="space-y-1">
        <Skeleton className="h-7 w-32 bg-emerald-950/40" />
        <Skeleton className="h-4 w-64 bg-emerald-950/40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-emerald-950/20 border-3 border-[#2D6A4F] rounded-[28px] p-6 h-40">
            <Skeleton className="h-10 w-10 rounded-xl mb-3 bg-emerald-900/40" />
            <Skeleton className="h-3.5 w-24 mb-2 bg-emerald-900/40" />
            <Skeleton className="h-8 w-16 mb-2 bg-emerald-900/40" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-emerald-950/20 border-3 border-[#2D6A4F] rounded-[28px] p-6 h-[260px]"><Skeleton className="h-full w-full bg-emerald-900/40" /></div>
        <div className="bg-emerald-950/20 border-3 border-[#2D6A4F] rounded-[28px] p-6 h-[260px]"><Skeleton className="h-full w-full bg-emerald-900/40" /></div>
      </div>
    </div>
  )
}

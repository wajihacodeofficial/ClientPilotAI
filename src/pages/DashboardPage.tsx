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
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="2.5" fill={color} />
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="p-5 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', accent)}>
            {icon}
          </div>
          <Sparkline data={sparkline} color={trend >= 0 ? '#10b981' : '#f59e0b'} />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">{value}</p>
          <div className="flex items-center gap-1">
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-amber-600')}>
              {trend >= 0 ? '+' : ''}{trend}% vs last week
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================
// Activity event icons
// ============================================================
function ActivityIcon({ type }: { type: ActivityEvent['type'] }) {
  const map = {
    scored: { icon: <Star className="h-3.5 w-3.5" />, bg: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' },
    outreach_sent: { icon: <Send className="h-3.5 w-3.5" />, bg: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' },
    stage_changed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, bg: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' },
    discovered: { icon: <Zap className="h-3.5 w-3.5" />, bg: 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400' },
  }
  const { icon, bg } = map[type]
  return <div className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0', bg)}>{icon}</div>
}

// ============================================================
// Custom chart colors
// ============================================================
const SCORE_COLORS = ['#10b981', '#f59e0b', '#a1a1aa']
const INDIGO = '#6366f1'

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
      icon: <Users className="h-4.5 w-4.5 text-indigo-600" />,
      accent: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      label: 'Qualified Leads',
      value: s.qualifiedLeads,
      trend: 12,
      sparkline: [1, 2, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 8],
      icon: <Star className="h-4.5 w-4.5 text-emerald-600" />,
      accent: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Outreach Sent',
      value: s.outreachSent,
      trend: -3,
      sparkline: [2, 3, 2, 4, 3, 4, 3, 5, 4, 4, 3, 5, 4, 3],
      icon: <Send className="h-4.5 w-4.5 text-amber-600" />,
      accent: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Conversion Rate',
      value: `${s.conversionRate}%`,
      trend: 2.1,
      sparkline: [4, 5, 4, 6, 5, 7, 6, 8, 7, 7, 8, 9, 8, 9],
      icon: <BarChart2 className="h-4.5 w-4.5 text-violet-600" />,
      accent: 'bg-violet-50 dark:bg-violet-950',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Real-time pipeline intelligence for your agency
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.08} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leads over time - takes 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Lead Discovery — Last 14 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={s.leadsPerDay} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={INDIGO} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={INDIGO} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke={INDIGO} strokeWidth={2} fill="url(#leadsGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Score distribution - 1 col */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={s.scoreBandData}
                    dataKey="count"
                    nameKey="band"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {s.scoreBandData.map((_, i) => (
                      <Cell key={i} fill={SCORE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Funnel + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversion funnel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={s.funnelData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} width={72} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {s.funnelData.map((_, i) => (
                      <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[260px] overflow-y-auto space-y-0">
              <AnimatePresence initial={false}>
                {activity.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-2.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <ActivityIcon type={event.type} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{event.leadName}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{event.detail}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
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
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="space-y-1">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-9 w-9 rounded-lg mb-3" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5"><Skeleton className="h-[200px] w-full" /></Card>
        <Card className="p-5"><Skeleton className="h-[200px] w-full" /></Card>
      </div>
    </div>
  )
}

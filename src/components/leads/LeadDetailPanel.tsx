import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MapPin, Phone, Globe, ExternalLink, Sparkles, RefreshCw,
  Send, Save, CheckCircle2, ChevronRight,
} from 'lucide-react'
import {
  Button, Badge, Sheet, Skeleton, Separator, Textarea, Progress,
} from '@/components/ui'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { generateOutreach, sendOutreach, saveDraft, updateLeadStage } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import { mockLeads } from '@/data/mockLeads'
import type { Lead, OutreachMessage, PipelineStage } from '@/types'
import { cn, getCategoryLabel, getScoreColor, getPipelineLabel } from '@/lib/utils'

// ============================================================
// Stage stepper
// ============================================================
const STAGES: PipelineStage[] = ['discovery', 'qualified', 'contacted', 'client']

function StageStepper({ current, onAdvance }: { current: PipelineStage; onAdvance: (s: PipelineStage) => void }) {
  const currentIdx = STAGES.indexOf(current)
  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={stage} className="flex items-center flex-1">
            <button
              onClick={() => onAdvance(stage)}
              className="flex flex-col items-center gap-1 flex-1 group"
            >
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                className={cn(
                  'stage-dot text-xs',
                  done && 'completed',
                  active && 'active'
                )}
              >
                {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </motion.div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                active ? 'text-indigo-600 dark:text-indigo-400' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
              )}>
                {getPipelineLabel(stage)}
              </span>
            </button>
            {i < STAGES.length - 1 && (
              <div className={cn('stage-connector', done ? 'filled' : '')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================
// Score Breakdown Radar + Bars
// ============================================================
function ScoreBreakdownSection({ lead }: { lead: Lead }) {
  const radarData = [
    { subject: 'Digital Gap', value: lead.scoreBreakdown.digitalPresenceGap * 10 },
    { subject: 'Category Fit', value: lead.scoreBreakdown.categoryFit * 10 },
    { subject: 'Reviews', value: lead.scoreBreakdown.reviewActivity * 10 },
    { subject: 'Market', value: lead.scoreBreakdown.marketDensity * 10 },
    { subject: 'Competition', value: lead.scoreBreakdown.competitorPresence * 10 },
  ]

  const barItems = [
    { label: 'Digital Presence Gap', value: lead.scoreBreakdown.digitalPresenceGap, max: 10 },
    { label: 'Category Fit', value: lead.scoreBreakdown.categoryFit, max: 10 },
    { label: 'Review Activity', value: lead.scoreBreakdown.reviewActivity, max: 10 },
    { label: 'Market Density', value: lead.scoreBreakdown.marketDensity, max: 10 },
    { label: 'Competitor Presence', value: lead.scoreBreakdown.competitorPresence, max: 10 },
  ]

  return (
    <div>
      {/* Score gauge */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={lead.score >= 80 ? '#10b981' : lead.score >= 50 ? '#f59e0b' : '#a1a1aa'}
              strokeWidth="5"
              strokeDasharray={`${(lead.score / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
              strokeLinecap="round"
            />
          </svg>
          <span className={cn('absolute inset-0 flex items-center justify-center text-xl font-bold font-mono', getScoreColor(lead.score))}>
            {lead.score}
          </span>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Lead Score</p>
          <p className={cn('text-lg font-semibold', getScoreColor(lead.score))}>
            {lead.score >= 80 ? 'High Priority' : lead.score >= 50 ? 'Medium Priority' : 'Low Priority'}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">ID: {lead.id}</p>
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="space-y-2.5">
        {barItems.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{item.value}/{item.max}</span>
            </div>
            <Progress value={(item.value / item.max) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// AI Analysis Section
// ============================================================
function AIAnalysisSection({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">AI Analysis</span>
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{text}</p>
    </div>
  )
}

// ============================================================
// Outreach Section
// ============================================================
function OutreachSection({ lead }: { lead: Lead }) {
  const updateLeadOutreachStore = useAppStore((s) => s.updateLeadOutreach)
  const [currentMsg, setCurrentMsg] = useState<OutreachMessage>(lead.outreachMessages[0])
  const [editedBody, setEditedBody] = useState(currentMsg.body)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    const msg = await generateOutreach(lead.id)
    setCurrentMsg(msg)
    setEditedBody(msg.body)
    setIsRegenerating(false)
  }

  const handleSend = async () => {
    setIsSending(true)
    await sendOutreach(lead.id, { ...currentMsg, body: editedBody })
    setIsSending(false)
    setSentSuccess(true)
    setTimeout(() => setSentSuccess(false), 3000)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await saveDraft(lead.id, { ...currentMsg, body: editedBody })
    setIsSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Outreach Message</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegenerate}
          isLoading={isRegenerating}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          Regenerate with AI
        </Button>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-zinc-400 mb-1">Subject</p>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 rounded-md px-3 py-2">
            {currentMsg.subject}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">Message body (editable)</p>
          <Textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            rows={8}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSend} isLoading={isSending} size="sm" className="gap-1.5 flex-1">
          {sentSuccess ? (
            <><CheckCircle2 className="h-4 w-4" /> Sent!</>
          ) : (
            <><Send className="h-4 w-4" /> Approve & Send</>
          )}
        </Button>
        <Button onClick={handleSaveDraft} isLoading={isSaving} variant="outline" size="sm" className="gap-1.5">
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Lead Detail Panel
// ============================================================
export function LeadDetailPanel() {
  const selectedLeadId = useAppStore((s) => s.selectedLeadId)
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  const updateLeadStageStore = useAppStore((s) => s.updateLeadStage)

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)
  const [stageChanging, setStageChanging] = useState(false)

  useEffect(() => {
    if (!selectedLeadId) { setLead(null); return }
    setLoading(true)
    // Find lead from mock data directly
    const found = mockLeads.find((l) => l.id === selectedLeadId) ?? null
    setTimeout(() => { setLead(found); setLoading(false) }, 400)
  }, [selectedLeadId])

  const handleStageChange = async (stage: PipelineStage) => {
    if (!lead) return
    setStageChanging(true)
    await updateLeadStage(lead.id, stage)
    updateLeadStageStore(lead.id, stage)
    setLead((prev) => prev ? { ...prev, pipelineStage: stage } : prev)
    setStageChanging(false)
  }

  const CAT_EMOJI: Record<string, string> = {
    restaurant: '🍽️', retail: '🛍️', salon: '💇', clinic: '🏥',
    auto_service: '🔧', bakery: '🥐', pharmacy: '💊', tailor: '🧵',
    cafe: '☕', gym: '💪', electronics: '🔌', jewellery: '💍',
    real_estate: '🏠', catering: '🍱',
  }

  return (
    <Sheet open={!!selectedLeadId} onClose={() => setSelectedLeadId(null)} width="w-[540px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-start justify-between">
        {loading || !lead ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
              {CAT_EMOJI[lead.category] ?? '🏪'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{getCategoryLabel(lead.category)} · {lead.city}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSelectedLeadId(null)}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors shrink-0 ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}

        {!loading && lead && (
          <>
            {/* Contact info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>{lead.address}, {lead.city}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="font-mono">{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                <Badge variant={lead.websiteStatus === 'none' ? 'warning' : 'secondary'}>
                  {lead.websiteStatus === 'none' ? 'No website detected' : lead.websiteStatus === 'outdated' ? 'Outdated site' : 'Has website'}
                </Badge>
                {lead.websiteUrl && (
                  <a href="#" className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">
                    {lead.websiteUrl} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <Separator />

            {/* Pipeline stage */}
            <div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-3">Pipeline Stage</p>
              <StageStepper current={lead.pipelineStage} onAdvance={handleStageChange} />
            </div>

            <Separator />

            {/* Score Breakdown */}
            <div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-3">Score Breakdown</p>
              <ScoreBreakdownSection lead={lead} />
            </div>

            <Separator />

            {/* AI Analysis */}
            <AIAnalysisSection text={lead.aiAnalysis} />

            <Separator />

            {/* Outreach */}
            <OutreachSection lead={lead} />
          </>
        )}
      </div>
    </Sheet>
  )
}

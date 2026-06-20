import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  X, MapPin, Phone, Globe, ExternalLink, Sparkles, RefreshCw,
  Send, Save, CheckCircle2,
} from 'lucide-react'
import {
  Button, Badge, Sheet, Skeleton, Separator, Textarea, Progress,
} from '@/components/ui'
import { generateOutreach, sendOutreach, saveDraft, updateLeadStage, generateProposalApi, saveProposalApi, scoreLeadApi } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
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
function ScoreBreakdownSection({ lead, isScoring }: { lead: Lead; isScoring: boolean }) {

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
            {isScoring ? (
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="#818cf8"
                strokeWidth="5"
                strokeDasharray={`${0.3 * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                strokeLinecap="round"
                className="animate-spin origin-center"
                style={{ animationDuration: '1.8s' }}
              />
            ) : (
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={lead.score >= 80 ? '#10b981' : lead.score >= 50 ? '#f59e0b' : '#a1a1aa'}
                strokeWidth="5"
                strokeDasharray={`${(lead.score / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                strokeLinecap="round"
              />
            )}
          </svg>
          {isScoring ? (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-indigo-400 text-center leading-tight">AI...</span>
          ) : (
            <span className={cn('absolute inset-0 flex items-center justify-center text-xl font-bold font-mono', getScoreColor(lead.score))}>
              {lead.score}
            </span>
          )}
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Lead Score</p>
          {isScoring ? (
            <p className="text-sm font-medium text-indigo-500 animate-pulse">Analyzing business…</p>
          ) : (
            <p className={cn('text-lg font-semibold', getScoreColor(lead.score))}>
              {lead.score >= 80 ? 'High Priority' : lead.score >= 50 ? 'Medium Priority' : 'Low Priority'}
            </p>
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">ID: {lead.id}</p>
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="space-y-2.5">
        {barItems.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
              {isScoring ? (
                <span className="font-mono font-medium text-indigo-400 animate-pulse">…</span>
              ) : (
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{item.value}/{item.max}</span>
              )}
            </div>
            <Progress value={isScoring ? 0 : (item.value / item.max) * 100} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// AI Analysis Section
// ============================================================
function AIAnalysisSection({ text, isScoring }: { text: string; isScoring: boolean }) {
  return (
    <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className={cn('h-4 w-4 text-indigo-500', isScoring && 'animate-pulse')} />
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">AI Analysis</span>
        {isScoring && (
          <span className="ml-auto text-xs text-indigo-400 animate-pulse font-medium">Gemini is thinking…</span>
        )}
      </div>
      {isScoring ? (
        <div className="space-y-2">
          <div className="h-3 rounded bg-indigo-200 dark:bg-indigo-800 animate-pulse w-full" />
          <div className="h-3 rounded bg-indigo-200 dark:bg-indigo-800 animate-pulse w-5/6" />
          <div className="h-3 rounded bg-indigo-200 dark:bg-indigo-800 animate-pulse w-4/6" />
        </div>
      ) : (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{text}</p>
      )}
    </div>
  )
}

// ============================================================
// Outreach Section
// ============================================================
function OutreachSection({ lead }: { lead: Lead }) {
  const updateLeadOutreachStore = useAppStore((s) => s.updateLeadOutreach)
  
  const defaultMsg: OutreachMessage = useMemo(() => ({
    id: 'default',
    subject: `Digital Transformation for ${lead.name}`,
    body: 'No message generated yet. Click "Regenerate with AI" to create one.',
    status: 'draft',
    createdAt: new Date().toISOString()
  }), [lead.name])

  const [currentMsg, setCurrentMsg] = useState<OutreachMessage>(
    lead.outreachMessages?.[0] || defaultMsg
  )
  const [editedBody, setEditedBody] = useState(currentMsg.body)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const msg = await generateOutreach(lead.id)
      setCurrentMsg(msg)
      setEditedBody(msg.body)
      updateLeadOutreachStore(lead.id, msg)
    } catch (e) {
      console.error(e)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSend = async () => {
    setIsSending(true)
    try {
      const updatedMsg = { ...currentMsg, body: editedBody, status: 'sent' as const }
      await sendOutreach(lead.id, updatedMsg)
      updateLeadOutreachStore(lead.id, updatedMsg)
      setCurrentMsg(updatedMsg)
      setSentSuccess(true)
      setTimeout(() => setSentSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      const updatedMsg = { ...currentMsg, body: editedBody, status: 'draft' as const }
      await saveDraft(lead.id, updatedMsg)
      updateLeadOutreachStore(lead.id, updatedMsg)
      setCurrentMsg(updatedMsg)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
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
// Proposal Section
// ============================================================
function ProposalSection({ lead }: { lead: Lead }) {
  const addProposal = useAppStore((s) => s.addProposal)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalContent, setProposalContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateProposalApi(lead.id)
      setProposalTitle(result.title)
      setProposalContent(result.content)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!proposalTitle || !proposalContent) return
    setIsSaving(true)
    try {
      const saved = await saveProposalApi({
        leadId: lead.id,
        title: proposalTitle,
        content: proposalContent,
        status: 'draft',
      })
      addProposal(saved)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">AI Proposal</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerate}
          isLoading={isGenerating}
          className="h-7 text-xs gap-1.5 text-indigo-600 hover:text-indigo-700"
        >
          <Sparkles className="h-3 w-3" />
          {proposalContent ? 'Regenerate' : 'Generate Proposal'}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 rounded-md px-3 py-2">{error}</p>
      )}

      {proposalContent ? (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-zinc-400 mb-1">Title</p>
            <input
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              className="w-full text-sm font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Content (Markdown)</p>
            <Textarea
              value={proposalContent}
              onChange={(e) => setProposalContent(e.target.value)}
              rows={10}
              className="text-xs font-mono"
            />
          </div>
          <Button onClick={handleSave} isLoading={isSaving} size="sm" className="w-full gap-1.5">
            {savedOk ? (
              <><CheckCircle2 className="h-4 w-4" /> Saved to Proposals!</>
            ) : (
              <><Save className="h-4 w-4" /> Save Proposal (Draft)</>
            )}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 px-4 py-6 text-center">
          <Sparkles className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Click "Generate Proposal" to create a customized AI-written business proposal for this lead.
          </p>
        </div>
      )}
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
  const leads = useAppStore((s) => s.leads)
  const discoveryResults = useAppStore((s) => s.discoveryResults)
  const updateLeadScoreStore = useAppStore((s) => s.updateLeadScore)

  // Search in both the main leads list AND discovery results
  const lead = useMemo(
    () =>
      leads.find((l) => l.id === selectedLeadId) ??
      discoveryResults.find((l) => l.id === selectedLeadId) ??
      null,
    [leads, discoveryResults, selectedLeadId]
  )

  // Auto-trigger AI scoring when the lead has no score yet
  const [isScoring, setIsScoring] = useState(false)
  const scoredLeadRef = useRef<string | null>(null) // track which lead we already scored

  useEffect(() => {
    // Only score if: lead is loaded, score is 0, and we haven't already started scoring for this lead
    if (!lead || lead.score > 0 || scoredLeadRef.current === lead.id) return

    scoredLeadRef.current = lead.id
    setIsScoring(true)

    scoreLeadApi(lead.id)
      .then((scoreData) => {
        if (scoreData) {
          // Backend returned the score row directly – update store immediately
          updateLeadScoreStore(lead.id, scoreData)
        }
        // The Supabase realtime subscription will also fire and update the store,
        // which will cause lead.score to become > 0 and re-render.
      })
      .catch(console.error)
      .finally(() => setIsScoring(false))
  }, [lead?.id, lead?.score]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset scored ref when panel closes
  useEffect(() => {
    if (!selectedLeadId) scoredLeadRef.current = null
  }, [selectedLeadId])

  const handleStageChange = async (stage: PipelineStage) => {
    if (!lead) return
    await updateLeadStage(lead.id, stage)
    updateLeadStageStore(lead.id, stage)
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
        {!lead ? (
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
        {!lead ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
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
              <ScoreBreakdownSection lead={lead} isScoring={isScoring} />
            </div>

            <Separator />

            {/* AI Analysis */}
            <AIAnalysisSection text={lead.aiAnalysis} isScoring={isScoring} />

            <Separator />

            {/* Outreach */}
            <OutreachSection key={lead.id} lead={lead} />

            <Separator />

            {/* Proposal */}
            <ProposalSection key={`prop-${lead.id}`} lead={lead} />
          </>
        )}
      </div>
    </Sheet>
  )
}

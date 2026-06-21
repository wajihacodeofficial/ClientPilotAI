import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MapPin, Phone, Globe, ExternalLink, Sparkles, RefreshCw,
  Send, Save, CheckCircle2, Store, Mail, AlertCircle, Copy, Check,
  ChevronDown, Loader2, Edit2, AtSign,
} from 'lucide-react'
import { CAT_ICON } from '@/lib/icons'
import {
  Button, Badge, Sheet, Skeleton, Separator, Textarea, Progress,
} from '@/components/ui'
import {
  prepareLead, sendOutreach, saveDraft,
  updateLeadStage, saveProposalApi, updateProposalStatusApi,
} from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import type { Lead, OutreachMessage, PipelineStage, Proposal } from '@/types'
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
            <motion.circle
              cx="40" cy="40" r="34" fill="none"
              stroke={getScoreColor(lead.score)}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
              animate={{ strokeDashoffset: (1 - lead.score / 100) * 2 * Math.PI * 34 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isScoring ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <span className="text-base font-bold" style={{ color: getScoreColor(lead.score) }}>
                {lead.score}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {isScoring ? (
            <div className="space-y-1.5">
              {[80, 65, 72].map((w, i) => (
                <div key={i} className="h-2 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {barItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-zinc-500">{item.label}</span>
                    <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">{item.value}/{item.max}</span>
                  </div>
                  <Progress value={(item.value / item.max) * 100} className="h-1" />
                </div>
              ))}
            </div>
          )}
        </div>
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
// Contact Info Section — shows enriched contact data
// ============================================================
function ContactInfoSection({
  lead,
  onEmailChange,
}: {
  lead: Lead
  onEmailChange: (email: string) => void
}) {
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailDraft, setEmailDraft] = useState(lead.contactEmail ?? '')
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleEmailSave = () => {
    onEmailChange(emailDraft)
    setEditingEmail(false)
  }

  // Confidence display
  const confidenceLabel = () => {
    const src = lead.contactSource
    if (!src || src === 'none') return null
    if (src === 'osm_tag') return { text: 'From map data', color: 'text-emerald-600 dark:text-emerald-400' }
    if (src === 'website_homepage') return { text: 'Scraped from homepage', color: 'text-blue-600 dark:text-blue-400' }
    if (src === 'website_contact_page') return { text: 'Scraped from contact page', color: 'text-blue-600 dark:text-blue-400' }
    if (src === 'manual') return { text: 'Manually entered', color: 'text-zinc-500' }
    return null
  }
  const confLabel = confidenceLabel()

  return (
    <div className="space-y-2">
      {/* Email row */}
      <div className="flex items-start gap-2">
        <AtSign className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {lead.isPreparing ? (
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded w-40" />
          ) : lead.contactEmail ? (
            editingEmail ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className="text-sm bg-white dark:bg-zinc-800 border border-indigo-400 rounded px-2 py-0.5 w-full text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSave()}
                />
                <button onClick={handleEmailSave} className="text-emerald-500 hover:text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setEditingEmail(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <a href={`mailto:${lead.contactEmail}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-mono truncate">
                  {lead.contactEmail}
                </a>
                <button
                  onClick={() => handleCopy(lead.contactEmail!)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600"
                  title="Copy email"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => { setEmailDraft(lead.contactEmail ?? ''); setEditingEmail(true) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600"
                  title="Edit email"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )
          ) : (
            editingEmail ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  placeholder="Enter email manually..."
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className="text-sm bg-white dark:bg-zinc-800 border border-indigo-400 rounded px-2 py-0.5 w-full text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSave()}
                />
                <button onClick={handleEmailSave} className="text-emerald-500 hover:text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setEditingEmail(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingEmail(true)}
                className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 hover:text-indigo-500 transition-colors"
              >
                <Mail className="h-3 w-3" />
                Email not found — add manually
              </button>
            )
          )}
          {confLabel && !editingEmail && (
            <span className={cn('text-[10px]', confLabel.color)}>
              {confLabel.text}
              {lead.contactConfidence !== undefined && lead.contactConfidence > 0 &&
                ` · ${Math.round(lead.contactConfidence * 100)}% confidence`
              }
            </span>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
        <span>{lead.address}, {lead.city}</span>
      </div>

      {/* Phone */}
      {(lead.phone || lead.contactPhone) && (
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
          <span className="font-mono">{lead.contactPhone || lead.phone}</span>
        </div>
      )}

      {/* Website */}
      <div className="flex items-center gap-2 text-sm">
        <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
        <Badge variant={lead.websiteStatus === 'none' ? 'warning' : 'secondary'}>
          {lead.websiteStatus === 'none' ? 'No website detected' : lead.websiteStatus === 'outdated' ? 'Outdated site' : 'Has website'}
        </Badge>
        {(lead.websiteUrl || lead.website) && (
          <a
            href={lead.websiteUrl || lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5 truncate max-w-[180px]"
          >
            {lead.websiteUrl || lead.website} <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Preparation loading overlay — shown while /prepare runs
// ============================================================
function PreparationBanner({ lead }: { lead: Lead }) {
  const steps = [
    { label: 'Enriching contact info…' },
    { label: 'Generating outreach message…' },
    { label: 'Drafting AI proposal…' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
          AI Agent preparing outreach for {lead.name}…
        </span>
      </div>
      <div className="space-y-1.5 pl-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-400">
            <Loader2 className="h-3 w-3 animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
            {step.label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================
// AI-Powered Outreach Section
// ============================================================
function OutreachSection({ lead }: { lead: Lead }) {
  const updateLeadStore = useAppStore((s) => s.updateLead)
  const updateLeadOutreachStore = useAppStore((s) => s.updateLeadOutreach)

  // Use the AI-generated fields first, fall back to outreachMessages[0]
  const firstMsg = lead.outreachMessages?.[0]
  const [subject, setSubject] = useState(lead.outreachSubject ?? firstMsg?.subject ?? '')
  const [body, setBody] = useState(lead.outreachBody ?? firstMsg?.body ?? '')
  const [recipientEmail, setRecipientEmail] = useState(lead.contactEmail ?? '')

  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When lead data updates (after prepare completes), refresh local state
  useEffect(() => {
    if (lead.outreachSubject && lead.outreachSubject !== subject) {
      setSubject(lead.outreachSubject)
    }
    if (lead.outreachBody && lead.outreachBody !== body) {
      setBody(lead.outreachBody)
    }
    if (lead.contactEmail && !recipientEmail) {
      setRecipientEmail(lead.contactEmail)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.outreachSubject, lead.outreachBody, lead.contactEmail])

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setError(null)
    try {
      const result = await prepareLead(lead.id, true)
      if (result.lead.outreachSubject) setSubject(result.lead.outreachSubject)
      if (result.lead.outreachBody) setBody(result.lead.outreachBody)
      updateLeadStore(lead.id, result.lead)
      // Also push into outreach messages list for legacy dashboard compatibility
      if (result.lead.outreachSubject && result.lead.outreachBody) {
        updateLeadOutreachStore(lead.id, {
          subject: result.lead.outreachSubject,
          body: result.lead.outreachBody,
          status: 'draft',
          generatedAt: new Date().toISOString(),
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regeneration failed')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSend = async () => {
    if (!body.trim()) return
    setIsSending(true)
    setError(null)
    try {
      const msg: OutreachMessage = { subject, body, status: 'sent' }
      await sendOutreach(lead.id, msg, recipientEmail)
      updateLeadStore(lead.id, { outreachStatus: 'sent', outreachSentAt: new Date().toISOString() })
      updateLeadOutreachStore(lead.id, { ...msg })
      setSentSuccess(true)
      setTimeout(() => setSentSuccess(false), 3500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await saveDraft(lead.id, { subject, body })
      updateLeadStore(lead.id, { outreachSubject: subject, outreachBody: body, outreachStatus: 'draft' })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const isPreparing = !!lead.isPreparing
  const hasContent = !!(subject || body)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">Outreach Message</p>
          {lead.outreachStatus === 'sent' && (
            <Badge variant="success" className="text-[10px] py-0 px-1.5">Sent</Badge>
          )}
          {lead.outreachGeneratedAt && lead.outreachStatus !== 'sent' && (
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">AI Draft</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegenerate}
          disabled={isPreparing}
          isLoading={isRegenerating}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          {hasContent ? 'Regenerate' : 'Generate with AI'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {isPreparing ? (
        <div className="space-y-2">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
          <div className="h-28 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
        </div>
      ) : hasContent ? (
        <div className="space-y-2.5">
          {/* Recipient email */}
          <div>
            <p className="text-xs text-zinc-400 mb-1">Recipient email</p>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md pl-8 pr-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Subject line */}
          <div>
            <p className="text-xs text-zinc-400 mb-1">Subject line</p>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Body */}
          <div>
            <p className="text-xs text-zinc-400 mb-1">Message body (editable)</p>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className="text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              isLoading={isSending}
              disabled={!body.trim() || sentSuccess}
              size="sm"
              className="gap-1.5 flex-1"
            >
              {sentSuccess ? (
                <><CheckCircle2 className="h-4 w-4" /> Sent!</>
              ) : (
                <><Send className="h-4 w-4" /> Approve &amp; Send</>
              )}
            </Button>
            <Button
              onClick={handleSaveDraft}
              isLoading={isSaving}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              {savedSuccess ? (
                <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Saved</>
              ) : (
                <><Save className="h-4 w-4" /> Save Draft</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 px-4 py-6 text-center">
          <Mail className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            AI is preparing a personalised outreach message for {lead.name}…
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// AI Proposal Section
// ============================================================
const STATUSES_LIST: Proposal['status'][] = ['draft', 'submitted', 'reviewed', 'replied', 'accepted', 'rejected']

const STATUS_LABELS: Record<Proposal['status'], string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
  replied: 'Replied',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

function ProposalSection({ lead }: { lead: Lead }) {
  const proposals = useAppStore((s) => s.proposals)
  const addProposal = useAppStore((s) => s.addProposal)
  const updateProposalStatusStore = useAppStore((s) => s.updateProposalStatus)

  const existingProposal = useMemo(() => proposals.find(p => p.leadId === lead.id), [proposals, lead.id])

  // Use auto-generated content first, then fall back to saved proposal
  const [proposalTitle, setProposalTitle] = useState(
    existingProposal?.title || `AI Proposal — ${lead.name}`
  )
  const [proposalContent, setProposalContent] = useState(
    lead.proposalContent || existingProposal?.content || ''
  )

  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When proposal content arrives from /prepare, populate editors
  useEffect(() => {
    if (lead.proposalContent && !proposalContent) {
      setProposalContent(lead.proposalContent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.proposalContent])

  const handleSave = async () => {
    if (!proposalTitle || !proposalContent) return
    setIsSaving(true)
    setError(null)
    try {
      const saved = await saveProposalApi({
        leadId: lead.id,
        title: proposalTitle,
        content: proposalContent,
        status: existingProposal?.status || 'draft',
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

  const handleStatusChange = async (newStatus: Proposal['status']) => {
    if (!existingProposal) return
    updateProposalStatusStore(existingProposal.id, newStatus)
    try {
      await updateProposalStatusApi(existingProposal.id, newStatus)
    } catch (err) {
      console.error('Failed to update proposal status:', err)
      updateProposalStatusStore(existingProposal.id, existingProposal.status)
    }
  }

  const hasContent = !!(proposalContent || existingProposal?.content)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">AI Proposal</p>
          {lead.proposalGeneratedAt && (
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">AI Draft</Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {lead.isPreparing ? (
        <div className="space-y-2">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
          <div className="h-40 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
        </div>
      ) : hasContent ? (
        <div className="space-y-3.5">
          {/* Status workflow dropdown if already saved */}
          {existingProposal && (
            <div className="grid grid-cols-2 gap-3.5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-150 dark:border-zinc-800">
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Current Status</span>
                <span className="mt-1">
                  <Badge variant={
                    existingProposal.status === 'accepted' ? 'success' :
                    existingProposal.status === 'rejected' ? 'outline' :
                    existingProposal.status === 'replied' ? 'warning' :
                    existingProposal.status === 'draft' ? 'secondary' : 'default'
                  } className="capitalize py-0.5 px-2">
                    {existingProposal.status}
                  </Badge>
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Change Workflow Status</label>
                <select
                  value={existingProposal.status}
                  onChange={(e) => handleStatusChange(e.target.value as Proposal['status'])}
                  className="w-full text-xs h-8 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-zinc-800 dark:text-zinc-200"
                >
                  {STATUSES_LIST.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
            <Button onClick={handleSave} isLoading={isSaving} size="sm" className="w-full gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              {savedOk ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved successfully!</>
              ) : existingProposal ? (
                <><Save className="h-4 w-4" /> Save Changes</>
              ) : (
                <><Save className="h-4 w-4" /> Save Proposal (Draft)</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700 px-4 py-6 text-center">
          <Sparkles className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            AI is generating a customised proposal for this lead…
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Lead Detail Panel — main sheet
// ============================================================
export function LeadDetailPanel() {
  const selectedLeadId = useAppStore((s) => s.selectedLeadId)
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  const updateLeadStageStore = useAppStore((s) => s.updateLeadStage)
  const updateLeadStore = useAppStore((s) => s.updateLead)
  const addProposal = useAppStore((s) => s.addProposal)
  const leads = useAppStore((s) => s.leads)
  const discoveryResults = useAppStore((s) => s.discoveryResults)

  // Look up lead from both lists
  const lead = useMemo(
    () =>
      leads.find((l) => l.id === selectedLeadId) ??
      discoveryResults.find((l) => l.id === selectedLeadId) ??
      null,
    [leads, discoveryResults, selectedLeadId]
  )

  // ── Auto-prepare: run /prepare when panel opens for a lead without content ──
  const preparedLeadRef = useRef<string | null>(null)

  useEffect(() => {
    if (!lead || preparedLeadRef.current === lead.id) return

    // Skip if already has both outreach and proposal content
    const alreadyPrepared = !!(lead.outreachBody && lead.proposalContent)
    if (alreadyPrepared) {
      preparedLeadRef.current = lead.id
      return
    }

    preparedLeadRef.current = lead.id

    // Mark as preparing in store so child sections show skeletons
    updateLeadStore(lead.id, { isPreparing: true })

    prepareLead(lead.id)
      .then((result) => {
        updateLeadStore(lead.id, { ...result.lead, isPreparing: false })
        // If a proposal was returned from the backend, persist it via addProposal
        if (result.proposalContent) {
          addProposal({
            id: `ai-${lead.id}`,
            leadId: lead.id,
            title: result.proposalTitle || `AI Proposal — ${lead.name}`,
            content: result.proposalContent,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
        if (result.partialError) {
          console.warn('[Prepare] Partial error:', result.partialError)
        }
      })
      .catch((err) => {
        console.error('[Prepare] Failed:', err)
        updateLeadStore(lead.id, { isPreparing: false, lastError: err instanceof Error ? err.message : 'Preparation failed' })
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id])

  // Reset ref when panel closes
  useEffect(() => {
    if (!selectedLeadId) preparedLeadRef.current = null
  }, [selectedLeadId])

  // Handle manual email entry
  const handleEmailChange = (email: string) => {
    if (!lead) return
    updateLeadStore(lead.id, {
      contactEmail: email,
      contactSource: 'manual',
    })
  }

  const handleStageChange = async (stage: PipelineStage) => {
    if (!lead) return
    await updateLeadStage(lead.id, stage)
    updateLeadStageStore(lead.id, stage)
  }

  return (
    <Sheet open={!!selectedLeadId} onClose={() => setSelectedLeadId(null)} width="w-[560px]">
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
              {(() => { const Icon = CAT_ICON[lead.category] || Store; return <Icon className="h-6 w-6" />; })()}
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
            {/* Preparation banner — shown while /prepare is running */}
            <AnimatePresence>
              {lead.isPreparing && <PreparationBanner lead={lead} />}
            </AnimatePresence>

            {/* Partial error banner */}
            {lead.lastError && !lead.isPreparing && (
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Partial enrichment: {lead.lastError}
              </div>
            )}

            {/* Contact info — enriched */}
            <ContactInfoSection lead={lead} onEmailChange={handleEmailChange} />

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
              <ScoreBreakdownSection lead={lead} isScoring={false} />
            </div>

            <Separator />

            {/* AI Analysis */}
            <AIAnalysisSection text={lead.aiAnalysis} isScoring={false} />

            <Separator />

            {/* Outreach — auto-populated */}
            <OutreachSection key={lead.id} lead={lead} />

            <Separator />

            {/* Proposal — auto-populated */}
            <ProposalSection key={`prop-${lead.id}`} lead={lead} />
          </>
        )}
      </div>
    </Sheet>
  )
}

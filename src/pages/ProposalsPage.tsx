import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  FileText, Calendar, MapPin, Eye, Edit2, Save, Trash2,
  RefreshCw, X, ArrowUpRight, CheckCircle2,
  Utensils, ShoppingBag, Scissors, Activity, Wrench, Pill, Coffee, Monitor, Star, Home, Store
} from 'lucide-react'
import {
  Button, Badge, Input, Textarea, Select, Separator, Sheet, Skeleton
} from '@/components/ui'
import { getProposals, updateProposalStatusApi, deleteProposalApi, saveProposalApi } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import type { Proposal } from '@/types'
import { cn } from '@/lib/utils'

type ProposalStatus = 'draft' | 'submitted' | 'reviewed' | 'replied' | 'accepted' | 'rejected'

const STATUSES: ProposalStatus[] = ['draft', 'submitted', 'reviewed', 'replied', 'accepted', 'rejected']

const STATUS_META: Record<ProposalStatus, {
  label: string;
  color: string;
  dot: string;
  bg: string;
  border: string;
  badge: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'muted';
}> = {
  draft: {
    label: 'Draft',
    color: 'text-zinc-600 dark:text-zinc-400',
    dot: 'bg-zinc-400',
    bg: 'bg-zinc-50 dark:bg-zinc-950/20',
    border: 'border-zinc-200 dark:border-zinc-800',
    badge: 'secondary'
  },
  submitted: {
    label: 'Submitted',
    color: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50/50 dark:bg-blue-950/10',
    border: 'border-blue-100 dark:border-blue-900/50',
    badge: 'default'
  },
  reviewed: {
    label: 'Reviewed',
    color: 'text-indigo-600 dark:text-indigo-400',
    dot: 'bg-indigo-500',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/10',
    border: 'border-indigo-100 dark:border-indigo-900/50',
    badge: 'default'
  },
  replied: {
    label: 'Replied',
    color: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50/50 dark:bg-amber-950/10',
    border: 'border-amber-100 dark:border-amber-900/50',
    badge: 'warning'
  },
  accepted: {
    label: 'Accepted',
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    badge: 'success'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-zinc-500 dark:text-zinc-500',
    dot: 'bg-zinc-500',
    bg: 'bg-zinc-100/50 dark:bg-zinc-950/5',
    border: 'border-zinc-200 dark:border-zinc-900',
    badge: 'outline'
  }
}

const CAT_ICON: Record<string, React.ElementType> = {
  restaurant: Utensils, retail: ShoppingBag, salon: Scissors, clinic: Activity,
  auto_service: Wrench, bakery: Coffee, pharmacy: Pill, tailor: Scissors,
  cafe: Coffee, gym: Activity, electronics: Monitor, jewellery: Star,
  real_estate: Home, catering: Utensils,
}

// ── Markdown Parser Helper ────────────────────────────────────
function parseBold(text: string) {
  const parts = text.split('**')
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold text-zinc-950 dark:text-white">{part}</strong> : part))
}

function renderMarkdown(md: string) {
  if (!md) return null
  return md.split('\n').map((line, i) => {
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-5 mb-2.5 border-b border-zinc-150 dark:border-zinc-800 pb-1">{line.replace('# ', '')}</h1>
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{line.replace('## ', '')}</h2>
    }
    if (line.startsWith('### ')) {
      return <h3 key={i} className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-3.5 mb-1.5">{line.replace('### ', '')}</h3>
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const cleaned = line.substring(2)
      return (
        <ul key={i} className="list-disc pl-5 my-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li>{parseBold(cleaned)}</li>
        </ul>
      )
    }
    if (line.trim() === '') {
      return <div key={i} className="h-2" />
    }
    return <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed my-2">{parseBold(line)}</p>
  })
}

// ── Kanban Card ──────────────────────────────────────────────
interface KanbanCardProps {
  proposal: Proposal
  onSelect: (p: Proposal) => void
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
}

function KanbanCard({ proposal, onSelect, onDragStart }: KanbanCardProps) {
  const formattedDate = useMemo(() => {
    try {
      return new Date(proposal.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }, [proposal.createdAt])

  const meta = STATUS_META[proposal.status]
  const leadName = proposal.leads?.business_name || 'Unknown Business'
  const leadCat = proposal.leads?.category || 'general'
  const LeadIcon = CAT_ICON[leadCat] || Store

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, proposal.id)}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-150 group cursor-grab active:cursor-grabbing"
      onClick={() => onSelect(proposal)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {proposal.title}
          </span>
          <ArrowUpRight className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <LeadIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">{leadName}</span>
        </div>

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <Badge variant={meta.badge} className="text-[9px] px-1.5 py-0 capitalize">
            {proposal.status}
          </Badge>
        </div>
      </div>
    </div>
  )
}

// ── Kanban Column ────────────────────────────────────────────
interface KanbanColumnProps {
  status: ProposalStatus
  proposals: Proposal[]
  onSelect: (p: Proposal) => void
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: ProposalStatus) => void
  isDraggedOver: boolean
}

function KanbanColumn({
  status,
  proposals,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggedOver
}: KanbanColumnProps) {
  const meta = STATUS_META[status]

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      className={cn(
        "flex flex-col min-w-65 max-w-70 flex-1 rounded-xl p-2 transition-colors duration-150",
        isDraggedOver ? "bg-zinc-100/80 dark:bg-zinc-800/40" : "bg-transparent"
      )}
    >
      {/* Column Header */}
      <div className={cn('rounded-lg px-3.5 py-2 mb-3 flex items-center justify-between border', meta.bg, meta.border)}>
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', meta.dot)} />
          <span className={cn('text-xs font-semibold', meta.color)}>
            {meta.label}
          </span>
        </div>
        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400">
          {proposals.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 space-y-2.5 min-h-87.5 overflow-y-auto pb-4">
        {proposals.length === 0 ? (
          <div className="h-20 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center p-3 text-center">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
              No proposals in {meta.label}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {proposals.map((proposal) => (
              <KanbanCard
                key={proposal.id}
                proposal={proposal}
                onSelect={onSelect}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────
export function ProposalsPage() {
  const proposals = useAppStore((s) => s.proposals)
  const setProposals = useAppStore((s) => s.setProposals)
  const updateProposalStatus = useAppStore((s) => s.updateProposalStatus)
  const deleteProposal = useAppStore((s) => s.deleteProposal)
  const addProposal = useAppStore((s) => s.addProposal)

  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [draggedOverCol, setDraggedOverCol] = useState<ProposalStatus | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  // Details sheet states
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editStatus, setEditStatus] = useState<ProposalStatus>('draft')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tab, setTab] = useState<'preview' | 'edit'>('preview')

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProposals()
      setProposals(data)
    } catch (e) {
      console.error('Failed to load proposals:', e)
    } finally {
      setLoading(false)
    }
  }, [setProposals])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await getProposals()
        if (active) {
          setProposals(data)
        }
      } catch (e) {
        console.error('Failed to load proposals:', e)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [setProposals])

  // Click handler to select proposal and initialize state
  const handleSelectProposal = (p: Proposal) => {
    setSelectedProposal(p)
    setEditTitle(p.title)
    setEditContent(p.content)
    setEditStatus(p.status)
    setTab('preview')
  }

  // Drag handlers
  const handleDragStart = (_e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProposalStatus) => {
    e.preventDefault()
    if (draggedOverCol !== status) {
      setDraggedOverCol(status)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: ProposalStatus) => {
    e.preventDefault()
    setDraggedOverCol(null)
    if (!draggedId) return

    const proposal = proposals.find((p) => p.id === draggedId)
    if (!proposal || proposal.status === status) return

    // Optimistic UI update
    updateProposalStatus(draggedId, status)
    setDraggedId(null)

    try {
      await updateProposalStatusApi(draggedId, status)
    } catch (err) {
      console.error('Failed to update proposal status on server:', err)
      // Rollback on failure
      updateProposalStatus(draggedId, proposal.status)
    }
  }

  // Handle Save edits
  const handleSaveEdits = async () => {
    if (!selectedProposal) return
    setIsSaving(true)
    try {
      const updated = await saveProposalApi({
        leadId: selectedProposal.leadId,
        title: editTitle,
        content: editContent,
        status: editStatus
      })

      // Add to store
      addProposal(updated)
      
      // Update selected proposal reference
      setSelectedProposal(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      setTab('preview')
    } catch (err) {
      console.error('Failed to save edits:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDeleteProposal = async () => {
    if (!selectedProposal) return
    if (!confirm('Are you sure you want to delete this proposal?')) return
    
    setIsDeleting(true)
    try {
      await deleteProposalApi(selectedProposal.id)
      deleteProposal(selectedProposal.id)
      setSelectedProposal(null)
    } catch (err) {
      console.error('Failed to delete proposal:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const getProposalsByStatus = (status: ProposalStatus) =>
    proposals.filter((p) => p.status === status)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((s) => (
            <div key={s} className="min-w-65 space-y-3 flex-1">
              <Skeleton className="h-10 w-full rounded-lg" />
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Proposals Board
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {proposals.length} proposals total · Drag and drop cards to change statuses
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-1.5 h-8 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto pb-6">
        <div className="flex gap-4 items-start min-h-125">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              proposals={getProposalsByStatus(status)}
              onSelect={handleSelectProposal}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={handleDrop}
              isDraggedOver={draggedOverCol === status}
            />
          ))}
        </div>
      </div>

      {/* Slide-out Sheet for Proposal Details */}
      <Sheet open={!!selectedProposal} onClose={() => setSelectedProposal(null)} width="w-[600px]">
        {selectedProposal && (
          <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
            {/* Sheet Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {selectedProposal.title}
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Lead: {selectedProposal.leads?.business_name || 'Unknown Business'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-red-500"
                  onClick={handleDeleteProposal}
                  isLoading={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sheet Sub-header (Actions & Tabs) */}
            <div className="bg-zinc-50 dark:bg-zinc-950 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab('preview')}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md border transition-colors",
                    tab === 'preview'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  <Eye className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  Preview
                </button>
                <button
                  onClick={() => setTab('edit')}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md border transition-colors",
                    tab === 'edit'
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  <Edit2 className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  Edit Markdown
                </button>
              </div>

              {tab === 'edit' && (
                <Button
                  onClick={handleSaveEdits}
                  isLoading={isSaving}
                  size="sm"
                  className="h-7 text-[11px] gap-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Save className="h-3 w-3" />
                  Save Edits
                </Button>
              )}

              {saveSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                </span>
              )}
            </div>

            {/* Sheet Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Proposal Metadata Form */}
              <div className="grid grid-cols-2 gap-3.5 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-lg border border-zinc-150 dark:border-zinc-800">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Status Stage</label>
                  <Select
                    value={editStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as ProposalStatus
                      setEditStatus(newStatus)
                      if (tab === 'preview') {
                        // Optimistically update and save if in preview mode
                        setSelectedProposal(prev => prev ? { ...prev, status: newStatus } : null)
                        updateProposalStatus(selectedProposal.id, newStatus)
                        updateProposalStatusApi(selectedProposal.id, newStatus).catch(() => {
                          updateProposalStatus(selectedProposal.id, selectedProposal.status)
                        })
                      }
                    }}
                    className="h-8 text-xs mt-1"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_META[status].label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Business Address</label>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2 flex items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{selectedProposal.leads?.address || 'N/A'}, {selectedProposal.leads?.city || ''}</span>
                  </p>
                </div>
              </div>

              {/* View Modes */}
              {tab === 'edit' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Proposal Title</label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-sm font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-1 flex-1 flex flex-col">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Proposal Body (Markdown)</label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={18}
                      className="text-xs font-mono flex-1 leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none bg-zinc-50/30 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Proposal Document</h3>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{editTitle}</h1>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
                    {renderMarkdown(editContent)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}

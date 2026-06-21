import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor,
  useSensor, useSensors, type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, Star, Globe, Clock, GripVertical } from 'lucide-react'
import { Badge, Skeleton } from '@/components/ui'
import { getAllLeads } from '@/lib/mockApi'
import { updateLeadStage } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import type { Lead, PipelineStage } from '@/types'
import { cn, getCategoryLabel, getScoreColor, getPipelineLabel } from '@/lib/utils'

const STAGES: PipelineStage[] = ['discovery', 'qualified', 'contacted', 'client']

const STAGE_META: Record<PipelineStage, { color: string; dot: string; bg: string }> = {
  discovery: { color: 'text-(--primary)', dot: 'bg-(--primary)', bg: 'clay-inset' },
  qualified: { color: 'text-(--success)', dot: 'bg-(--success)', bg: 'clay-inset' },
  contacted: { color: 'text-(--warning)', dot: 'bg-(--warning)', bg: 'clay-inset' },
  client: { color: 'text-(--text-primary)', dot: 'bg-(--text-primary)', bg: 'clay-inset' },
}

import { CAT_ICON } from '@/lib/icons';
import { Store } from 'lucide-react';

// ── Kanban Card ──────────────────────────────────────────────
function KanbanCard({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'clay-raised p-4 hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-transparent',
          isDragging && 'shadow-2xl ring-2 ring-(--primary)'
        )}
        onClick={() => setSelectedLeadId(lead.id)}
      >
        <div className="flex items-start gap-2.5">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 text-(--text-muted) hover:text-(--text-secondary) cursor-grab active:cursor-grabbing shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-bold text-(--text-primary) truncate group-hover:text-(--primary) transition-colors">
                {lead.name}
              </span>
              <span className={cn('text-xs font-bold font-mono shrink-0', getScoreColor(lead.score))}>
                {lead.score}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-(--text-secondary) mb-2 flex items-center gap-1.5">
              {(() => { const Icon = CAT_ICON[lead.category] || Store; return <Icon className="h-3.5 w-3.5" />; })()} {getCategoryLabel(lead.category)}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-(--text-secondary) mb-2">
              <MapPin className="h-3 w-3 shrink-0 text-(--primary)" />
              <span className="truncate">{lead.city}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant={lead.websiteStatus === 'none' ? 'warning' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
              >
                {lead.websiteStatus === 'none' ? (
                  <><Globe className="h-2.5 w-2.5" /> No site</>
                ) : (
                  <><Clock className="h-2.5 w-2.5" /> Outdated</>
                )}
              </Badge>
              {lead.rating && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-(--text-secondary)">
                  <Star className="h-2.5 w-2.5 text-(--warning) fill-(--warning)" />
                  {lead.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Kanban Column ────────────────────────────────────────────
function KanbanColumn({ stage, leads }: { stage: PipelineStage; leads: Lead[] }) {
  const meta = STAGE_META[stage]

  return (
    <div className="flex flex-col min-w-[260px] max-w-[280px] flex-1">
      {/* Column header */}
      <div className={cn('rounded-xl px-4 py-3 mb-4 flex items-center justify-between', meta.bg)}>
        <div className="flex items-center gap-2.5">
          <div className={cn('h-2 w-2 rounded-full', meta.dot)} />
          <span className={cn('text-[13px] font-bold uppercase tracking-wide', meta.color)}>
            {getPipelineLabel(stage)}
          </span>
        </div>
        <span className={cn('text-xs font-bold font-mono px-2 py-1 rounded-md bg-(--surface)', meta.color)}>
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 min-h-[200px]">
          {leads.length === 0 && (
            <div className="h-20 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center">
              <p className="text-xs font-semibold text-(--text-secondary)">Drop leads here</p>
            </div>
          )}
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Pipeline Page ────────────────────────────────────────────
export function PipelinePage() {
  const leads = useAppStore((s) => s.leads)
  const setLeads = useAppStore((s) => s.setLeads)
  const updateLeadStageStore = useAppStore((s) => s.updateLeadStage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(null)
    getAllLeads()
      .then((data) => {
        if (!active) return
        setLeads(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        setLeads([])
        setError(err instanceof Error ? err.message : 'Unable to load real pipeline data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [setLeads])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getLeadsByStage = (stage: PipelineStage) =>
    leads.filter((l) => l.pipelineStage === stage)

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over || active.id === over.id) return

    // Find which column the target belongs to
    const targetLead = leads.find((l) => l.id === over.id)
    if (!targetLead) return

    const targetStage = targetLead.pipelineStage
    const draggedLead = leads.find((l) => l.id === active.id)
    if (!draggedLead || draggedLead.pipelineStage === targetStage) return

    // Optimistic update
    updateLeadStageStore(active.id as string, targetStage)
    await updateLeadStage(active.id as string, targetStage)
  }

  const activeLead = leads.find((l) => l.id === activeId)

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <Skeleton className="h-7 w-32" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <div key={s} className="min-w-[260px] space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-[28px] font-heading font-black text-(--text-primary)">Pipeline</h1>
          <p className="text-[14px] text-(--text-secondary) font-medium mt-0.5">
            Real workspace data only · No dummy pipeline leads
          </p>
        </div>
        <div className="clay-raised p-8 text-center border border-red-200 dark:border-red-900/60">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">Real pipeline data unavailable</p>
          <p className="text-sm text-(--text-secondary) mt-2 max-w-xl mx-auto">{error}</p>
          <p className="text-xs text-(--text-muted) mt-3">
            Sign in with a real Supabase account and make sure the backend API is running to view saved pipeline stages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-heading font-black text-(--text-primary)">Pipeline</h1>
        <p className="text-[14px] text-(--text-secondary) font-medium mt-0.5">
          {leads.length} real leads across {STAGES.length} stages · Drag to reorder
        </p>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 flex-1 items-start">
          {STAGES.map((stage) => (
            <KanbanColumn key={stage} stage={stage} leads={getLeadsByStage(stage)} />
          ))}
        </div>

        <DragOverlay>
          {activeLead && <KanbanCard lead={activeLead} isDragging />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

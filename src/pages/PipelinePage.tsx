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
  discovery: { color: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/50' },
  qualified: { color: 'text-teal-600 dark:text-teal-400', dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/50' },
  contacted: { color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50' },
  client: { color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
}

const CAT_EMOJI: Record<string, string> = {
  restaurant: '🍽️', retail: '🛍️', salon: '💇', clinic: '🏥',
  auto_service: '🔧', bakery: '🥐', pharmacy: '💊', tailor: '🧵',
  cafe: '☕', gym: '💪', electronics: '🔌', jewellery: '💍',
  real_estate: '🏠', catering: '🍱',
}

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
          'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-150 group cursor-pointer',
          isDragging && 'shadow-xl ring-2 ring-teal-400'
        )}
        onClick={() => setSelectedLeadId(lead.id)}
      >
        <div className="flex items-start gap-2.5">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {lead.name}
              </span>
              <span className={cn('text-xs font-bold font-mono shrink-0', getScoreColor(lead.score))}>
                {lead.score}
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
              {CAT_EMOJI[lead.category]} {getCategoryLabel(lead.category)}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">
              <MapPin className="h-3 w-3 shrink-0" />
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
                <span className="flex items-center gap-0.5 text-[10px] text-zinc-400">
                  <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
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
      <div className={cn('rounded-lg px-3.5 py-2.5 mb-3 flex items-center justify-between', meta.bg)}>
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', meta.dot)} />
          <span className={cn('text-xs font-semibold', meta.color)}>
            {getPipelineLabel(stage)}
          </span>
        </div>
        <span className={cn('text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-white/60 dark:bg-zinc-900/60', meta.color)}>
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 min-h-[200px]">
          {leads.length === 0 && (
            <div className="h-20 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Drop leads here</p>
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
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    getAllLeads().then((data) => {
      setLeads(data)
      setLoading(false)
    })
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

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Pipeline</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {leads.length} leads across {STAGES.length} stages · Drag to reorder
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

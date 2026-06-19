import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Star, Globe, Clock, ChevronUp, ChevronDown, Filter, ArrowUpDown,
} from 'lucide-react'
import { Input, Badge, Skeleton, Select } from '@/components/ui'
import { getAllLeads } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import type { Lead, PipelineStage } from '@/types'
import { cn, getCategoryLabel, getScoreColor, getScoreBg, getPipelineLabel, formatDate } from '@/lib/utils'

const STAGE_COLORS: Record<PipelineStage, string> = {
  discovery: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950 dark:border-indigo-800',
  qualified: 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-800',
  contacted: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800',
  client: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800',
}

const CAT_EMOJI: Record<string, string> = {
  restaurant: '🍽️', retail: '🛍️', salon: '💇', clinic: '🏥',
  auto_service: '🔧', bakery: '🥐', pharmacy: '💊', tailor: '🧵',
  cafe: '☕', gym: '💪', electronics: '🔌', jewellery: '💍',
  real_estate: '🏠', catering: '🍱',
}

type SortKey = 'name' | 'score' | 'city' | 'pipelineStage' | 'discoveredAt'

export function LeadsPage() {
  const leads = useAppStore((s) => s.leads)
  const setLeads = useAppStore((s) => s.setLeads)
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all')
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    getAllLeads().then((data) => {
      setLeads(data)
      setLoading(false)
    })
  }, [setLeads])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let result = [...leads]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
      )
    }
    if (stageFilter !== 'all') result = result.filter((l) => l.pipelineStage === stageFilter)
    if (scoreFilter === 'high') result = result.filter((l) => l.score >= 80)
    else if (scoreFilter === 'medium') result = result.filter((l) => l.score >= 50 && l.score < 80)
    else if (scoreFilter === 'low') result = result.filter((l) => l.score < 50)

    result.sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0
      if (sortKey === 'name') { av = a.name; bv = b.name }
      else if (sortKey === 'score') { av = a.score; bv = b.score }
      else if (sortKey === 'city') { av = a.city; bv = b.city }
      else if (sortKey === 'pipelineStage') { av = a.pipelineStage; bv = b.pipelineStage }
      else if (sortKey === 'discoveredAt') { av = a.discoveredAt; bv = b.discoveredAt }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [leads, search, stageFilter, scoreFilter, sortKey, sortDir])

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-teal-500" /> : <ChevronDown className="h-3 w-3 text-teal-500" />
  }

  const ColHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(k)}
      className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 select-none"
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon k={k} />
      </div>
    </th>
  )

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Leads</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            All discovered leads · Click any row to view details
          </p>
        </div>
        <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md">
          {filtered.length} / {leads.length}
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Search businesses, cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Stage filter */}
        <Select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as typeof stageFilter)}
          className="h-8 text-xs w-36"
        >
          <option value="all">All Stages</option>
          <option value="discovery">Discovery</option>
          <option value="qualified">Qualified</option>
          <option value="contacted">Contacted</option>
          <option value="client">Client</option>
        </Select>

        {/* Score filter */}
        <Select
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value as typeof scoreFilter)}
          className="h-8 text-xs w-36"
        >
          <option value="all">All Scores</option>
          <option value="high">High (80+)</option>
          <option value="medium">Medium (50-79)</option>
          <option value="low">Low (&lt;50)</option>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <tr>
                  <ColHeader k="name" label="Business" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Category</th>
                  <ColHeader k="city" label="City" />
                  <ColHeader k="score" label="Score" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Website</th>
                  <ColHeader k="pipelineStage" label="Stage" />
                  <ColHeader k="discoveredAt" label="Discovered" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-zinc-400 dark:text-zinc-500">
                      No leads match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{CAT_EMOJI[lead.category] ?? '🏪'}</span>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm leading-none">
                            {lead.name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[180px]">
                            {lead.address}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {getCategoryLabel(lead.category)}
                      </span>
                    </td>

                    {/* City */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{lead.city}</span>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-bold font-mono px-2 py-0.5 rounded border',
                        getScoreBg(lead.score), getScoreColor(lead.score)
                      )}>
                        {lead.score}
                      </span>
                    </td>

                    {/* Website status */}
                    <td className="px-4 py-3">
                      <Badge variant={lead.websiteStatus === 'none' ? 'warning' : lead.websiteStatus === 'outdated' ? 'secondary' : 'muted'}>
                        {lead.websiteStatus === 'none' ? (
                          <><Globe className="h-3 w-3" /> None</>
                        ) : lead.websiteStatus === 'outdated' ? (
                          <><Clock className="h-3 w-3" /> Outdated</>
                        ) : (
                          <><Globe className="h-3 w-3" /> Active</>
                        )}
                      </Badge>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded border',
                        STAGE_COLORS[lead.pipelineStage]
                      )}>
                        {getPipelineLabel(lead.pipelineStage)}
                      </span>
                    </td>

                    {/* Discovered */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                        {formatDate(lead.discoveredAt)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Showing {filtered.length} of {leads.length} leads
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

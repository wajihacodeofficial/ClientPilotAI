import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radar, CheckCircle2, Loader2, MapPin, Phone, Star, Globe, Clock,
  Filter, SortAsc, ArrowUpDown, ChevronDown, Search, Sparkles,
} from 'lucide-react'
import {
  Button, Badge, Card, Input, Select, Slider, Label, Skeleton,
} from '@/components/ui'
import { discoverLeads, type ProgressStep } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import type { BusinessCategory, Lead } from '@/types'
import { cn, getCategoryLabel, getScoreBg, getScoreColor } from '@/lib/utils'

// ============================================================
// Category options
// ============================================================
const CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'retail', label: 'Retail Shops' },
  { value: 'salon', label: 'Salons & Beauty' },
  { value: 'clinic', label: 'Clinics / Medical' },
  { value: 'auto_service', label: 'Auto Services' },
  { value: 'bakery', label: 'Bakeries' },
  { value: 'pharmacy', label: 'Pharmacies' },
  { value: 'tailor', label: 'Tailor Shops' },
  { value: 'cafe', label: 'Cafés' },
  { value: 'gym', label: 'Gyms & Fitness' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'catering', label: 'Catering' },
]

// ============================================================
// Category Icons (emoji fallback)
// ============================================================
const CAT_EMOJI: Record<string, string> = {
  restaurant: '🍽️', retail: '🛍️', salon: '💇', clinic: '🏥',
  auto_service: '🔧', bakery: '🥐', pharmacy: '💊', tailor: '🧵',
  cafe: '☕', gym: '💪', electronics: '🔌', jewellery: '💍',
  real_estate: '🏠', catering: '🍱',
}

// ============================================================
// Score Circle
// ============================================================
function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#a1a1aa'
  const r = 18, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className={cn('absolute inset-0 flex items-center justify-center text-xs font-bold font-mono', getScoreColor(score))}>
        {score}
      </span>
    </div>
  )
}

// ============================================================
// Lead Card
// ============================================================
function LeadCard({ lead, index, onClick }: { lead: Lead; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.3, ease: 'easeOut' }}
    >
      <Card
        className="p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {/* Category emoji */}
          <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
            {CAT_EMOJI[lead.category] ?? '🏪'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {lead.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{getCategoryLabel(lead.category)}</p>
              </div>
              <ScoreCircle score={lead.score} />
            </div>

            {/* Address + phone */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{lead.address}, {lead.city}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span className="font-mono">{lead.phone}</span>
                </div>
              )}
              {lead.rating && (
                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                  <span>{lead.rating} ({lead.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {/* Tags + action */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant={lead.websiteStatus === 'none' ? 'warning' : lead.websiteStatus === 'outdated' ? 'secondary' : 'muted'}>
                  {lead.websiteStatus === 'none' ? (
                    <><Globe className="h-3 w-3" /> No website</>
                  ) : lead.websiteStatus === 'outdated' ? (
                    <><Clock className="h-3 w-3" /> Outdated site</>
                  ) : (
                    <><Globe className="h-3 w-3" /> Has website</>
                  )}
                </Badge>
                <Badge variant={lead.score >= 80 ? 'success' : lead.score >= 50 ? 'warning' : 'muted'}>
                  {lead.score >= 80 ? 'High priority' : lead.score >= 50 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                View →
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================
// Progress Step Indicator
// ============================================================
function ProgressIndicator({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div key={step.id} className={cn('progress-step', step.status)}>
          {step.status === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {step.status === 'active' && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
          {step.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-current opacity-30 shrink-0" />}
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Empty State
// ============================================================
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="h-20 w-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-5">
        <Radar className="h-10 w-10 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
        Discover your next clients
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
        Enter a location and business category above. ClientPilot AI will scan OpenStreetMap, filter businesses without web presence, and score each lead using AI analysis — so you know exactly who to reach out to first.
      </p>
    </motion.div>
  )
}

// ============================================================
// Lead Discovery Page
// ============================================================
export function LeadDiscoveryPage() {
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  const setDiscoveryResults = useAppStore((s) => s.setDiscoveryResults)
  const discoveryResults = useAppStore((s) => s.discoveryResults)

  const [location, setLocation] = useState('Karachi, Gulshan-e-Iqbal')
  const [selectedCats, setSelectedCats] = useState<BusinessCategory[]>([])
  const [radius, setRadius] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Filters/sort state
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score')
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  // Toggle category selection
  const toggleCat = (cat: BusinessCategory) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleDiscover = async () => {
    if (isRunning) return
    setIsRunning(true)
    setSteps([])
    setDiscoveryResults([])
    setHasSearched(true)

    const result = await discoverLeads(
      { location, categories: selectedCats, radiusKm: radius },
      (updatedSteps) => setSteps(updatedSteps)
    )

    setDiscoveryResults(result.leads)
    setIsRunning(false)
  }

  // Apply filters + sort
  const filtered = discoveryResults
    .filter((l) => {
      if (scoreFilter === 'high') return l.score >= 80
      if (scoreFilter === 'medium') return l.score >= 50 && l.score < 80
      if (scoreFilter === 'low') return l.score < 50
      return true
    })
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : a.name.localeCompare(b.name))

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Lead Discovery</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Powered by OpenStreetMap + AI scoring pipeline
        </p>
      </div>

      {/* Search panel */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Location */}
          <div className="md:col-span-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
                placeholder="e.g. Karachi, Gulshan-e-Iqbal"
              />
            </div>
          </div>

          {/* Radius */}
          <div>
            <Label>Radius: {radius} km</Label>
            <div className="mt-2">
              <Slider value={radius} min={1} max={25} step={1} onChange={setRadius} />
            </div>
          </div>

          {/* Sort placeholder */}
          <div>
            <Label htmlFor="sort-select">Sort results by</Label>
            <Select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="score">AI Score (highest first)</option>
              <option value="name">Name (A-Z)</option>
            </Select>
          </div>
        </div>

        {/* Category multi-select */}
        <div className="mb-5">
          <Label>Business Categories {selectedCats.length > 0 && `(${selectedCats.length} selected)`}</Label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCat(cat.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                  selectedCats.includes(cat.value)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 hover:text-indigo-600'
                )}
              >
                {CAT_EMOJI[cat.value]} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleDiscover} isLoading={isRunning} size="lg" className="w-full sm:w-auto gap-2">
          <Sparkles className="h-4 w-4" />
          {isRunning ? 'Discovering...' : 'Discover Leads'}
        </Button>
      </Card>

      {/* Progress indicator */}
      <AnimatePresence>
        {(isRunning || (steps.length > 0 && discoveryResults.length === 0 && hasSearched)) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-5">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                Running discovery pipeline...
              </p>
              <ProgressIndicator steps={steps} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {!hasSearched && <EmptyState />}

      {hasSearched && !isRunning && discoveryResults.length > 0 && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filtered.length}</span> leads found
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">Filter by score:</span>
              {(['all', 'high', 'medium', 'low'] as const).map((band) => (
                <button
                  key={band}
                  onClick={() => setScoreFilter(band)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                    scoreFilter === band
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  )}
                >
                  {band === 'all' ? 'All' : band.charAt(0).toUpperCase() + band.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setSortBy(sortBy === 'score' ? 'name' : 'score')}
                className="ml-1 px-2.5 py-1 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortBy === 'score' ? 'By Score' : 'By Name'}
              </button>
            </div>
          </div>

          {/* Lead cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((lead, i) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={i}
                onClick={() => setSelectedLeadId(lead.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

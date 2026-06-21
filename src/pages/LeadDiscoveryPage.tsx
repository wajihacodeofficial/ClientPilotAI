import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import {
  Radar, CheckCircle2, Loader2, MapPin, Phone, Globe, Clock,
  Filter, ArrowUpDown, Search, Sparkles, Map as MapIcon, List, X,
  Utensils, ShoppingBag, Scissors, Activity, Wrench, Pill, Coffee, Monitor, Star, Home, Store
} from 'lucide-react'
import {
  Button, Badge, Card, Input, Select, Slider, Label,
} from '@/components/ui'
import { discoverLeads } from '@/lib/mockApi'
import { useAppStore } from '@/store/useAppStore'
import type { BusinessCategory, Lead, ProgressStep } from '@/types'
import { cn, getCategoryLabel } from '@/lib/utils'

// Fix Leaflet default marker icons (broken in Vite builds)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom colored circle markers for discovered businesses
function makeLeadIcon(score: number): L.DivIcon {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#a1a1aa'
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${color};border:3px solid var(--surface);
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:700;color:white;font-family:monospace;
    ">${score}</div>`,
  })
}

const searchIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    width:20px;height:20px;border-radius:50%;
    background:var(--primary);border:3px solid var(--surface);
    box-shadow:0 2px 8px rgba(0,0,0,0.5);
  "></div>`,
})

// ── Category constants ────────────────────────────────────────
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

const CAT_ICON: Record<string, React.ElementType> = {
  restaurant: Utensils, retail: ShoppingBag, salon: Scissors, clinic: Activity,
  auto_service: Wrench, bakery: Coffee, pharmacy: Pill, tailor: Scissors,
  cafe: Coffee, gym: Activity, electronics: Monitor, jewellery: Star,
  real_estate: Home, catering: Utensils,
}

// ── Score circle SVG ──────────────────────────────────────────
function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#a1a1aa'
  const r = 18, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--primary-soft)" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-(--text-primary)">
        {score}
      </span>
    </div>
  )
}

// ── Lead card ─────────────────────────────────────────────────
function LeadCard({ lead, index, onClick }: { lead: Lead; index: number; onClick: () => void }) {
  const LeadIcon = CAT_ICON[lead.category] || Store
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25, ease: 'easeOut' }}
    >
      <Card
        className="p-4 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg clay-inset flex items-center justify-center text-(--primary) shrink-0">
            <LeadIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-(--text-primary) truncate group-hover:text-(--primary) transition-colors">
                  {lead.name}
                </h3>
                <p className="text-xs text-(--text-secondary) mt-0.5">{getCategoryLabel(lead.category)}</p>
              </div>
              <ScoreCircle score={lead.score} />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                <MapPin className="h-3 w-3 shrink-0 text-(--primary)" />
                <span className="truncate">{lead.address}{lead.city ? `, ${lead.city}` : ''}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                  <Phone className="h-3 w-3 shrink-0 text-(--primary)" />
                  <span className="font-mono">{lead.phone}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant={lead.websiteStatus === 'none' ? 'warning' : lead.websiteStatus === 'outdated' ? 'secondary' : 'muted'}>
                  {lead.websiteStatus === 'none' ? <><Globe className="h-3 w-3" /> No website</> :
                   lead.websiteStatus === 'outdated' ? <><Clock className="h-3 w-3" /> Outdated site</> :
                   <><Globe className="h-3 w-3" /> Has website</>}
                </Badge>
                <Badge variant={lead.score >= 80 ? 'success' : lead.score >= 50 ? 'warning' : 'muted'}>
                  {lead.score >= 80 ? 'High priority' : lead.score >= 50 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 hover:bg-(--surface-raised)">View →</Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ── Progress indicator ────────────────────────────────────────
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

// ── Empty state ───────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="h-20 w-20 rounded-3xl clay-raised flex items-center justify-center mb-5">
        <Radar className="h-10 w-10 text-(--primary)" />
      </div>
      <h3 className="text-lg font-heading font-bold text-(--text-primary) mb-2">
        Discover your next clients
      </h3>
      <p className="text-sm text-(--text-secondary) max-w-sm leading-relaxed">
        Enter a location or click the map to set a search center, choose categories, then hit Discover. ClientPilot AI will scan OpenStreetMap and score each lead with AI.
      </p>
    </motion.div>
  )
}

// ── Leaflet Map Component ─────────────────────────────────────
interface MapPanelProps {
  center: [number, number]
  radius: number
  leads: Lead[]
  onMapClick: (lat: number, lng: number) => void
  onLeadClick: (id: string) => void
}

function MapPanel({ center, radius, leads, onMapClick, onLeadClick }: MapPanelProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const centerMarkerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const leadMarkersRef = useRef<L.Marker[]>([])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center,
      zoom: 14,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update center marker + radius circle when center changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    centerMarkerRef.current?.remove()
    circleRef.current?.remove()
    centerMarkerRef.current = L.marker(center, { icon: searchIcon })
      .addTo(map)
      .bindPopup('<b>Search center</b><br>Click anywhere to move')
    circleRef.current = L.circle(center, {
      radius: radius * 1000,
      color: '#6366f1',
      fillColor: '#6366f1',
      fillOpacity: 0.07,
      weight: 2,
      dashArray: '6 4',
    }).addTo(map)
    map.flyTo(center, 13, { duration: 1.2 })
  }, [center, radius])

  // Update lead markers whenever leads change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    leadMarkersRef.current.forEach((m) => m.remove())
    leadMarkersRef.current = []
    leads.forEach((lead) => {
      if (lead.latitude == null || lead.longitude == null) return
      const m = L.marker([lead.latitude, lead.longitude], { icon: makeLeadIcon(lead.score) })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:160px">
            <strong style="font-size:13px">${lead.name}</strong><br>
            <span style="font-size:11px;color:#888">${getCategoryLabel(lead.category)}</span><br>
            <span style="font-size:11px">${lead.address || ''}</span>
          </div>`
        )
      m.on('click', () => onLeadClick(lead.id))
      leadMarkersRef.current.push(m)
    })
  }, [leads, onLeadClick])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: 420 }}
    />
  )
}

// ── Main page ─────────────────────────────────────────────────
export function LeadDiscoveryPage() {
  const setSelectedLeadId = useAppStore((s) => s.setSelectedLeadId)
  const setDiscoveryResults = useAppStore((s) => s.setDiscoveryResults)
  const discoveryResults = useAppStore((s) => s.discoveryResults)

  const [locationText, setLocationText] = useState('Karachi, Gulshan-e-Iqbal')
  const [geoSearch, setGeoSearch] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([24.9215, 67.0979])
  const [selectedCats, setSelectedCats] = useState<BusinessCategory[]>([])
  const [radius, setRadius] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split')
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score')
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const toggleCat = (cat: BusinessCategory) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  // Geocode a text query via Nominatim and fly map there
  const geocodeSearch = async () => {
    const q = geoSearch.trim() || locationText.trim()
    if (!q) return
    setGeoLoading(true)
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'ClientPilotAI/1.0' } }
      )
      const data = await resp.json() as { lat: string; lon: string; display_name: string }[]
      if (data[0]) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        setMapCenter([lat, lng])
        setLocationText(data[0].display_name.split(',').slice(0, 3).join(','))
        setGeoSearch('')
      }
    } catch (e) {
      console.error('Geocode error', e)
    } finally {
      setGeoLoading(false)
    }
  }

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMapCenter([lat, lng])
    setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
  }, [])

  const handleLeadClick = useCallback((id: string) => {
    setSelectedLeadId(id)
  }, [setSelectedLeadId])

  const handleDiscover = async () => {
    if (isRunning) return
    setIsRunning(true)
    setSteps([])
    setDiscoveryResults([])
    setHasSearched(true)

    const result = await discoverLeads(
      {
        location: locationText,
        lat: mapCenter[0],
        lng: mapCenter[1],
        categories: selectedCats,
        radiusKm: radius
      },
      (updatedSteps) => setSteps(updatedSteps)
    )

    setDiscoveryResults(result.leads)
    setIsRunning(false)
  }

  const filtered = discoveryResults
    .filter((l) => {
      if (scoreFilter === 'high') return l.score >= 80
      if (scoreFilter === 'medium') return l.score >= 50 && l.score < 80
      if (scoreFilter === 'low') return l.score < 50
      return true
    })
    .sort((a, b) => sortBy === 'score' ? b.score - a.score : a.name.localeCompare(b.name))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top control bar ── */}
      <div className="p-4 shrink-0 space-y-3 z-10 clay-floating rounded-none border-b border-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-heading font-bold text-(--text-primary)">Lead Discovery</h1>
            <p className="text-xs text-(--text-secondary)">
              Powered by OpenStreetMap + Gemini AI scoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('split')}
              title="Map + List view"
              className={cn('p-1.5 rounded-xl transition-all duration-200',
                viewMode === 'split'
                  ? 'clay-raised text-(--primary)'
                  : 'text-(--text-secondary) hover:text-(--text-primary)')}
            >
              <MapIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List only view"
              className={cn('p-1.5 rounded-xl transition-all duration-200',
                viewMode === 'list'
                  ? 'clay-raised text-(--primary)'
                  : 'text-(--text-secondary) hover:text-(--text-primary)')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Location search bar */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-secondary)" />
            <Input
              value={geoSearch}
              onChange={(e) => setGeoSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && geocodeSearch()}
              placeholder="Search a location (e.g. Gulshan Karachi)…"
              className="pl-8 h-9 text-sm"
            />
            {geoSearch && (
              <button
                onClick={() => setGeoSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) hover:text-(--text-primary)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={geocodeSearch} isLoading={geoLoading} size="md" variant="outline" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Go to Location
          </Button>

          <div className="flex items-center gap-2 min-w-[120px]">
            <Label className="text-xs whitespace-nowrap">Radius: {radius} km</Label>
            <Slider value={radius} min={1} max={25} step={1} onChange={setRadius} />
          </div>

          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="h-9 text-xs w-36">
            <option value="score">AI Score (highest)</option>
            <option value="name">Name (A-Z)</option>
          </Select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const CatIcon = CAT_ICON[cat.value] || Store
            return (
              <button
                key={cat.value}
                onClick={() => toggleCat(cat.value)}
                className={cn(
                  'px-3 py-1.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5',
                  selectedCats.includes(cat.value)
                    ? 'clay-raised text-(--primary)'
                    : 'clay-inset text-(--text-secondary) hover:text-(--text-primary)'
                )}
              >
                <CatIcon className="h-3.5 w-3.5" /> {cat.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {locationText && (
            <span className="text-xs text-(--text-secondary) flex items-center gap-1.5 font-semibold">
              <MapPin className="h-3.5 w-3.5 text-(--primary)" />
              {locationText.length > 60 ? locationText.slice(0, 60) + '…' : locationText}
            </span>
          )}
          <Button onClick={handleDiscover} isLoading={isRunning} size="md" className="gap-2 ml-auto">
            <Sparkles className="h-4 w-4" />
            {isRunning ? 'Discovering…' : 'Discover Leads'}
          </Button>
        </div>
      </div>

      {/* ── Body: map + results ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Map pane */}
        {viewMode === 'split' && (
          <div className="w-1/2 shrink-0 p-4 border-r border-white/5">
            <MapPanel
              center={mapCenter}
              radius={radius}
              leads={filtered}
              onMapClick={handleMapClick}
              onLeadClick={handleLeadClick}
            />
            <p className="text-[11px] font-semibold text-(--text-secondary) mt-3 text-center">
              Click the map to set search center · Markers = discovered leads
            </p>
          </div>
        )}

        {/* Results pane */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Progress */}
          <AnimatePresence>
            {(isRunning || (steps.length > 0 && discoveryResults.length === 0 && hasSearched)) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-6">
                  <p className="text-sm font-bold text-(--text-primary) mb-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-(--primary)" />
                    Running discovery pipeline…
                  </p>
                  <ProgressIndicator steps={steps} />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {!hasSearched && <EmptyState />}

          {/* Filter bar + cards */}
          {hasSearched && !isRunning && discoveryResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm font-medium text-(--text-secondary)">
                  <span className="font-bold text-(--text-primary)">{filtered.length}</span> leads found
                </p>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-(--text-secondary)" />
                  <span className="text-xs font-semibold text-(--text-secondary)">Score:</span>
                  {(['all', 'high', 'medium', 'low'] as const).map((band) => (
                    <button
                      key={band}
                      onClick={() => setScoreFilter(band)}
                      className={cn(
                        'px-3 py-1 rounded-xl text-xs font-bold transition-colors',
                        scoreFilter === band
                          ? 'clay-raised text-(--primary)'
                          : 'clay-inset text-(--text-secondary) hover:text-(--text-primary)'
                      )}
                    >
                      {band === 'all' ? 'All' : band.charAt(0).toUpperCase() + band.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={() => setSortBy(sortBy === 'score' ? 'name' : 'score')}
                    className="px-3 py-1 rounded-xl text-xs font-bold clay-inset text-(--text-secondary) hover:text-(--text-primary) flex items-center gap-1.5 ml-2"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    {sortBy === 'score' ? 'By Score' : 'By Name'}
                  </button>
                </div>
              </div>

              <div className={cn(
                'grid gap-3',
                viewMode === 'split' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              )}>
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

          {/* No results after search */}
          {hasSearched && !isRunning && discoveryResults.length === 0 && steps.length > 0 && (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-(--text-secondary)">No businesses found. Try adjusting the radius or categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

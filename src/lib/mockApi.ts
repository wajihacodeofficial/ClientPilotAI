import type {
  Lead,
  DiscoveryParams,
  DiscoveryResult,
  OutreachMessage,
  PipelineStage,
  DashboardStats,
} from '@/types'
import { mockLeads, mockDashboardStats } from '@/data/mockLeads'

// ============================================================
// Utility: Artificial delay
// ============================================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function jitter(base: number, variance = 200): number {
  return base + Math.random() * variance - variance / 2
}

// ============================================================
// Discovery Progress Steps
// ============================================================
export interface ProgressStep {
  id: string
  label: string
  detail?: string
  status: 'pending' | 'active' | 'done'
}

export type ProgressCallback = (steps: ProgressStep[]) => void

export async function discoverLeads(
  params: DiscoveryParams,
  onProgress: ProgressCallback
): Promise<DiscoveryResult> {
  const totalFound = Math.floor(Math.random() * 20) + 35 // 35-55
  const filteredCount = Math.floor(totalFound * 0.45) + 5

  const steps: ProgressStep[] = [
    { id: 'osm', label: 'Querying OpenStreetMap...', status: 'pending' },
    { id: 'found', label: `Found ${totalFound} businesses`, status: 'pending' },
    { id: 'filter', label: 'Filtering for missing websites...', status: 'pending' },
    { id: 'candidates', label: `${filteredCount} candidates without web presence`, status: 'pending' },
    { id: 'ai', label: 'Running AI analysis...', status: 'pending' },
    { id: 'scoring', label: 'Scoring leads...', status: 'pending' },
  ]

  // Step 1
  steps[0] = { ...steps[0], status: 'active' }
  onProgress([...steps])
  await delay(jitter(1100, 300))

  // Step 2
  steps[0] = { ...steps[0], status: 'done' }
  steps[1] = { ...steps[1], status: 'active' }
  onProgress([...steps])
  await delay(jitter(800, 200))

  // Step 3
  steps[1] = { ...steps[1], status: 'done' }
  steps[2] = { ...steps[2], status: 'active' }
  onProgress([...steps])
  await delay(jitter(1000, 300))

  // Step 4
  steps[2] = { ...steps[2], status: 'done' }
  steps[3] = { ...steps[3], status: 'active' }
  onProgress([...steps])
  await delay(jitter(700, 200))

  // Step 5
  steps[3] = { ...steps[3], status: 'done' }
  steps[4] = { ...steps[4], status: 'active' }
  onProgress([...steps])
  await delay(jitter(1400, 300))

  // Step 6
  steps[4] = { ...steps[4], status: 'done' }
  steps[5] = { ...steps[5], status: 'active' }
  onProgress([...steps])
  await delay(jitter(900, 200))

  steps[5] = { ...steps[5], status: 'done' }
  onProgress([...steps])

  // Filter leads by category if specified
  let results = [...mockLeads]
  if (params.categories.length > 0) {
    results = results.filter((l) => params.categories.includes(l.category))
    if (results.length === 0) results = mockLeads.slice(0, 12)
  }

  // Shuffle for realism
  results = results.sort(() => Math.random() - 0.5).slice(0, Math.min(filteredCount, results.length))

  return {
    leads: results,
    totalFound,
    filteredCount,
    searchedAt: new Date().toISOString(),
  }
}

// ============================================================
// Lead Detail
// ============================================================
export async function getLeadDetail(id: string): Promise<Lead | null> {
  await delay(jitter(400, 100))
  return mockLeads.find((l) => l.id === id) ?? null
}

// ============================================================
// All Leads (for table)
// ============================================================
export async function getAllLeads(): Promise<Lead[]> {
  await delay(jitter(600, 150))
  return [...mockLeads]
}

// ============================================================
// Dashboard Stats
// ============================================================
export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(jitter(700, 200))
  return { ...mockDashboardStats }
}

// ============================================================
// Generate Outreach (simulate AI regeneration)
// ============================================================
export async function generateOutreach(leadId: string): Promise<OutreachMessage> {
  await delay(jitter(1800, 400))
  const lead = mockLeads.find((l) => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  // Alternate between variant 1 and 2
  const variant = (lead.outreachMessages[0].variant === 1 ? 2 : 1) as 1 | 2
  const msg = lead.outreachMessages[variant - 1]
  return { ...msg, generatedAt: new Date().toISOString() }
}

// ============================================================
// Update Lead Pipeline Stage
// ============================================================
export async function updateLeadStage(
  _id: string,
  _stage: PipelineStage
): Promise<{ success: boolean }> {
  await delay(jitter(400, 100))
  return { success: true }
}

// ============================================================
// Save Draft
// ============================================================
export async function saveDraft(
  _leadId: string,
  _message: OutreachMessage
): Promise<{ success: boolean }> {
  await delay(jitter(300, 50))
  return { success: true }
}

// ============================================================
// Approve & Send Outreach
// ============================================================
export async function sendOutreach(
  _leadId: string,
  _message: OutreachMessage
): Promise<{ success: boolean; sentAt: string }> {
  await delay(jitter(1200, 300))
  return { success: true, sentAt: new Date().toISOString() }
}

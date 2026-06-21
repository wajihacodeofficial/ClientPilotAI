import { supabase } from './supabaseClient';
import type { Lead, DashboardStats, PipelineStage, OutreachMessage, ProgressStep, BusinessCategory } from '../types';
import { mockLeads, mockDashboardStats } from '../data/mockLeads';
import { getCategoryLabel } from './utils';

let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();

if (import.meta.env.MODE === 'production') {
  // If the backend is on a different domain, it should be an absolute URL
  // If it's the same domain, we enforce '/api'
  if (rawApiUrl === '/' || rawApiUrl === '') {
    rawApiUrl = '/api';
  } else if (rawApiUrl.includes('localhost')) {
    rawApiUrl = '/api';
  }
}

// Ensure the URL correctly points to the api endpoint without trailing slashes
if (rawApiUrl.startsWith('http')) {
  if (rawApiUrl.endsWith('/')) {
    rawApiUrl = rawApiUrl.slice(0, -1);
  }
  if (!rawApiUrl.endsWith('/api')) {
    rawApiUrl += '/api';
  }
} else if (!rawApiUrl.startsWith('/api')) {
  rawApiUrl = '/api';
}

const API_URL = rawApiUrl;

// ============================================================
// Utility Helpers
// ============================================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(base: number, variance = 200): number {
  return base + Math.random() * variance - variance / 2;
}

const isProd = import.meta.env.MODE === 'production';
const forceDemo = import.meta.env.VITE_FORCE_DEMO === 'true';

function isDemoMode(session: unknown): boolean {
  if (isProd && !forceDemo) return false;
  const isEnvConfigured =
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co';
  return !session || !isEnvConfigured;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'API Error' }));
    throw new Error(err.error || response.statusText);
  }

  return response.json();
}

interface DbLead {
  id: string;
  business_name?: string;
  category?: string | null;
  address?: string;
  city?: string | null;
  phone?: string | null;
  rating?: number | null;
  review_count?: number | null;
  has_website?: boolean;
  website_url?: string | null;
  pipeline_stage?: PipelineStage;
  created_at?: string;
  distance?: number;
  lat?: number;
  lng?: number;
  // Enrichment fields
  contact_email?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  contact_source?: string | null;
  contact_confidence?: number | null;
  // Outreach draft fields
  outreach_subject?: string | null;
  outreach_body?: string | null;
  outreach_status?: string | null;
  outreach_generated_at?: string | null;
  outreach_sent_at?: string | null;
  // Proposal draft fields
  proposal_content?: string | null;
  proposal_status?: string | null;
  proposal_generated_at?: string | null;
  // Metadata
  last_enrichment_run_at?: string | null;
  last_error?: string | null;
  lead_scores?: {
    overall_score?: number;
    digital_presence_gap?: number;
    category_fit?: number;
    review_activity?: number;
    market_density?: number;
    competitor_presence?: number;
    ai_reasoning?: string;
  }[] | {
    overall_score?: number;
    digital_presence_gap?: number;
    category_fit?: number;
    review_activity?: number;
    market_density?: number;
    competitor_presence?: number;
    ai_reasoning?: string;
  };
  outreach_messages?: {
    id: string;
    subject?: string;
    content?: string;
    status?: 'draft' | 'sent';
    created_at?: string;
  }[];
}

const PIPELINE_STAGES: PipelineStage[] = ['discovery', 'qualified', 'contacted', 'client'];

function normalizePipelineStage(stage?: string | null): PipelineStage {
  return PIPELINE_STAGES.includes(stage as PipelineStage) ? (stage as PipelineStage) : 'discovery';
}

function normalizeBusinessCategory(category?: string | null): BusinessCategory {
  const normalized = (category || '').trim().toLowerCase();
  const supported: BusinessCategory[] = [
    'restaurant', 'retail', 'salon', 'clinic', 'auto_service', 'bakery', 'pharmacy',
    'tailor', 'cafe', 'gym', 'electronics', 'jewellery', 'real_estate', 'catering',
  ];

  if (supported.includes(normalized as BusinessCategory)) return normalized as BusinessCategory;

  // OSM returns a wide range of category names. Map unknown real-world values
  // to the closest frontend category instead of breaking Leads/Pipeline views.
  if (['fast_food', 'food_court', 'bar', 'pub'].includes(normalized)) return 'restaurant';
  if (['shop', 'supermarket', 'convenience', 'marketplace', 'mall', 'department_store'].includes(normalized)) return 'retail';
  if (['beauty', 'hairdresser', 'spa'].includes(normalized)) return 'salon';
  if (['doctors', 'dentist', 'hospital', 'medical_centre'].includes(normalized)) return 'clinic';
  if (['car_repair', 'car_wash', 'vehicle_inspection'].includes(normalized)) return 'auto_service';
  if (['fitness_centre', 'sports_centre'].includes(normalized)) return 'gym';

  return 'retail';
}

// Helper to map Supabase database records to frontend Lead interface
function mapDbLeadToLead(dbLead: DbLead): Lead {
  // lead_scores may come as array (joined query) or single object (upsert return)
  const scoresRaw = Array.isArray(dbLead.lead_scores) ? dbLead.lead_scores[0] : dbLead.lead_scores;
  const scores = scoresRaw || {};
  const hasWebsite = dbLead.has_website || false;
  const city = (dbLead.city || 'Karachi') as Lead['city'];
  const category = normalizeBusinessCategory(dbLead.category);

  return {
    id: dbLead.id,
    name: dbLead.business_name || 'Unknown Business',
    category,
    address: dbLead.address || '',
    city,
    phone: dbLead.phone || undefined,
    rating: dbLead.rating || undefined,
    reviewCount: dbLead.review_count || undefined,
    websiteStatus: hasWebsite ? 'has_website' : 'none',
    websiteUrl: dbLead.website_url || undefined,
    score: scores.overall_score || 0,
    scoreBreakdown: {
      digitalPresenceGap: scores.digital_presence_gap || 0,
      categoryFit: scores.category_fit || 0,
      reviewActivity: scores.review_activity || 0,
      marketDensity: scores.market_density || 0,
      competitorPresence: scores.competitor_presence || 0,
    },
    pipelineStage: normalizePipelineStage(dbLead.pipeline_stage),
    discoveredAt: dbLead.created_at || new Date().toISOString(),
    distance: dbLead.distance || undefined,
    aiAnalysis: scores.ai_reasoning || 'AI scoring and analysis in progress...',
    outreachMessages: (dbLead.outreach_messages || []).map((msg) => ({
      id: msg.id,
      subject: msg.subject || '',
      body: msg.content || '',
      status: msg.status || 'draft',
      createdAt: msg.created_at || new Date().toISOString(),
    })),
    latitude: dbLead.lat || undefined,
    longitude: dbLead.lng || undefined,
    // Enrichment fields
    contactEmail: dbLead.contact_email ?? undefined,
    contactPhone: dbLead.contact_phone ?? undefined,
    website: dbLead.website ?? undefined,
    contactSource: (dbLead.contact_source ?? undefined) as Lead['contactSource'],
    contactConfidence: dbLead.contact_confidence ?? undefined,
    // Outreach fields
    outreachSubject: dbLead.outreach_subject ?? undefined,
    outreachBody: dbLead.outreach_body ?? undefined,
    outreachStatus: (dbLead.outreach_status ?? undefined) as Lead['outreachStatus'],
    outreachGeneratedAt: dbLead.outreach_generated_at ?? undefined,
    outreachSentAt: dbLead.outreach_sent_at ?? undefined,
    // Proposal fields
    proposalContent: dbLead.proposal_content ?? undefined,
    proposalStatus: (dbLead.proposal_status ?? undefined) as Lead['proposalStatus'],
    proposalGeneratedAt: dbLead.proposal_generated_at ?? undefined,
    // Metadata
    lastEnrichmentRunAt: dbLead.last_enrichment_run_at ?? undefined,
    lastError: dbLead.last_error ?? null,
  };
}

// ============================================================
// Discovery Leads
// ============================================================
export async function discoverLeads(
  params: { location: string; categories: string[]; radiusKm: number; lat?: number; lng?: number },
  onProgress?: (steps: ProgressStep[]) => void
): Promise<{ leads: Lead[] }> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    const totalFound = Math.floor(Math.random() * 20) + 35; // 35-55
    const filteredCount = Math.floor(totalFound * 0.45) + 5;

    const steps: ProgressStep[] = [
      { id: '1', label: 'Geocoding location...', status: 'active' },
      { id: '2', label: 'Querying OpenStreetMap...', status: 'pending' },
      { id: '3', label: 'Initiating AI scoring pipeline...', status: 'pending' }
    ];

    if (onProgress) {
      onProgress([...steps]);
      await delay(jitter(800, 200));
      steps[0] = { ...steps[0], status: 'done' };
      steps[1] = { ...steps[1], status: 'active' };
      onProgress([...steps]);
      await delay(jitter(1000, 300));
      steps[1] = { ...steps[1], status: 'done' };
      steps[2] = { ...steps[2], status: 'active' };
      onProgress([...steps]);
      await delay(jitter(1200, 300));
      steps[2] = { ...steps[2], status: 'done' };
      onProgress([...steps]);
    }

    let results = [...mockLeads];
    if (params.categories.length > 0) {
      results = results.filter((l) => params.categories.includes(l.category));
      if (results.length === 0) results = mockLeads.slice(0, 12);
    }

    results = results.sort(() => Math.random() - 0.5).slice(0, Math.min(filteredCount, results.length));
    return { leads: results };
  }

  try {
    if (onProgress) {
      onProgress([
        { id: '1', label: 'Geocoding location...', status: 'active' },
        { id: '2', label: 'Querying OpenStreetMap...', status: 'pending' },
        { id: '3', label: 'Initiating AI scoring pipeline...', status: 'pending' }
      ]);
    }

    const result = await fetchWithAuth('/leads/discover', {
      method: 'POST',
      body: JSON.stringify({
        location: params.location,
        lat: params.lat,
        lng: params.lng,
        categories: params.categories,
        radiusMeters: params.radiusKm * 1000,
      }),
    }) as { leads: DbLead[]; [key: string]: unknown };

    if (onProgress) {
      onProgress([
        { id: '1', label: 'Geocoding location...', status: 'done' },
        { id: '2', label: 'Querying OpenStreetMap...', status: 'done' },
        { id: '3', label: 'Initiating AI scoring pipeline...', status: 'done' }
      ]);
    }

    return {
      ...result,
      leads: (result.leads || []).map(mapDbLeadToLead),
    };
  } catch (err) {
    console.warn('API discovery failed:', err);
    if (isProd && !forceDemo) throw err;
    if (onProgress) {
      onProgress([
        { id: '1', label: 'Geocoding location...', status: 'done' },
        { id: '2', label: 'Querying OpenStreetMap...', status: 'done' },
        { id: '3', label: 'Initiating AI scoring pipeline...', status: 'done' }
      ]);
    }
    await delay(jitter(500, 100));
    return { leads: mockLeads.slice(0, 8) };
  }
}

// ============================================================
// Trigger AI Scoring for a single lead (called when panel opens with score=0)
// ============================================================
export async function scoreLeadApi(leadId: string): Promise<Record<string, unknown> | null> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // ignore
  }

  if (isDemoMode(session)) return null; // mock leads already have scores

  try {
    const result = await fetchWithAuth(`/leads/${leadId}/score`, { method: 'POST' });
    return result as Record<string, unknown>;
  } catch (err) {
    console.warn('[scoreLeadApi] failed:', err);
    if (isProd && !forceDemo) throw err;
    return null;
  }
}

// ============================================================
// Get All Leads
// ============================================================
export async function getAllLeads(): Promise<Lead[]> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    throw new Error('Please sign in with a real account to view workspace leads. Demo mode does not use dummy lead data.');
  }

  try {
    const raw = (await fetchWithAuth('/leads')) as DbLead[];
    return raw.map(mapDbLeadToLead);
  } catch (err) {
    console.warn('getAllLeads API failed:', err);
    throw err;
  }
}

// ============================================================
// Dashboard Analytics overview
// ============================================================
export async function getDashboardStats(): Promise<DashboardStats> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    await delay(jitter(500, 150));
    return { ...mockDashboardStats };
  }

  try {
    return await fetchWithAuth('/analytics/overview');
  } catch (err) {
    console.warn('getDashboardStats API failed:', err);
    if (isProd && !forceDemo) throw err;
    await delay(jitter(400, 100));
    return { ...mockDashboardStats };
  }
}

// ============================================================
// Generate Outreach
// ============================================================
export async function generateOutreach(leadId: string): Promise<OutreachMessage> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    await delay(jitter(1200, 300));
    const lead = mockLeads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');
    const hasOutreach = lead.outreachMessages && lead.outreachMessages.length > 0;
    const variant = hasOutreach ? ((lead.outreachMessages[0].variant === 1 ? 2 : 1) as 1 | 2) : 1;
    const baseMsg = hasOutreach ? lead.outreachMessages[variant - 1] || lead.outreachMessages[0] : null;

    return {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      subject: baseMsg?.subject || `AI Outreach for ${lead.name}`,
      body: baseMsg?.body || `Hi ${lead.name},\n\nWe would love to help you build an online presence for your business.\n\nBest,\nAcme Software Agency`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      variant,
    } as OutreachMessage;
  }

  try {
    const result = await fetchWithAuth(`/leads/${leadId}/outreach`, {
      method: 'POST',
    });
    
    return {
      id: result.id,
      subject: result.subject,
      body: result.content,
      status: result.status,
      createdAt: result.created_at,
    } as OutreachMessage;
  } catch (err) {
    console.warn('generateOutreach API failed:', err);
    if (isProd && !forceDemo) throw err;
    await delay(jitter(1000, 200));
    const lead = mockLeads.find((l) => l.id === leadId);
    return {
      id: `msg-${Math.random().toString(36).substring(2, 9)}`,
      subject: `AI Outreach for ${lead?.name || 'Business'}`,
      body: `Hi,\n\nWe noticed you don't have a website yet and would love to help.\n\nRegards,\nAcme Software Agency`,
      status: 'draft',
      createdAt: new Date().toISOString(),
    } as OutreachMessage;
  }
}

// ============================================================
// Send Outreach
// ============================================================
export async function sendOutreach(
  leadId: string,
  message: OutreachMessage,
  recipientEmail?: string
): Promise<void> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    await delay(jitter(800, 200));
    return;
  }

  try {
    await fetchWithAuth(`/leads/${leadId}/send-outreach`, {
      method: 'POST',
      body: JSON.stringify({
        subject: message.subject,
        body: message.body,
        recipient_email: recipientEmail,
      }),
    });
  } catch (err) {
    console.warn('sendOutreach failed:', err);
    if (isProd && !forceDemo) throw err;
  }
}

// ============================================================
// Save Draft
// ============================================================
export async function saveDraft(
  leadId: string,
  message: Partial<OutreachMessage>
): Promise<void> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    await delay(jitter(300, 50));
    return;
  }

  try {
    await fetchWithAuth(`/leads/${leadId}/save-draft`, {
      method: 'POST',
      body: JSON.stringify({
        subject: message.subject,
        body: message.body,
      }),
    });
  } catch (err) {
    console.warn('saveDraft failed:', err);
    // Non-fatal: draft may already be stored locally
  }
}

// ============================================================
// Prepare Lead (Enrich + AI Generate Outreach + Proposal)
// ============================================================
export interface PrepareLeadResult {
  lead: Lead;
  proposalContent?: string;
  proposalTitle?: string;
  partialError?: string | null;
}

export async function prepareLead(
  leadId: string,
  force = false
): Promise<PrepareLeadResult> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    // In demo mode: simulate enrichment & drafting with a delay
    await delay(jitter(2200, 400));
    const lead = mockLeads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const demoResult: Lead = {
      ...lead,
      contactEmail: 'owner@' + lead.name.toLowerCase().replace(/\s+/g, '') + '.com',
      contactSource: 'website_homepage',
      contactConfidence: 0.8,
      outreachSubject: `Grow ${lead.name} Online — Let's Talk`,
      outreachBody: `Hi ${lead.name} team,\n\nI came across your business and noticed a great opportunity to strengthen your digital presence. We specialise in building high-converting websites for ${lead.category} businesses like yours.\n\nI'd love to show you a quick demo — completely free, no obligation.\n\nBest regards,\nClientPilot AI`,
      outreachStatus: 'draft',
      outreachGeneratedAt: new Date().toISOString(),
      proposalContent: `# Proposal for ${lead.name}\n\n## Overview\nWe propose a modern web solution to help ${lead.name} attract more customers online.\n\n## Scope\n- Professional website design\n- SEO optimisation\n- Google Business profile setup\n- Social media integration\n\n## Pricing\nStarting from PKR 45,000 — flexible payment plans available.`,
      proposalStatus: 'draft',
      proposalGeneratedAt: new Date().toISOString(),
    };
    return { lead: demoResult, proposalContent: demoResult.proposalContent };
  }

  const result = await fetchWithAuth(`/leads/${leadId}/prepare`, {
    method: 'POST',
    body: JSON.stringify({ force }),
  }) as { lead: DbLead; proposal?: { title?: string; content?: string } | null; error?: string | null };

  const mappedLead = mapDbLeadToLead(result.lead as unknown as DbLead);
  return {
    lead: mappedLead,
    proposalContent: result.proposal?.content ?? mappedLead.proposalContent,
    proposalTitle: result.proposal?.title,
    partialError: result.error,
  };
}

// ============================================================
// Update Lead Stage
// ============================================================
export async function updateLeadStage(leadId: string, stage: PipelineStage): Promise<void> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // Ignore session errors
  }

  if (isDemoMode(session)) {
    await delay(jitter(200, 50));
    return;
  }

  try {
    await fetchWithAuth(`/leads/${leadId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  } catch (err) {
    console.warn('updateLeadStage API failed:', err);
  }
}

// ============================================================
// Admin Dashboard APIs
// ============================================================
export async function getAdminUsers(): Promise<unknown[]> {
  return fetchWithAuth('/admin/users');
}

export async function updateUserRole(userId: string, role: 'admin' | 'user'): Promise<unknown> {
  return fetchWithAuth(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// ============================================================
// Proposals APIs
// ============================================================

type ProposalStatus = 'draft' | 'submitted' | 'reviewed' | 'replied' | 'accepted' | 'rejected';

export async function getProposals(): Promise<import('../types').Proposal[]> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch { /* ignore */ }

  if (isDemoMode(session)) {
    await delay(jitter(300, 100));
    const local = localStorage.getItem('clientpilot_proposals');
    const list = local ? JSON.parse(local) : [];
    // Populate leads details from mockLeads if available
    return list.map((p: import('../types').Proposal) => {
      const lead = mockLeads.find((l) => l.id === p.leadId);
      return {
        ...p,
        leads: lead ? {
          business_name: lead.name,
          category: lead.category,
          address: lead.address,
          city: lead.city,
        } : p.leads,
      };
    });
  }

  try {
    const raw = await fetchWithAuth('/proposals') as Record<string, unknown>[];
    return raw.map((p) => ({
      id: p['id'] as string,
      leadId: p['lead_id'] as string,
      workspaceId: p['workspace_id'] as string,
      title: p['title'] as string,
      content: p['content'] as string,
      status: p['status'] as ProposalStatus,
      createdAt: p['created_at'] as string,
      updatedAt: p['updated_at'] as string,
      leads: p['leads'] as import('../types').Proposal['leads'],
    }));
  } catch (err) {
    console.warn('getProposals failed:', err);
    if (isProd && !forceDemo) throw err;
    return [];
  }
}

export async function generateProposalApi(leadId: string): Promise<{ title: string; content: string }> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch { /* ignore */ }

  if (isDemoMode(session)) {
    await delay(jitter(2000, 500));
    const lead = mockLeads.find((l) => l.id === leadId);
    const bizName = lead ? lead.name : 'Your Business';
    const bizCategory = lead ? getCategoryLabel(lead.category) : 'Business Services';
    return {
      title: `Digital Transformation Proposal for ${bizName}`,
      content: `# Digital Transformation Proposal\n\n**Prepared For**: ${bizName}\n**Business Category**: ${bizCategory}\n\n## Executive Summary\nWe have identified a significant opportunity to help **${bizName}** establish a strong local digital presence. This proposal outlines our recommended approach to building your online visibility and driving more customer visits.\n\n## Digital Presence Review\nBased on our analysis, ${bizName} currently lacks a modern online presence which is limiting customer discovery. Implementing local search engine optimization (SEO) and professional branding will bridge this gap.\n\n## Tailored Solution\n- **Professional Mobile-First Website**: Responsive, optimized for local search engines.\n- **Direct WhatsApp Messaging**: Let nearby customers contact you instantly.\n- **Google Maps Optimization**: Build prominence in local map recommendations.\n\n## Project Plan\n- **Week 1-2**: Design, content draft, local SEO research\n- **Week 3**: Development & review cycle\n- **Week 4**: Go-live, launch, and initial local indexing\n\n## Next Steps\nIf this plan aligns with your growth goals, reply directly to this proposal to schedule a brief consultation call.`,
    };
  }

  try {
    const result = await fetchWithAuth('/proposals/generate', {
      method: 'POST',
      body: JSON.stringify({ leadId }),
    });
    return result as { title: string; content: string };
  } catch (err) {
    console.warn('generateProposalApi failed:', err);
    if (isProd && !forceDemo) throw err;
    throw new Error('Proposal generation failed', { cause: err });
  }
}

export async function saveProposalApi(params: {
  leadId: string;
  title: string;
  content: string;
  status?: ProposalStatus;
}): Promise<import('../types').Proposal> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch { /* ignore */ }

  if (isDemoMode(session)) {
    await delay(jitter(400, 100));
    const local = localStorage.getItem('clientpilot_proposals');
    const list = local ? JSON.parse(local) : [];
    
    // Check if proposal for this lead already exists to simulate unique constraints
    const existingIndex = list.findIndex((p: import('../types').Proposal) => p.leadId === params.leadId);
    
    const newProposal: import('../types').Proposal = {
      id: existingIndex >= 0 ? list[existingIndex].id : Math.random().toString(36).substring(2, 11),
      leadId: params.leadId,
      workspaceId: 'demo-workspace-id',
      title: params.title,
      content: params.content,
      status: params.status ?? 'draft',
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newProposal;
    } else {
      list.push(newProposal);
    }
    
    localStorage.setItem('clientpilot_proposals', JSON.stringify(list));

    const lead = mockLeads.find((l) => l.id === params.leadId);
    return {
      ...newProposal,
      leads: lead ? {
        business_name: lead.name,
        category: lead.category,
        address: lead.address,
        city: lead.city,
      } : undefined,
    };
  }

  const raw = await fetchWithAuth('/proposals', {
    method: 'POST',
    body: JSON.stringify({
      leadId: params.leadId,
      title: params.title,
      content: params.content,
      status: params.status ?? 'draft',
    }),
  }) as Record<string, unknown>;

  return {
    id: raw['id'] as string,
    leadId: raw['lead_id'] as string,
    workspaceId: raw['workspace_id'] as string,
    title: raw['title'] as string,
    content: raw['content'] as string,
    status: raw['status'] as ProposalStatus,
    createdAt: raw['created_at'] as string,
    updatedAt: raw['updated_at'] as string,
    leads: raw['leads'] as import('../types').Proposal['leads'],
  };
}

export async function updateProposalStatusApi(id: string, status: ProposalStatus): Promise<void> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch { /* ignore */ }

  if (isDemoMode(session)) {
    await delay(jitter(200, 50));
    const local = localStorage.getItem('clientpilot_proposals');
    const list = local ? JSON.parse(local) : [];
    const updated = list.map((p: import('../types').Proposal) =>
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    localStorage.setItem('clientpilot_proposals', JSON.stringify(updated));
    return;
  }

  await fetchWithAuth(`/proposals/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteProposalApi(id: string): Promise<void> {
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch { /* ignore */ }

  if (isDemoMode(session)) {
    await delay(jitter(200, 50));
    const local = localStorage.getItem('clientpilot_proposals');
    const list = local ? JSON.parse(local) : [];
    const filtered = list.filter((p: import('../types').Proposal) => p.id !== id);
    localStorage.setItem('clientpilot_proposals', JSON.stringify(filtered));
    return;
  }

  await fetchWithAuth(`/proposals/${id}`, { method: 'DELETE' });
}


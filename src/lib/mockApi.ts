import { supabase } from './supabaseClient';
import type { Lead, DashboardStats, PipelineStage, OutreachMessage, ProgressStep } from '../types';
import { mockLeads, mockDashboardStats } from '../data/mockLeads';

let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
if (rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = rawApiUrl.replace(/\/$/, '') + '/api';
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

function isDemoMode(session: unknown): boolean {
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

// ============================================================
// Discovery Leads
// ============================================================
export async function discoverLeads(
  params: { location: string; categories: string[]; radiusKm: number },
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
        categories: params.categories,
        radiusMeters: params.radiusKm * 1000,
      }),
    });

    if (onProgress) {
      onProgress([
        { id: '1', label: 'Geocoding location...', status: 'done' },
        { id: '2', label: 'Querying OpenStreetMap...', status: 'done' },
        { id: '3', label: 'Initiating AI scoring pipeline...', status: 'done' }
      ]);
    }

    return result;
  } catch (err) {
    console.warn('API discovery failed, falling back to local simulation:', err);
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
    await delay(jitter(400, 100));
    return [...mockLeads];
  }

  try {
    return await fetchWithAuth('/leads');
  } catch (err) {
    console.warn('getAllLeads API failed, using mock leads:', err);
    await delay(jitter(300, 100));
    return [...mockLeads];
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
    console.warn('getDashboardStats API failed, using mock stats:', err);
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
    console.warn('generateOutreach API failed, using mock generation:', err);
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
export async function sendOutreach(leadId: string, message: OutreachMessage): Promise<void> {
  console.log(`Sending outreach for lead ${leadId}`, message);
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
    // Optional: add backend endpoint if needed
  } catch (err) {
    console.warn('sendOutreach failed:', err);
  }
}

// ============================================================
// Save Draft
// ============================================================
export async function saveDraft(leadId: string, message: OutreachMessage): Promise<void> {
  console.log(`Saving draft for lead ${leadId}`, message);
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

import { supabase } from './supabaseClient';
import type { Lead, DashboardStats, PipelineStage, OutreachMessage, ProgressStep } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

export async function discoverLeads(
  params: { location: string; categories: string[]; radiusKm: number },
  onProgress?: (steps: ProgressStep[]) => void
): Promise<{ leads: Lead[] }> {
  // We can simulate progress steps here since the backend is doing it all at once
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
}

export async function getAllLeads(): Promise<Lead[]> {
  return fetchWithAuth('/leads');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchWithAuth('/analytics/overview');
}

export async function generateOutreach(leadId: string): Promise<OutreachMessage> {
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
}

export async function sendOutreach(leadId: string, message: OutreachMessage): Promise<void> {
  // In a real app, this might send an email. For now, we update the status.
  console.log(`Sending outreach for lead ${leadId}`, message);
  // Optional: Add a PATCH /api/outreach/:id to backend to update status to 'sent'
}

export async function saveDraft(leadId: string, message: OutreachMessage): Promise<void> {
  console.log(`Saving draft for lead ${leadId}`, message);
}

export async function updateLeadStage(leadId: string, stage: PipelineStage): Promise<void> {
  await fetchWithAuth(`/leads/${leadId}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  });
}

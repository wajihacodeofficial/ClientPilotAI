// ============================================================
// Core Domain Types
// ============================================================

export type PipelineStage = 'discovery' | 'qualified' | 'contacted' | 'client';

export type WebsiteStatus = 'none' | 'outdated' | 'has_website';

export type ScoreBand = 'high' | 'medium' | 'low';

export type BusinessCategory =
  | 'restaurant'
  | 'retail'
  | 'salon'
  | 'clinic'
  | 'auto_service'
  | 'bakery'
  | 'pharmacy'
  | 'tailor'
  | 'cafe'
  | 'gym'
  | 'electronics'
  | 'jewellery'
  | 'real_estate'
  | 'catering';

// ============================================================
// Score Breakdown
// ============================================================

export interface ScoreBreakdown {
  digitalPresenceGap: number; // 0-10
  categoryFit: number; // 0-10
  reviewActivity: number; // 0-10
  marketDensity: number; // 0-10
  competitorPresence: number; // 0-10
}

// ============================================================
// Outreach Message
// ============================================================

export interface OutreachMessage {
  subject: string;
  body: string;
  generatedAt: string; // ISO date string
  variant: number; // 1 or 2 (for "regenerate" toggle)
}

// ============================================================
// Lead (core entity)
// ============================================================

export interface Lead {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  city: 'Karachi' | 'Lahore' | 'Islamabad' | 'Rawalpindi' | 'Faisalabad';
  phone?: string;
  rating?: number; // 1.0 - 5.0
  reviewCount?: number;
  websiteStatus: WebsiteStatus;
  websiteUrl?: string; // only if has_website or outdated
  score: number; // 0-100
  scoreBreakdown: ScoreBreakdown;
  pipelineStage: PipelineStage;
  discoveredAt: string; // ISO date string
  distance?: number; // km from search center
  aiAnalysis: string; // Mock GPT reasoning text
  outreachMessages: [OutreachMessage, OutreachMessage]; // Two variants for "regenerate"
  latitude?: number;
  longitude?: number;
}

// ============================================================
// Discovery / Search
// ============================================================

export interface DiscoveryParams {
  location: string;
  categories: BusinessCategory[];
  radiusKm: number;
}

export interface DiscoveryResult {
  leads: Lead[];
  totalFound: number;
  filteredCount: number;
  searchedAt: string;
}

// ============================================================
// Pipeline
// ============================================================

export interface PipelineColumn {
  stage: PipelineStage;
  label: string;
  leads: Lead[];
}

// ============================================================
// Dashboard Analytics
// ============================================================

export interface StatCard {
  label: string;
  value: number | string;
  trend: number; // percentage change vs last week, can be negative
  sparkline: number[]; // 7 data points
}

export interface ActivityEvent {
  id: string;
  type: 'scored' | 'outreach_sent' | 'stage_changed' | 'discovered';
  leadName: string;
  detail: string;
  timestamp: string; // ISO date string
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  outreachSent: number;
  conversionRate: number;
  leadsPerDay: { date: string; count: number }[];
  funnelData: { stage: string; count: number }[];
  scoreBandData: { band: string; count: number }[];
  recentActivity: ActivityEvent[];
}

// ============================================================
// App State (zustand)
// ============================================================

export interface FilterState {
  scoreBand: ScoreBand | 'all';
  category: BusinessCategory | 'all';
  pipelineStage: PipelineStage | 'all';
  sortBy: 'score' | 'distance' | 'name' | 'discoveredAt';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

export interface AppState {
  leads: Lead[];
  selectedLeadId: string | null;
  filters: FilterState;
  discoveryResults: Lead[];
  isDiscovering: boolean;
  sidebarCollapsed: boolean;
  darkMode: boolean;

  // Actions
  setLeads: (leads: Lead[]) => void;
  setSelectedLeadId: (id: string | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setDiscoveryResults: (leads: Lead[]) => void;
  setIsDiscovering: (val: boolean) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  updateLeadStage: (id: string, stage: PipelineStage) => void;
  updateLeadOutreach: (id: string, message: OutreachMessage) => void;
}

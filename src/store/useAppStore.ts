import { create } from 'zustand'
import type { AppState, FilterState, Lead, PipelineStage, OutreachMessage, Proposal } from '@/types'
import { supabase } from '@/lib/supabaseClient'

const defaultFilters: FilterState = {
  scoreBand: 'all',
  category: 'all',
  pipelineStage: 'all',
  sortBy: 'score',
  sortOrder: 'desc',
  searchQuery: '',
}

export const useAppStore = create<AppState & {
  updateLeadScore: (id: string, scoreData: Record<string, unknown>) => void;
  initRealtime: () => () => void;
}>((set, get) => ({
  leads: [],
  selectedLeadId: null,
  filters: defaultFilters,
  discoveryResults: [],
  isDiscovering: false,
  sidebarCollapsed: false,
  darkMode: false,
  userRole: null,
  userEmail: null,
  proposals: [],


  setLeads: (leads: Lead[]) => set({ leads }),
  setSelectedLeadId: (id: string | null) => set({ selectedLeadId: id }),
  setFilters: (filters: Partial<FilterState>) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setDiscoveryResults: (leads: Lead[]) => set({ discoveryResults: leads }),
  setIsDiscovering: (val: boolean) => set({ isDiscovering: val }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { darkMode: next }
    }),
  setUserRole: (role: 'admin' | 'user' | null) => set({ userRole: role }),
  setUserEmail: (email: string | null) => set({ userEmail: email }),
  updateLeadStage: (id: string, stage: PipelineStage) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, pipelineStage: stage } : l)),
      discoveryResults: state.discoveryResults.map((l) =>
        l.id === id ? { ...l, pipelineStage: stage } : l
      ),
    })),
  updateLeadOutreach: (id: string, message: OutreachMessage) =>
    set((state) => {
      const updater = (l: Lead) =>
        l.id === id
          ? { ...l, outreachMessages: [message, ...(l.outreachMessages ?? [])] as OutreachMessage[] }
          : l;
      return {
        leads: state.leads.map(updater),
        discoveryResults: state.discoveryResults.map(updater),
      };
    }),
    
  updateLeadScore: (id: string, scoreData: Record<string, unknown>) =>
    set((state) => {
      const score = scoreData as {
        overall_score: number;
        digital_presence_gap: number;
        category_fit: number;
        review_activity: number;
        market_density: number;
        competitor_presence: number;
        ai_reasoning: string;
      };
      const updater = (l: Lead) => {
        if (l.id !== id) return l;
        return {
          ...l,
          score: score.overall_score,
          scoreBreakdown: {
            digitalPresenceGap: score.digital_presence_gap,
            categoryFit: score.category_fit,
            reviewActivity: score.review_activity,
            marketDensity: score.market_density,
            competitorPresence: score.competitor_presence,
          },
          aiAnalysis: score.ai_reasoning,
        };
      };
      return {
        leads: state.leads.map(updater),
        discoveryResults: state.discoveryResults.map(updater),
      };
    }),

  setProposals: (proposals: Proposal[]) => set({ proposals }),
  addProposal: (proposal: Proposal) =>
    set((state) => ({
      proposals: [proposal, ...state.proposals.filter((p) => p.id !== proposal.id)],
    })),
  updateProposalStatus: (id: string, status: Proposal['status']) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
    })),
  deleteProposal: (id: string) =>
    set((state) => ({
      proposals: state.proposals.filter((p) => p.id !== id),
    })),

  initRealtime: () => {
    console.log('Initializing Supabase Realtime subscriptions...');
    
    // Subscribe to leads updates (e.g. stage changes by other users)
    const leadsChannel = supabase.channel('leads_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        console.log('Realtime leads change received!', payload);
        if (payload.eventType === 'INSERT') {
           // We might want to fetch full lead data here or push it manually
        }
      })
      .subscribe();

    // Subscribe to lead scores arriving asynchronously
    const scoresChannel = supabase.channel('scores_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_scores' }, (payload) => {
        console.log('Realtime score change received!', payload);
        const record = payload.new as Record<string, unknown>;
        if (record && typeof record['lead_id'] === 'string') {
          get().updateLeadScore(record['lead_id'], record);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(scoresChannel);
    };
  }
}))

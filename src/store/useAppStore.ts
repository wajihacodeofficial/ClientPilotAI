import { create } from 'zustand'
import type { AppState, FilterState, Lead, PipelineStage, OutreachMessage } from '@/types'
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
  updateLeadScore: (id: string, scoreData: any) => void;
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
  updateLeadStage: (id: string, stage: PipelineStage) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, pipelineStage: stage } : l)),
      discoveryResults: state.discoveryResults.map((l) =>
        l.id === id ? { ...l, pipelineStage: stage } : l
      ),
    })),
  updateLeadOutreach: (id: string, message: OutreachMessage) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id
          ? { ...l, outreachMessages: [message, ...(l.outreachMessages || [])] }
          : l
      ),
    })),
    
  updateLeadScore: (id: string, scoreData: any) =>
    set((state) => {
      const updater = (l: Lead) => {
        if (l.id !== id) return l;
        return {
          ...l,
          score: scoreData.overall_score,
          scoreBreakdown: {
            digitalPresenceGap: scoreData.digital_presence_gap,
            categoryFit: scoreData.category_fit,
            reviewActivity: scoreData.review_activity,
            marketDensity: scoreData.market_density,
            competitorPresence: scoreData.competitor_presence,
          },
          aiAnalysis: scoreData.ai_reasoning
        };
      };
      
      return {
        leads: state.leads.map(updater),
        discoveryResults: state.discoveryResults.map(updater),
      };
    }),

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
        if (payload.new && payload.new.lead_id) {
          get().updateLeadScore(payload.new.lead_id, payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(scoresChannel);
    };
  }
}))

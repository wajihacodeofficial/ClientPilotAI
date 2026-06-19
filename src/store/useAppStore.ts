import { create } from 'zustand'
import type { AppState, FilterState, Lead, PipelineStage, OutreachMessage } from '@/types'

const defaultFilters: FilterState = {
  scoreBand: 'all',
  category: 'all',
  pipelineStage: 'all',
  sortBy: 'score',
  sortOrder: 'desc',
  searchQuery: '',
}

export const useAppStore = create<AppState>((set) => ({
  leads: [],
  selectedLeadId: null,
  filters: defaultFilters,
  discoveryResults: [],
  isDiscovering: false,
  sidebarCollapsed: false,
  darkMode: false,

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
          ? { ...l, outreachMessages: [message, l.outreachMessages[1]] as [OutreachMessage, OutreachMessage] }
          : l
      ),
    })),
}))

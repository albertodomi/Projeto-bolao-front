import { create } from 'zustand';
import type { Campaign } from '../types';

interface CampaignFilters {
  status: string;
  search: string;
}

interface CampaignState {
  filters: CampaignFilters;
  setFilters: (filters: Partial<CampaignFilters>) => void;
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign | null) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  filters: {
    status: '',
    search: '',
  },
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  selectedCampaign: null,
  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
}));

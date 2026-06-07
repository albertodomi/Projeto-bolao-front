import { create } from 'zustand';

interface BetFilters {
  status: string; // 'Em aberto', 'Finalizadas', 'Vencedoras', 'Perdedoras'
}

interface BetState {
  filters: BetFilters;
  setFilters: (filters: Partial<BetFilters>) => void;
}

export const useBetStore = create<BetState>((set) => ({
  filters: {
    status: '',
  },
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
}));

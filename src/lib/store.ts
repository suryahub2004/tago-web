import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  dateRange: { from: Date; to: Date };
  setDateRange: (range: { from: Date; to: Date }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  dateRange: {
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  },
  setDateRange: (range) => set({ dateRange: range }),
}));

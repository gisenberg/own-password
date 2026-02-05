import { create } from "zustand";

export type SidebarSection = "all" | "favorites" | "logins";

interface UIState {
  searchQuery: string;
  sidebarSection: SidebarSection;
  showPassword: Record<string, boolean>;

  setSearchQuery: (query: string) => void;
  setSidebarSection: (section: SidebarSection) => void;
  togglePasswordVisibility: (fieldId: string) => void;
  resetPasswordVisibility: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  sidebarSection: "all",
  showPassword: {},

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSidebarSection: (section) => set({ sidebarSection: section }),

  togglePasswordVisibility: (fieldId) =>
    set((state) => ({
      showPassword: {
        ...state.showPassword,
        [fieldId]: !state.showPassword[fieldId],
      },
    })),

  resetPasswordVisibility: () => set({ showPassword: {} }),
}));

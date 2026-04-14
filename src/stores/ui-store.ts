import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  activeModal: string | null;
}

interface UIActions {
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  setActiveModal: (modal: string | null) => void;
  closeAll: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set) => ({
  // State
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  activeModal: null,

  // Actions
  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  toggleCart: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }));
  },

  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  setActiveModal: (modal) => {
    set({ activeModal: modal });
  },

  closeAll: () => {
    set({
      isMobileMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,
      activeModal: null,
    });
  },
}));

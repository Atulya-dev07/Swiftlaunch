import { create } from 'zustand';

export type FooterHintMode = 'normal' | 'actionPanel' | 'detailPane';
export type AppTheme = 'dark' | 'light';

interface UiState {
  theme: AppTheme;
  isVisible: boolean;
  isAnimating: boolean;
  footerHintMode: FooterHintMode;

  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setIsVisible: (visible: boolean) => void;
  setIsAnimating: (animating: boolean) => void;
  setFooterHintMode: (mode: FooterHintMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  isVisible: true,
  isAnimating: false,
  footerHintMode: 'normal',

  setTheme: (theme: AppTheme) => set({ theme }),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  setIsVisible: (isVisible: boolean) => set({ isVisible }),

  setIsAnimating: (isAnimating: boolean) => set({ isAnimating }),

  setFooterHintMode: (footerHintMode: FooterHintMode) => set({ footerHintMode })
}));

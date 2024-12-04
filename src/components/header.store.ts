import { changeLanguage } from 'i18next';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const _useHeaderSettings = create<{
  theme: 'light' | 'dark';
  lang: 'zh' | 'en';
  changeTheme: (val: 'light' | 'dark') => void;
  changeLang: (val: 'zh' | 'en') => void;
  toggleTheme: () => void;
  toggleLang: () => void;
}>();

export const useHeaderSettings = _useHeaderSettings(
  subscribeWithSelector((set) => ({
    theme: 'light',
    lang: 'zh',
    changeTheme: (theme) => set({ theme }),
    changeLang: (lang) => set({ lang }),
    toggleTheme: () =>
      set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    toggleLang: () =>
      set((state) => ({ lang: state.lang === 'zh' ? 'en' : 'zh' })),
  })),
);

useHeaderSettings.subscribe(
  (state) => state.theme,
  (theme) => {
    document.body.setAttribute('data-theme', theme);
  },
);

useHeaderSettings.subscribe(
  (state) => state.lang,
  (lang) => {
    changeLanguage(lang);
  },
);

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

import { DEFAULT_FONTS, FontItem } from './SidebarFontsData';
import { useEditorStore } from './editor.store';

// TODO: 同步上次使用的字体

const _useSidebarStore = create<{
  fonts: FontItem[];
  upsertFont: (font: FontItem) => void;

  customFonts: FontItem[];
  upsertCustomFont: (font: FontItem) => void;
  removeCustomFont: (font: FontItem) => void;
}>();

export const useSidebarStore = _useSidebarStore(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        fonts: [...DEFAULT_FONTS],
        upsertFont: (font) => {
          set({
            fonts: get().fonts.some((f) => f.value === font.value)
              ? get().fonts.map((f) =>
                  f.value === font.value ? { ...f, ...font } : f,
                )
              : [...get().fonts, font],
          });
        },

        customFonts: [],
        upsertCustomFont: (font) => {
          set({
            customFonts: get().customFonts.some((f) => f.value === font.value)
              ? get().customFonts.map((f) =>
                  f.value === font.value ? { ...f, ...font } : f,
                )
              : [...get().customFonts, font],
          });
        },
        removeCustomFont: (font) => {
          set({
            customFonts: get().customFonts.filter(
              (f) => f.value !== font.value,
            ),
          });
        },
      }),
      {
        name: '_pm_sidebar_cache_v0',
      },
    ),
  ),
);

export const resetFontsState = () => {
  const usingFonts = useEditorStore.getState().usingFonts;
  const { fonts, customFonts } = useSidebarStore.getState();
  useSidebarStore.setState({
    fonts: fonts.map((f) => ({
      ...f,
      isLoaded: false,
      isLoaded4Preview: false,
      isUsed: usingFonts.includes(f.value),
    })),
    customFonts: customFonts.map((f) => ({
      ...f,
      isLoaded: false,
      isLoaded4Preview: false,
      isUsed: usingFonts.includes(f.value),
    })),
  });
};
if (document.readyState !== 'loading') {
  resetFontsState();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    resetFontsState();
  });
}

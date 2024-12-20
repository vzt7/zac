import fontsIndex from '@/assets/fonts.json';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

import { FontItem } from './SidebarFontsData';
import { useEditorStore } from './editor.store';

// TODO: 更多字体
const DEFAULT_FONTS: FontItem[] = fontsIndex.map((fontItem) => ({
  ...fontItem,
  value: fontItem.dir,
  isUsed: false,
  isLoaded: false,
}));

export enum SIDEBAR_TABS {
  CANVAS = 'canvas',
  TEMPLATE = 'template',
  SHAPE = 'shape',
  IMAGE = 'image',
  ICON = 'icon',
  FONT = 'font',
  COMPONENT = 'component',
}

const _useSidebarStore = create<{
  currentTab: SIDEBAR_TABS;
  setCurrentTab: (tab: SIDEBAR_TABS) => void;

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
        currentTab: SIDEBAR_TABS.CANVAS,
        setCurrentTab: (tab) => {
          set({ currentTab: tab });
        },

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
// Reset fonts state when the page is loaded (local fonts needs to be loaded)
if (document.readyState !== 'loading') {
  resetFontsState();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    resetFontsState();
  });
}
document.addEventListener('unload', () => {
  resetFontsState();
});

useEditorStore.subscribe(
  (state) => state.usingFonts,
  (usingFonts) => {
    const { fonts, customFonts } = useSidebarStore.getState();
    useSidebarStore.setState({
      fonts: fonts.map((f) => ({
        ...f,
        isUsed: usingFonts.includes(f.value),
      })),
      customFonts: customFonts.map((f) => ({
        ...f,
        isUsed: usingFonts.includes(f.value),
      })),
    });
  },
);

if (import.meta.env.DEV) {
  useSidebarStore.subscribe(
    (state) => state,
    (all) => {
      console.log('[sidebarStore]', all);
    },
  );
}

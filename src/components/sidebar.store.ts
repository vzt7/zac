import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

import { useHeaderStore } from './header.store';

export enum TABS {
  CANVAS = 'canvas',
  TEMPLATE = 'template',
  MATERIAL = 'material',
  FONT = 'font',
  COMPONENT = 'component',
}

const _useSidebarStore = create<{
  fontAddingText?: string;
  changeFontAddingText: (text: string) => void;
}>();

export const useSidebarStore = _useSidebarStore(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        changeFontAddingText: (fontAddingText) => set({ fontAddingText }),
      }),
      {
        name: '_pm_sidebar_cache',
      },
    ),
  ),
);

// useHeaderStore.subscribe(
//   (state) => state.currentProject,
//   (currentProject) => {
//     if (!currentProject?.id) {
//       return;
//     }
//     const { currentTabInfo } = useSidebarStore.getState();
//     if (!currentTabInfo?.projectId) {
//       useSidebarStore.setState({
//         currentTabInfo: {
//           projectId: currentProject?.id,
//         },
//       });
//       return;
//     }

//     if (currentTabInfo.projectId !== currentProject.id) {
//       useSidebarStore.setState({
//         currentTabInfo: {
//           ...currentTabInfo,
//           tab: TABS.CANVAS,
//         },
//       });
//       return;
//     }

//     // 如果当前选择项目和当前 tab 缓存对应的项目相同，则恢复当前选择项以及缓存数据
//   },
// );

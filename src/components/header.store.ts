import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

import type { ProjectCanvas } from './editor.store';

export interface Project {
  id: string;
  name: string;
  canvas?: ProjectCanvas;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const _useHeaderStore = create<{
  theme: 'light' | 'dark';
  lang: 'zh' | 'en';
  changeTheme: (val: 'light' | 'dark') => void;
  changeLang: (val: 'zh' | 'en') => void;
  toggleTheme: () => void;
  toggleLang: () => void;

  projects: Project[];
  changeProject: (val: Project) => void;
  createProject: (val: Project) => void;
  selectProject: (val: Project | null) => void;
  currentProject: Project | null;
}>();

export const useHeaderStore = _useHeaderStore(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        theme: 'dark',
        lang: 'zh',
        changeTheme: (theme) => set({ theme }),
        changeLang: (lang) => set({ lang }),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
          })),
        toggleLang: () =>
          set((state) => ({ lang: state.lang === 'zh' ? 'en' : 'zh' })),

        projects: [],
        changeProject: (project: Project) =>
          set({
            projects: get().projects.map((item) =>
              item.id === project.id ? project : item,
            ),
          }),
        selectProject: (project: Project | null) =>
          set({
            currentProject: project,
            projects: get().projects.map((item) =>
              item.id === project?.id ? project : item,
            ),
          }),
        createProject: (project: Project) => {
          const newProjects = [project, ...get().projects];
          set({ projects: newProjects });
        },
        currentProject: null,
      }),
      {
        name: '_pm_global_cache',
      },
    ),
  ),
);

// 更新 currentProject 后同步更新 projects
useHeaderStore.subscribe(
  (state) => state.projects,
  (projects) => {
    const { currentProject } = useHeaderStore.getState();
    useHeaderStore.setState({
      currentProject:
        projects.find((item) => item.id === currentProject?.id) || null,
    });
  },
);

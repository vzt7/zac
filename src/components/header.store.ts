import { changeLanguage } from 'i18next';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

import type { ProjectCanvas } from './SidebarCanvasesData';

export interface Project {
  id: string;
  name: string;
  canvas?: ProjectCanvas;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const _useHeaderSettings = create<{
  theme: 'light' | 'dark';
  lang: 'zh' | 'en';
  changeTheme: (val: 'light' | 'dark') => void;
  changeLang: (val: 'zh' | 'en') => void;
  toggleTheme: () => void;
  toggleLang: () => void;

  projects: Project[];
  changeProject: (val: Project) => void;
  createProject: (val: Project) => void;
  currentProject: Project | null;
  changeCurrentProject: (val: Project | null) => void;
}>();

export const useHeaderSettings = _useHeaderSettings(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        theme: 'light',
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
        createProject: (project: Project) => {
          const { projects } = useHeaderSettings.getState();
          const newProjects = [project, ...projects];
          useHeaderSettings.setState({ projects: newProjects });
          localStorage.setItem('projects', JSON.stringify(newProjects));
        },
        currentProject: null,
        changeCurrentProject: (project: Project | null) =>
          set({ currentProject: project }),
      }),
      {
        name: '_header_projects',
      },
    ),
  ),
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

// 更新 currentProject 后同步更新 projects
useHeaderSettings.subscribe(
  (state) => state.currentProject,
  (currentProject) => {
    if (currentProject) {
      useHeaderSettings.setState({
        projects: useHeaderSettings
          .getState()
          .projects.map((item) =>
            item.id === currentProject.id ? currentProject : item,
          ),
      });
    }
  },
);

window.addEventListener('DOMContentLoaded', () => {
  const projects = localStorage.getItem('projects');
  if (projects) {
    useHeaderSettings.setState({ projects: JSON.parse(projects) });
  }
});

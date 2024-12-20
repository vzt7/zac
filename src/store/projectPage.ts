import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const _useProjectPageStore = create<{
  isProjectReady: boolean;
  isCanvasReady: boolean;
  isFontsReady: boolean;
}>();

export const useProjectPageStore = _useProjectPageStore(
  subscribeWithSelector((get) => ({
    isProjectReady: false,
    isCanvasReady: false,
    isFontsReady: false,
  })),
);

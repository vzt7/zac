import { debug } from '@/utils/debug';
import { ShapeConfig } from 'konva/lib/Shape';
import type { Stage as StageType } from 'konva/lib/Stage';
import { ComponentProps, MutableRefObject } from 'react';
import { Stage } from 'react-konva';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// 导出 Shape 接口
export interface Shape extends ShapeConfig {
  id: string;
  type: string;
  x: number;
  y: number;
  radius?: number;
  zIndex: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  isSelected?: boolean;
  groupId?: string;
  src?: string;
  opacity?: number;
  blur?: number;
  isLocked?: boolean;
  sides?: number;
  dash?: number[];
  visible?: boolean;
  children?: Shape[];
}

export interface EditorStore {
  stageRef: MutableRefObject<StageType | null>;
  isDragMode: boolean;
  keepShiftKey: boolean;
  scale: number;

  shapes: Shape[];
  setShapes: (shapes: Shape[]) => void;

  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectedShapes: Shape[];

  isSelecting: boolean;
  setIsSelecting: (val: boolean) => void;
  selectionBox: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null;
  setSelectionBox: (
    box: {
      startX: number;
      startY: number;
      width: number;
      height: number;
    } | null,
  ) => void;

  history: Shape[][];
  setHistory: (history: Shape[][]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;

  guides: { x: number; y: number }[];
  setGuides: (guides: { x: number; y: number }[]) => void;

  editorProps: ComponentProps<typeof Stage> & {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  };
  setEditorProps: (editorProps: {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  }) => void;

  safeArea: ShapeConfig & {
    isInitialed?: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  setSafeArea: (
    safeArea: ShapeConfig & {
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) => void;
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    stageRef: { current: null },
    isDragMode: false,
    keepShiftKey: false,
    scale: 1,

    shapes: [],
    setShapes: (shapes) => set({ shapes }),

    selectedIds: [],
    setSelectedIds: (ids) => set({ selectedIds: ids }),
    selectedShapes: [],

    isSelecting: false,
    setIsSelecting: (val) => set({ isSelecting: val }),
    selectionBox: null,
    setSelectionBox: (box) => set({ selectionBox: box }),

    history: [[]],
    setHistory: (history) => set({ history }),
    historyIndex: 0,
    setHistoryIndex: (index) => set({ historyIndex: index }),

    guides: [],
    setGuides: (guides) => set({ guides }),

    editorProps: {
      width: 0,
      height: 0,
      scaleX: 1,
      scaleY: 1,
    },
    setEditorProps: (editorProps) => set({ editorProps }),

    safeArea: {
      isInitialed: false,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    setSafeArea: (safeArea) => set({ safeArea }),
  })),
);

export const getEditorCenter = (
  safeArea: EditorStore['safeArea'],
  editorProps: EditorStore['editorProps'],
) => {
  return {
    x: safeArea.x + editorProps.width / 2 - safeArea.width / 2,
    y: safeArea.y + editorProps.height / 2 - safeArea.height / 2,
  };
};

useEditorStore.subscribe(
  (state) => state.safeArea,
  (safeArea) => {
    console.log(`[safeArea]`, safeArea);
  },
);

useEditorStore.subscribe(
  (state) => state.selectedIds,
  (selectedIds) => {
    const shapes = useEditorStore.getState().shapes;
    const selectedShapes = shapes.filter((shape) =>
      selectedIds?.includes(shape.id),
    );
    useEditorStore.setState({
      selectedShapes,
    });
    debug(`[selectedShapes]`, selectedShapes);
  },
);

window.addEventListener('keydown', (e) => {
  if (e.shiftKey) {
    useEditorStore.setState({ keepShiftKey: true });
  }
});
window.addEventListener('keyup', (e) => {
  if (!e.shiftKey) {
    useEditorStore.setState({ keepShiftKey: false });
  }
});

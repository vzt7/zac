import { debug } from '@/utils/debug';
import { Node as KonvaNode, NodeConfig } from 'konva/lib/Node';
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
  zIndex?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  isSelected?: boolean;
  groupId?: string;
  initialSrc?: string;
  src?: string;
  opacity?: number;
  blur?: number;
  isLocked?: boolean;
  sides?: number;
  dash?: number[];
  visible?: boolean;
  children?: Shape[];
  fontStyle?: string;
  fontWeight?: string;
  textDecoration?: string;
  align?: string;
  isSvgGroup?: boolean;
}

export interface ProjectCanvas {
  id: string;
  name: string;
  category: string;
  safeArea: SafeArea;
}

export interface SafeArea extends ShapeConfig {
  isInitialed?: boolean;
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HistoryState {
  shapes: Shape[];
  stage?: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
  };
  safeArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface EditorStore {
  // project data
  projectId?: string | null;

  stageRef: MutableRefObject<StageType | null>;

  isDragMode: boolean;
  isDrawMode: boolean;
  drawingType: 'free' | null;
  isSelectMode: boolean;
  // TODO:
  isElementEditing: boolean;
  isImageCropping: boolean;

  // 是否按住 shift 键
  keepShiftKey: boolean;
  // 是否按住鼠标中键
  keepMouseMiddleButton: boolean;

  // 正在使用的字体
  usingFonts: string[];
  removeUsingFont: (font: string) => void;

  shapes: Shape[];
  setShapes: (shapes: Shape[]) => void;

  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  selectedShapes: Shape[];

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

  history: HistoryState[];
  setHistory: (history: HistoryState[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;

  editorProps: ComponentProps<typeof Stage> & {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  };
  setEditorProps: (editorProps: {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  }) => void;

  safeArea: SafeArea;
  setSafeArea: (safeArea: SafeArea) => void;

  cacheVersion?: number;
}

const initialState = {
  stageRef: { current: null },

  isDragMode: false,
  isDrawMode: false,
  drawingType: null,
  isSelectMode: false,
  isElementEditing: false,
  isImageCropping: false,

  keepShiftKey: false,
  keepMouseMiddleButton: false,

  usingFonts: [],

  shapes: [],

  selectedIds: [],
  selectedShapes: [],

  selectionBox: null,

  history: [],
  historyIndex: 0,

  editorProps: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
  },

  safeArea: {
    isInitialed: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
};

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    removeUsingFont: (font) => {
      set({
        usingFonts: get().usingFonts.filter((f) => f !== font),
        shapes: get().shapes.map((shape) => ({
          ...shape,
          fontFamily: shape.fontFamily === font ? undefined : shape.fontFamily,
          children: shape.children?.map((child) => ({
            ...child,
            fontFamily:
              child.fontFamily === font ? undefined : child.fontFamily,
          })),
        })),
      });
    },

    setShapes: (shapes) => set({ shapes }),

    setSelectedIds: (ids) => set({ selectedIds: ids }),

    setSelectionBox: (box) => set({ selectionBox: box }),

    setHistory: (history) => set({ history: history.slice(0, 1000) }), // Max 1000 history steps
    setHistoryIndex: (index) => set({ historyIndex: index }),

    setEditorProps: (editorProps) => set({ editorProps }),

    setSafeArea: (safeArea) => set({ safeArea }),
  })),
);

if (import.meta.env.DEV) {
  useEditorStore.subscribe(
    (state) => state,
    (all) => {
      debug(`[editorStore]`, all);
    },
  );
}

useEditorStore.subscribe(
  (state) => state.selectedIds,
  (selectedIds) => {
    const { shapes } = useEditorStore.getState();

    const selectedShapes = shapes.filter((shape) =>
      selectedIds?.includes(shape.id),
    );

    useEditorStore.setState({
      selectedShapes,
    });
    debug(`[selectedShapes]`, selectedShapes);
  },
);

useEditorStore.subscribe(
  (state) => state.shapes,
  (shapes) => {
    const usingFonts = shapes
      .map((shape) => shape?.fontFamily)
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    useEditorStore.setState({ usingFonts });
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

export const resetEditorStore = () => {
  useEditorStore.setState(initialState);
};

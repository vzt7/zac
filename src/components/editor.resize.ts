import { debounce } from 'lodash-es';

import { ELEMENT_EDITOR_WIDTH } from './EditorComponents/ElementEditor';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import { useEditorStore } from './editor.store';

// 限制最小和最大缩放
export const MIN_SCALE = 0.1;
export const MAX_SCALE = 2;

const MIN_WIDTH = 980;
const MIN_HEIGHT = 720;

const debouncedStageDraw = debounce(() => {
  const stageRef = useEditorStore.getState().stageRef;
  if (!stageRef.current) return;
  stageRef.current.draw();
}, 500);

let timeout: NodeJS.Timeout | null = null;

export const fitToScreen = (
  scaleOrScaleFn?: number | ((currentScale: number) => number),
) => {
  const containerWidth =
    window.innerWidth - SIDEBAR_WIDTH - ELEMENT_EDITOR_WIDTH;
  const containerHeight = window.innerHeight - HEADER_HEIGHT;

  const {
    safeArea,
    shapes,
    tempShapes,
    editorProps,
    animations,
    isAnimationPlaying,
  } = useEditorStore.getState();
  if (isAnimationPlaying) {
    // 如果正在播放动画，则不进行缩放，保证动画的流畅性和位置正确
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        fitToScreen(scaleOrScaleFn);
      }, 500);
    }
    return;
  }
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  const scale =
    typeof scaleOrScaleFn === 'function'
      ? scaleOrScaleFn(Math.min(editorProps.scaleX, editorProps.scaleY))
      : scaleOrScaleFn;

  const effectiveWidth = Math.max(containerWidth, MIN_WIDTH);
  const effectiveHeight = Math.max(containerHeight, MIN_HEIGHT);

  const scaleX = scale ?? effectiveWidth / (safeArea.width * 1.5);
  const scaleY = scale ?? effectiveHeight / (safeArea.height * 1.5);
  const _scaleValue = Math.min(scaleX, scaleY);
  const scaleValue = Math.min(Math.max(_scaleValue, MIN_SCALE), MAX_SCALE);

  const newX = (effectiveWidth - safeArea.width * scaleValue) / 2;
  const newY = (effectiveHeight - safeArea.height * scaleValue) / 2;

  const deltaX = newX / scaleValue - safeArea.x;
  const deltaY = newY / scaleValue - safeArea.y;

  // 更新所有 shapes 的位置
  const newShapes = shapes.map((shape) => ({
    ...shape,
    x: shape.x + deltaX,
    y: shape.y + deltaY,
  }));
  const newTempShapes = tempShapes.map((shape) => ({
    ...shape,
    x: shape.x + deltaX,
    y: shape.y + deltaY,
  }));
  const newAnimations = animations?.map((item) => ({
    ...item,
    shapes: item.shapes.map((shapeItem) => ({
      ...shapeItem,
      x: shapeItem.x + deltaX,
      y: shapeItem.y + deltaY,
    })),
  }));

  // 一次性更新所有状态
  useEditorStore.setState({
    editorProps: {
      width: effectiveWidth,
      height: effectiveHeight,
      scaleX: scaleValue,
      scaleY: scaleValue,
    },
    safeArea: {
      ...safeArea,
      x: newX / scaleValue,
      y: newY / scaleValue,
    },
    shapes: newShapes,
    tempShapes: newTempShapes,
    animations: newAnimations,
  });

  debouncedStageDraw();
};

import dayjs from 'dayjs';
import type { Layer as LayerType } from 'konva/lib/Layer';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Node as KonvaNode } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useLayoutEffect, useTransition } from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { ELEMENT_EDITOR_WIDTH } from './EditorComponents/ElementEditor';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import {
  createShape,
  handleCopy,
  handleCut,
  handleDelete,
  handlePaste,
  handleRedo,
  handleSelect,
  handleUndo,
} from './editor.handler';
import { Shape, useEditorStore } from './editor.store';

const isMacOs = () => {
  return (
    navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
    navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
  );
};

// 添加快捷键处理
export const useEditorHotkeys = () => {
  const modKey = isMacOs() ? 'meta' : 'ctrl';
  const _handleDelete = useCallback(() => {
    const { selectedIds } = useEditorStore.getState();
    handleDelete(selectedIds);
  }, []);
  const _handleSelectAll = useCallback(() => {
    const { shapes } = useEditorStore.getState();
    handleSelect(shapes.map((shape) => shape.id));
  }, []);
  useHotkeys(
    `${modKey}+z`,
    handleUndo,
    {
      preventDefault: true,
    },
    [handleUndo],
  );
  useHotkeys(
    `${modKey}+shift+z`,
    handleRedo,
    {
      preventDefault: true,
    },
    [handleRedo],
  );
  useHotkeys(
    'delete',
    _handleDelete,
    {
      preventDefault: true,
    },
    [_handleDelete],
  );
  useHotkeys(
    'backspace',
    _handleDelete,
    {
      preventDefault: true,
    },
    [_handleDelete],
  );
  useHotkeys(
    `${modKey}+c`,
    handleCopy,
    {
      preventDefault: true,
    },
    [handleCopy],
  );
  useHotkeys(
    `${modKey}+v`,
    handlePaste,
    {
      preventDefault: true,
    },
    [handlePaste],
  );
  useHotkeys(
    `${modKey}+x`,
    handleCut,
    {
      preventDefault: true,
    },
    [handleCut],
  );
  useHotkeys(
    `${modKey}+a`,
    _handleSelectAll,
    {
      preventDefault: true,
    },
    [_handleSelectAll],
  );
};

// 添加导出功能
export const useExport = () => {
  const stageRef = useEditorStore((state) => state.stageRef);
  const { safeArea, editorProps } = useEditorStore.getState();

  const exportToPNG = (
    name: string,
    { pixelRatio = 2 }: { pixelRatio?: number } = {},
  ) => {
    const stage = stageRef.current;
    if (!stage) return;

    // const scale = {
    //   x: stage.scaleX(),
    //   y: stage.scaleY(),
    // };

    // 创建临时画布
    const tempStage = stage.clone();

    // 重置缩放以确保导出原始大小
    tempStage.scale({ x: 1, y: 1 });

    // 根据缩放调整裁剪区域
    const adjustedSafeArea = {
      x: safeArea.x,
      y: safeArea.y,
      width: safeArea.width,
      height: safeArea.height,
    };

    // 设置裁剪区域
    tempStage.getLayers()[0].clip({
      x: adjustedSafeArea.x,
      y: adjustedSafeArea.y,
      width: adjustedSafeArea.width,
      height: adjustedSafeArea.height,
    });

    // 导出裁剪后的区域
    const uri = tempStage.toDataURL({
      x: adjustedSafeArea.x,
      y: adjustedSafeArea.y,
      width: adjustedSafeArea.width,
      height: adjustedSafeArea.height,
      pixelRatio,
    });

    // 清理临时画布
    tempStage.destroy();

    // 下载图片
    const link = document.createElement('a');
    link.download = `${name?.replace?.(/\.*png/g, '') || dayjs().format('YYYY-MM-DD')}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToPNG };
};

const getScaledPosition = (
  stage: StageType,
  { x, y }: { x: number; y: number },
) => {
  const stageBox = stage.container().getBoundingClientRect();
  const stagePos = stage.position();
  const scale = {
    x: stage.scaleX(),
    y: stage.scaleY(),
  };

  // 计算位置时考虑缩放
  const position = {
    x: (x - stageBox.left - stagePos.x) / scale.x,
    y: (y - stageBox.top - stagePos.y) / scale.y,
  };

  return position;
};

export const useSelection = (stageRef: React.RefObject<StageType>) => {
  const [_, startTransition] = useTransition();

  // 添加鼠标位置状态
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);

  const isDrawMode = useEditorStore((state) => state.isDrawMode);
  const isDragMode = useEditorStore((state) => state.isDragMode);
  const isSelectMode = useEditorStore((state) => state.isSelectMode);

  const shapes = useEditorStore((state) => state.shapes);

  const handleSelectionMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return;

      if (isDragMode || isDrawMode) return;

      if (e.target !== e.target.getStage()) {
        return;
      }

      const stage = e.target.getStage();
      if (!stage) return;

      // 计算位置时考虑缩放
      const position = getScaledPosition(stage, {
        x: e.evt.clientX,
        y: e.evt.clientY,
      });

      useEditorStore.setState({
        isSelectMode: true,
      });
      setSelectionBox({
        startX: position.x,
        startY: position.y,
        x: Math.round(position.x),
        y: Math.round(position.y),
        width: 0,
        height: 0,
      });
    },
    [isDragMode, isDrawMode],
  );

  const handleSelectionMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragMode || isDrawMode) return;

      const stage = stageRef.current;
      if (!stage) return;

      const position = getScaledPosition(stage, {
        x: e.clientX,
        y: e.clientY,
      });

      if (!isSelectMode || !selectionBox) return;

      // 计算选区的宽度度时也需要考虑缩放
      const width = position.x - selectionBox.startX;
      const height = position.y - selectionBox.startY;

      setSelectionBox({
        ...selectionBox,
        x: Math.round(position.x),
        y: Math.round(position.y),
        width,
        height,
      });
    },
    [isDragMode, isDrawMode, isSelectMode, selectionBox, stageRef],
  );

  const handleSelectionMouseUp = useCallback(() => {
    if (isDragMode || isDrawMode) return;

    if (!isSelectMode || !selectionBox) return;

    // 计算选区范围内的元素，这里不需要修改因为selectionBox已经是基于缩放后的坐标
    const selected = shapes.filter((shape) => {
      const shapeRect = {
        x: shape.x,
        y: shape.y,
        width: shape.width || 0,
        height: shape.height || 0,
      };

      const selectionRect = {
        x:
          selectionBox.width >= 0
            ? selectionBox.startX
            : selectionBox.startX + selectionBox.width,
        y:
          selectionBox.height >= 0
            ? selectionBox.startY
            : selectionBox.startY + selectionBox.height,
        width: Math.abs(selectionBox.width),
        height: Math.abs(selectionBox.height),
      };

      return (
        shapeRect.x < selectionRect.x + selectionRect.width &&
        shapeRect.x + shapeRect.width > selectionRect.x &&
        shapeRect.y < selectionRect.y + selectionRect.height &&
        shapeRect.y + shapeRect.height > selectionRect.y
      );
    });

    if (selected.length > 0) {
      handleSelect(
        selected.filter((item) => !item.isLocked).map((item) => item.id),
      );
    }

    useEditorStore.setState({
      isSelectMode: false,
    });
    setSelectionBox(null);
  }, [isDragMode, isDrawMode, isSelectMode, selectionBox, shapes]);

  useEffect(() => {
    window.addEventListener('mousemove', handleSelectionMouseMove);
    window.addEventListener('mouseup', handleSelectionMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleSelectionMouseMove);
      window.removeEventListener('mouseup', handleSelectionMouseUp);
    };
  }, [handleSelectionMouseMove, handleSelectionMouseUp]);

  return {
    selectionBox,
    handleSelectionMouseDown,
    handleSelectionMouseUp,
    handleSelectionMouseMove,
  };
};

export const useStageDrag = () => {
  const isDragMode = useEditorStore((state) => state.isDragMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        useEditorStore.setState({ isDragMode: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        useEditorStore.setState({ isDragMode: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    isDragMode,
  };
};

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();

    const selectedIds = useEditorStore.getState().selectedIds;
    // 获取选中的元素 IDs
    // const _selectedIds = getSelectedIdsByClickEvent(e);

    // 果没有选中任何元素，直返回
    if (selectedIds.length <= 0) {
      return;
    }

    const stage = e.target.getStage();
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const menuX = e.evt.clientX - stageBox.left;
    const menuY = e.evt.clientY - stageBox.top;

    setContextMenu({
      x: menuX,
      y: menuY,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    setContextMenu,
    handleContextMenu,
    closeContextMenu,
  };
};

export const useResize = ({
  stageRef,
  layerRef,
}: {
  stageRef: React.RefObject<StageType>;
  layerRef: React.RefObject<LayerType>;
}) => {
  const fitToScreen = useCallback((scale?: number) => {
    if (!stageRef.current || !layerRef.current) {
      return;
    }

    const containerWidth =
      window.innerWidth - SIDEBAR_WIDTH - ELEMENT_EDITOR_WIDTH;
    const containerHeight = window.innerHeight - HEADER_HEIGHT;

    const { safeArea, shapes } = useEditorStore.getState();

    const MIN_WIDTH = 980;
    const MIN_HEIGHT = 720;

    const effectiveWidth = Math.max(containerWidth, MIN_WIDTH);
    const effectiveHeight = Math.max(containerHeight, MIN_HEIGHT);

    const scaleX = scale ?? effectiveWidth / (safeArea.width * 1.5);
    const scaleY = scale ?? effectiveHeight / (safeArea.height * 1.5);
    const scaleValue = Math.min(scaleX, scaleY);

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
    });

    // debouncedAddToHistory(newShapes);
    // backgroundRef.current?.draw();
  }, []);

  const handleStageWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const { isDragMode, editorProps } = useEditorStore.getState();
      if (isDragMode) return;

      const scaleBy = 1.1;
      const stage = e.target as StageType;
      if (!stage) return;

      // 限制最小和最大缩放
      const MIN_SCALE = 0.5;
      const MAX_SCALE = 1.5;
      const oldScale = editorProps.scaleX;
      if (e.evt.deltaY > 0) {
        const scale = oldScale / scaleBy;
        fitToScreen(Math.max(scale, MIN_SCALE));
      } else {
        const scale = oldScale * scaleBy;
        fitToScreen(Math.min(scale, MAX_SCALE));
      }
    },
    [fitToScreen],
  );

  useLayoutEffect(() => {
    const debouncedFitToScreen = debounce(() => {
      requestAnimationFrame(() => {
        fitToScreen();
      });
    }, 200);

    debouncedFitToScreen();
    window.addEventListener('resize', debouncedFitToScreen);
    return () => {
      window.removeEventListener('resize', debouncedFitToScreen);
    };
  }, [fitToScreen]);

  return {
    fitToScreen,
    handleStageWheel,
  };
};

interface SnapLine extends Shape {
  points: number[];
  orientation: 'V' | 'H';
}

interface SnapPoint {
  guide: number;
  offset: number;
  orientation: 'V' | 'H';
}

interface UseSnapProps {
  shapes: KonvaNode[];
  threshold: number;
  enabled: boolean;
  scale: number;
}

export const useSnap = ({
  shapes,
  threshold,
  enabled,
  scale,
}: UseSnapProps) => {
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  const handleDrag = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      if (!enabled) return;

      const draggedNode = e.target;
      const stage = draggedNode.getStage();
      if (!stage) return;

      const draggedRect = draggedNode.getClientRect({ relativeTo: stage });
      const nodeX = draggedRect.x;
      const nodeY = draggedRect.y;
      const nodeWidth = draggedRect.width;
      const nodeHeight = draggedRect.height;

      // 计算拖动元素的关键点
      const nodeCenterX = nodeX + nodeWidth / 2;
      const nodeCenterY = nodeY + nodeHeight / 2;
      const nodeRight = nodeX + nodeWidth;
      const nodeBottom = nodeY + nodeHeight;

      const snapPoints: SnapPoint[] = [];

      // 获取 safeArea
      const { safeArea } = useEditorStore.getState();
      const safeAreaCenterX = safeArea.x + safeArea.width / 2;
      const safeAreaCenterY = safeArea.y + safeArea.height / 2;
      const safeAreaRight = safeArea.x + safeArea.width;
      const safeAreaBottom = safeArea.y + safeArea.height;

      // safeArea 吸附点
      const safeAreaSnapPoints = [
        // 左边缘
        { point: nodeX, guide: safeArea.x, orientation: 'V' },
        // 右边缘
        { point: nodeRight, guide: safeAreaRight, orientation: 'V' },
        // 水平中心线
        { point: nodeCenterX, guide: safeAreaCenterX, orientation: 'V' },
        // 顶边缘
        { point: nodeY, guide: safeArea.y, orientation: 'H' },
        // 底边缘
        { point: nodeBottom, guide: safeAreaBottom, orientation: 'H' },
        // 垂直中心线
        { point: nodeCenterY, guide: safeAreaCenterY, orientation: 'H' },

        // 元素边缘对齐到 safeArea 中心
        { point: nodeX, guide: safeAreaCenterX, orientation: 'V' },
        { point: nodeRight, guide: safeAreaCenterX, orientation: 'V' },
        { point: nodeY, guide: safeAreaCenterY, orientation: 'H' },
        { point: nodeBottom, guide: safeAreaCenterY, orientation: 'H' },

        // 元素中心对齐到 safeArea 边缘
        { point: nodeCenterX, guide: safeArea.x, orientation: 'V' },
        { point: nodeCenterX, guide: safeAreaRight, orientation: 'V' },
        { point: nodeCenterY, guide: safeArea.y, orientation: 'H' },
        { point: nodeCenterY, guide: safeAreaBottom, orientation: 'H' },
      ];

      // 检查 safeArea 吸附
      const adjustedThreshold = threshold / scale;
      safeAreaSnapPoints.forEach(({ point, guide, orientation }) => {
        if (Math.abs(point - guide) < adjustedThreshold) {
          snapPoints.push({
            guide,
            offset: point - guide,
            orientation: orientation as 'V' | 'H',
          });
        }
      });

      // 检查其他元素的吸附
      shapes.forEach((shape) => {
        if (shape === draggedNode) return;

        const shapeRect = shape.getClientRect({ relativeTo: stage });
        const shapeX = shapeRect.x;
        const shapeY = shapeRect.y;
        const shapeWidth = shapeRect.width;
        const shapeHeight = shapeRect.height;
        const shapeCenterX = shapeX + shapeWidth / 2;
        const shapeCenterY = shapeY + shapeHeight / 2;
        const shapeRight = shapeX + shapeWidth;
        const shapeBottom = shapeY + shapeHeight;

        const adjustedThreshold = threshold / scale;

        // 水平对齐检查
        const horizontalSnapPoints = [
          // 左边对齐
          { point: nodeX, guide: shapeX },
          { point: nodeX, guide: shapeCenterX },
          { point: nodeX, guide: shapeRight },
          // 中心对齐
          { point: nodeCenterX, guide: shapeX },
          { point: nodeCenterX, guide: shapeCenterX },
          { point: nodeCenterX, guide: shapeRight },
          // 右边对齐
          { point: nodeRight, guide: shapeX },
          { point: nodeRight, guide: shapeCenterX },
          { point: nodeRight, guide: shapeRight },
        ];

        // 垂直对齐检查
        const verticalSnapPoints = [
          // 顶部对齐
          { point: nodeY, guide: shapeY },
          { point: nodeY, guide: shapeCenterY },
          { point: nodeY, guide: shapeBottom },
          // 中心对齐
          { point: nodeCenterY, guide: shapeY },
          { point: nodeCenterY, guide: shapeCenterY },
          { point: nodeCenterY, guide: shapeBottom },
          // 底部对齐
          { point: nodeBottom, guide: shapeY },
          { point: nodeBottom, guide: shapeCenterY },
          { point: nodeBottom, guide: shapeBottom },
        ];

        // 检查水平吸附点
        horizontalSnapPoints.forEach(({ point, guide }) => {
          if (Math.abs(point - guide) < adjustedThreshold) {
            snapPoints.push({
              guide,
              offset: point - guide,
              orientation: 'V',
            });
          }
        });

        // 检查垂直吸附点
        verticalSnapPoints.forEach(({ point, guide }) => {
          if (Math.abs(point - guide) < adjustedThreshold) {
            snapPoints.push({
              guide,
              offset: point - guide,
              orientation: 'H',
            });
          }
        });
      });

      // 应用吸附效果
      if (snapPoints.length) {
        const verticalSnaps = snapPoints.filter(
          (point) => point.orientation === 'V',
        );
        const horizontalSnaps = snapPoints.filter(
          (point) => point.orientation === 'H',
        );

        const minVertical = verticalSnaps.length
          ? verticalSnaps.reduce(
              (min, point) =>
                Math.abs(point.offset) < Math.abs(min.offset) ? point : min,
              verticalSnaps[0],
            )
          : null;

        const minHorizontal = horizontalSnaps.length
          ? horizontalSnaps.reduce(
              (min, point) =>
                Math.abs(point.offset) < Math.abs(min.offset) ? point : min,
              horizontalSnaps[0],
            )
          : null;

        // 更新节点位置
        const newPosition = {
          x: draggedNode.x(),
          y: draggedNode.y(),
        };

        if (minVertical) {
          newPosition.x -= minVertical.offset;
        }
        if (minHorizontal) {
          newPosition.y -= minHorizontal.offset;
        }

        draggedNode.position(newPosition);

        // 更���吸附线
        const newSnapLines: SnapLine[] = [];

        if (minVertical) {
          newSnapLines.push(
            createShape('line', {
              points: [
                minVertical.guide,
                Math.min(safeArea.y, nodeY), // 限制吸附线范围在 safeArea 附近
                minVertical.guide,
                Math.max(safeAreaBottom, nodeBottom),
              ],
              orientation: 'V',
            }) as SnapLine,
          );
        }

        if (minHorizontal) {
          newSnapLines.push(
            createShape('line', {
              points: [
                Math.min(safeArea.x, nodeX), // 限制吸附线范围在 safeArea 附近
                minHorizontal.guide,
                Math.max(safeAreaRight, nodeRight),
                minHorizontal.guide,
              ],
              orientation: 'H',
            }) as SnapLine,
          );
        }

        setSnapLines(newSnapLines);
      } else {
        setSnapLines([]);
      }
    },
    [enabled, shapes, threshold, scale],
  );

  const handleDragEnd = useCallback(() => {
    setSnapLines([]);
  }, []);

  return {
    snapLines,
    handleDrag,
    handleDragEnd,
  };
};

// export const useFreeDraw = () => {
//   const [lines, setLines] = useState<
//     NonNullable<ReturnType<typeof createShape>>[]
//   >([]);
//   const shapes = useEditorStore((state) => state.shapes);
//   const drawingType = useEditorStore((state) => state.drawingType);
//   const isFreeDrawing = drawingType === 'free';

//   const handleFreeDrawMouseDown = (e: KonvaEventObject<MouseEvent>) => {
//     if (!isFreeDrawing) return;

//     const stage = e.target.getStage();
//     if (!stage) return;

//     const position = stage.getRelativePointerPosition();
//     if (!position) return;

//     setLines([
//       ...lines,
//       createShape('freedraw', {
//         id: `freedraw-${Date.now()}`,
//         type: 'freedraw',
//         isLocked: false,
//         x: position.x,
//         y: position.y,
//         // scaleX: stage.scaleX(),
//         // scaleY: stage.scaleY(),
//         points: [0, 0, 0, 0],
//         draggable: true,
//       })!,
//     ]);
//   };

//   const handleFreeDrawMouseMove = (e: KonvaEventObject<MouseEvent>) => {
//     if (!isFreeDrawing) return;

//     const stage = e.target.getStage();
//     if (!stage) return;

//     // 计算相对于舞台的实际位置，考虑缩放
//     // const position = getScaledPosition(stage, {
//     //   x: e.evt.clientX,
//     //   y: e.evt.clientY,
//     // });
//     const position = stage.getRelativePointerPosition();
//     if (!position) return;

//     const lastLine = lines[lines.length - 1];
//     if (!lastLine) return;

//     setLines(
//       lines.map((line, i) =>
//         i === lines.length - 1
//           ? {
//               ...line,
//               points: [
//                 ...line.points,
//                 (position.x - line.x) / stage.scaleX(),
//                 (position.y - line.y) / stage.scaleY(),
//               ],
//             }
//           : line,
//       ) as Shape[],
//     );
//   };

//   const handleFreeDrawMouseUp = (e: KonvaEventObject<MouseEvent>) => {
//     if (!isFreeDrawing) return;

//     // 计算绘制内容的边界框
//     const points = lines[0]?.points || [];
//     if (points.length < 4) return;

//     const stage = e.target.getStage();
//     if (!stage) return;

//     let minX = Infinity;
//     let minY = Infinity;
//     let maxX = -Infinity;
//     let maxY = -Infinity;

//     // 计算边界框
//     for (let i = 0; i < points.length; i += 2) {
//       const x = points[i];
//       const y = points[i + 1];
//       minX = Math.min(minX, x);
//       minY = Math.min(minY, y);
//       maxX = Math.max(maxX, x);
//       maxY = Math.max(maxY, y);
//     }

//     const width = maxX - minX;
//     const height = maxY - minY;

//     const newShapes = lines.filter(Boolean).map((line) => ({
//       ...line,
//       width: width * stage.scaleX(),
//       height: height * stage.scaleY(),
//     }));

//     useEditorStore.setState({
//       shapes: [...shapes, ...newShapes],
//     });
//     addToHistory([...shapes, ...newShapes]);
//     setLines([]);
//   };

//   return {
//     lines,
//     isFreeDrawing,
//     drawingType,
//     handleFreeDrawMouseDown,
//     handleFreeDrawMouseMove,
//     handleFreeDrawMouseUp,
//   };
// };

import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import { useCallback, useEffect, useTransition } from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import {
  getSelectedIdsByClickEvent,
  handleClick,
  handleDelete,
  handleRedo,
  handleSelect,
  handleUndo,
} from './editor.handler';
import { Shape, getEditorCenter, useEditorStore } from './editor.store';

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
  useHotkeys(`${modKey}+z`, handleUndo, [handleUndo]);
  useHotkeys(`${modKey}+shift+z`, handleRedo, [handleRedo]);
  useHotkeys('delete', _handleDelete, [_handleDelete]);
};

// 添加对齐和分布功能
export const useAlignment = (
  shapes: Shape[],
  setShapes: (shapes: Shape[]) => void,
) => {
  const alignShapes = (
    direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
  ) => {
    const selectedShapes = shapes.filter((shape) => shape.isSelected);
    if (selectedShapes.length < 2) return;

    const bounds = selectedShapes.reduce(
      (acc, shape) => {
        const left = shape.x;
        const right = shape.x + (shape.width || 0);
        const top = shape.y;
        const bottom = shape.y + (shape.height || 0);

        return {
          left: Math.min(acc.left, left),
          right: Math.max(acc.right, right),
          top: Math.min(acc.top, top),
          bottom: Math.max(acc.bottom, bottom),
        };
      },
      { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
    );

    const newShapes = shapes.map((shape) => {
      if (!shape.isSelected) return shape;

      let updates = {};
      switch (direction) {
        case 'left':
          updates = { x: bounds.left };
          break;
        case 'center':
          updates = {
            x:
              bounds.left +
              (bounds.right - bounds.left) / 2 -
              (shape.width || 0) / 2,
          };
          break;
        case 'right':
          updates = { x: bounds.right - (shape.width || 0) };
          break;
        case 'top':
          updates = { y: bounds.top };
          break;
        case 'middle':
          updates = {
            y:
              bounds.top +
              (bounds.bottom - bounds.top) / 2 -
              (shape.height || 0) / 2,
          };
          break;
        case 'bottom':
          updates = { y: bounds.bottom - (shape.height || 0) };
          break;
      }

      return { ...shape, ...updates };
    });

    setShapes(newShapes);
  };

  return { alignShapes };
};

// 添加导出功能
export const useExport = (stageRef: React.RefObject<any>) => {
  const { safeArea, editorProps } = useEditorStore.getState();
  const editorCenter = getEditorCenter(safeArea, editorProps);

  const exportToPNG = () => {
    if (!stageRef.current) return;

    // 创建临时画布
    const tempStage = stageRef.current.clone();

    // 设置裁剪区域为 safeArea
    tempStage.findOne('Layer').clip({
      x: editorCenter.x,
      y: editorCenter.y,
      width: safeArea.width,
      height: safeArea.height,
    });

    // 导出裁剪后的区域
    const uri = tempStage.toDataURL({
      x: editorCenter.x,
      y: editorCenter.y,
      width: safeArea.width,
      height: safeArea.height,
      pixelRatio: 2, // 提高导出质量
    });

    // 清理临时画布
    tempStage.destroy();

    // 下载图片
    const link = document.createElement('a');
    link.download = 'stage.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToSVG = () => {
    if (!stageRef.current) return;

    // 创建临时画布
    const tempStage = stageRef.current.clone();

    // 设置裁剪区域为 safeArea
    tempStage.findOne('Layer').clip({
      x: editorCenter.x,
      y: editorCenter.y,
      width: safeArea.width,
      height: safeArea.height,
    });

    // 导出裁剪后的区域
    const svg = tempStage.toSVG({
      x: editorCenter.x,
      y: editorCenter.y,
      width: safeArea.width,
      height: safeArea.height,
    });

    // 清理临时画布
    tempStage.destroy();

    // 下载 SVG
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'stage.svg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { exportToPNG, exportToSVG };
};

export const useSelection = (stageRef: React.RefObject<StageType>) => {
  const [_, startTransition] = useTransition();

  // 添加鼠标位置状态
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return;

      const isDragMode = useEditorStore.getState().isDragMode;
      if (isDragMode) return;

      if (e.target === e.target.getStage()) {
        const stage = e.target.getStage();
        if (!stage) return;

        const stageBox = stage.container().getBoundingClientRect();
        const stagePos = stage.position();
        const scale = {
          x: stage.scaleX(),
          y: stage.scaleY(),
        };

        // 计算位置时考虑缩放
        const position = {
          x: (e.evt.clientX - stageBox.left - stagePos.x) / scale.x,
          y: (e.evt.clientY - stageBox.top - stagePos.y) / scale.y,
        };

        useEditorStore.setState({
          selectionBox: {
            startX: position.x,
            startY: position.y,
            width: 0,
            height: 0,
          },
          isSelecting: true,
        });
      }
    },
    [],
  );

  const handleStageMouseMove = useCallback((e: MouseEvent) => {
    const stage = stageRef.current;
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const stagePos = stage.position();
    const scale = {
      x: stage.scaleX(),
      y: stage.scaleY(),
    };

    // 计算相对于舞台的实际位置，考虑缩放
    const position = {
      x: (e.clientX - stageBox.left - stagePos.x) / scale.x,
      y: (e.clientY - stageBox.top - stagePos.y) / scale.y,
    };

    startTransition(() => {
      setMousePosition({
        x: Math.round(position.x),
        y: Math.round(position.y),
      });
    });

    const { isSelecting, selectionBox } = useEditorStore.getState();
    if (!isSelecting || !selectionBox) return;

    // 计算选区的宽度和高度时也需要考虑缩放
    const width = position.x - selectionBox.startX;
    const height = position.y - selectionBox.startY;

    startTransition(() => {
      useEditorStore.setState({
        selectionBox: {
          ...selectionBox,
          width,
          height,
        },
      });
    });
  }, []);

  const handleStageMouseUp = useCallback(() => {
    const { isSelecting, selectionBox, shapes } = useEditorStore.getState();
    if (!isSelecting || !selectionBox) return;

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
      selectionBox: null,
      isSelecting: false,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleStageMouseMove);
    window.addEventListener('mouseup', handleStageMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleStageMouseMove);
      window.removeEventListener('mouseup', handleStageMouseUp);
    };
  }, [handleStageMouseMove, handleStageMouseUp]);

  return {
    mousePosition,
    handleStageMouseDown,
    handleStageMouseUp,
    handleStageMouseMove,
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

    // const handleMouseDown = (e: MouseEvent) => {
    //   if (e.button === 1) {
    //     // 中键
    //     useEditorStore.setState({ isDragMode: true });
    //   }
    // };

    // const handleMouseUp = (e: MouseEvent) => {
    //   if (e.button === 1) {
    //     useEditorStore.setState({ isDragMode: false });
    //   }
    // };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // window.addEventListener('mousedown', handleMouseDown);
    // window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // window.removeEventListener('mousedown', handleMouseDown);
      // window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return {
    isDragMode,
  };
};

export const useContextMenu = (mousePosition: { x: number; y: number }) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();

    const selectedIds = useEditorStore.getState().selectedIds;
    // 获取选中的元素 IDs
    // const _selectedIds = getSelectedIdsByClickEvent(e);

    // 如果没有选中任何元素，直接返回
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

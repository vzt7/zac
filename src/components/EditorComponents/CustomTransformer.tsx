import { Rect } from 'konva/lib/shapes/Rect';
import { useEffect, useRef, useState } from 'react';
import { Transformer } from 'react-konva';

import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';

export const CustomTransformer = () => {
  const transformerRef = useRef<any>(null);
  const theme = useHeaderStore((state) => state.theme);
  const keepShiftKey = useEditorStore((state) => state.keepShiftKey);
  const isElementEditing = useEditorStore((state) => state.isElementEditing);

  const colors = {
    light: {
      primary: '#6419E6',
      border: '#D1D5DB',
      anchor: '#FFFFFF',
    },
    dark: {
      primary: '#8B5CF6',
      border: '#4B5563',
      anchor: '#FFFFFF',
    },
  };

  const currentTheme = theme === 'light' ? colors.light : colors.dark;

  const selectedIds = useEditorStore((state) => state.selectedIds);
  useEffect(() => {
    if (transformerRef.current) {
      // 监听 selectedIds 的变化，更新 transformer 的节点
      const stage = transformerRef.current.getStage();
      const selectedNodes = selectedIds
        .map((_id) => stage!.findOne(`#${_id}`))
        .filter((item): item is NonNullable<typeof item> => Boolean(item));
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  if (isElementEditing) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      // Should we fill whole transformer area with fake transparent shape to enable dragging from empty spaces?
      shouldOverdrawWholeArea={true}
      enabledAnchors={[
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ]}
      rotateAnchorOffset={40}
      rotateAnchorCursor={'grab'}
      // anchorCornerRadius={12}
      anchorSize={12}
      anchorFill={currentTheme.anchor}
      anchorStroke={currentTheme.border}
      anchorStrokeWidth={2}
      borderStroke={currentTheme.primary}
      borderStrokeWidth={2}
      // borderDash={[4, 4]}
      padding={0}
      centeredScaling={keepShiftKey}
      anchorStyleFunc={(anchor: Rect) => {
        anchor.cornerRadius(10);
        if (anchor.hasName('top-center') || anchor.hasName('bottom-center')) {
          anchor.height(6);
          anchor.offsetY(3);
          anchor.width(30);
          anchor.offsetX(15);
        }
        if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
          anchor.height(30);
          anchor.offsetY(15);
          anchor.width(6);
          anchor.offsetX(3);
        }
      }}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }}
      anchorDragBoundFunc={(oldPos, newPos, evt) => {
        return newPos;
      }}
      onMouseOver={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          const name = e.target.name();
          if (!name) return;

          let cursor = 'move';
          if (name.indexOf('middle') !== -1) {
            cursor = 'ew-resize';
          } else if (name.indexOf('center') !== -1) {
            cursor = 'ns-resize';
          } else if (
            name.indexOf('top-left') !== -1 ||
            name.indexOf('bottom-right') !== -1
          ) {
            cursor = 'nwse-resize';
          } else if (
            name.indexOf('top-right') !== -1 ||
            name.indexOf('bottom-left') !== -1
          ) {
            cursor = 'nesw-resize';
          }

          stage.container().style.cursor = cursor;
        }
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'default';
        }
      }}
    />
  );
};

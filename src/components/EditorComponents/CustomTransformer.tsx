import { Rect } from 'konva/lib/shapes/Rect';
import { useEffect, useRef, useState } from 'react';
import { Transformer } from 'react-konva';

import { useEditorStore } from '../editor.store';
import { useHeaderSettings } from '../header.store';

interface CustomTransformerProps {
  selectedNodes: any[];
}

export const CustomTransformer = ({
  selectedNodes,
}: CustomTransformerProps) => {
  const transformerRef = useRef<any>(null);
  const theme = useHeaderSettings((state) => state.theme);
  const keepShiftKey = useEditorStore((state) => state.keepShiftKey);

  const selectedShapes = useEditorStore((state) => state.selectedShapes);
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

  useEffect(() => {
    if (transformerRef.current) {
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedNodes]);

  if (isElementEditing) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      // shouldOverdrawWholeArea={false}
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
      keepRatio={!keepShiftKey}
      centeredScaling={true}
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
      onMouseEnter={(e) => {
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

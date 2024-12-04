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
  const keepAspectRatio = useEditorStore((state) => state.keepShiftKey);
  console.log(`[keepAspectRatio]`, keepAspectRatio);

  const colors = {
    light: {
      primary: '#570DF8',
      border: '#E5E6E6',
      background: '#FFFFFF',
    },
    dark: {
      primary: '#661AE6',
      border: '#374151',
      background: '#2A303C',
    },
  };

  const currentTheme = theme === 'light' ? colors.light : colors.dark;

  useEffect(() => {
    if (transformerRef.current) {
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedNodes]);

  return (
    <>
      <Transformer
        ref={transformerRef}
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
        anchorCornerRadius={12}
        anchorStroke={currentTheme.primary}
        anchorFill={currentTheme.primary}
        anchorSize={10}
        anchorStrokeWidth={0}
        borderStroke={currentTheme.primary}
        borderStrokeWidth={2}
        // borderDash={[4, 4]}
        padding={8}
        keepRatio={keepAspectRatio}
        centeredScaling={false}
        anchorStyleFunc={(anchor: Rect) => {
          const name = anchor.name();
          if (name?.indexOf('middle') !== -1) {
            return {
              width: 2,
              height: 20,
              offsetX: 1,
              offsetY: 10,
            };
          }
          if (name?.indexOf('center') !== -1) {
            return {
              width: 20,
              height: 2,
              offsetX: 10,
              offsetY: 1,
            };
          }
          return {
            width: 7,
            height: 7,
            offsetX: 3.5,
            offsetY: 3.5,
          };
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

            let cursor = 'pointer';
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
    </>
  );
};

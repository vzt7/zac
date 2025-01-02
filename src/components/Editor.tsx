import clsx from 'clsx';
import type { Layer as LayerType } from 'konva/lib/Layer';
import { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import type { Rect as RectType } from 'konva/lib/shapes/Rect';
import { useEffect, useMemo, useRef } from 'react';
import { Group, Rect as KonvaRect, Layer, Line, Stage } from 'react-konva';

import { Debugger } from './Debugger';
import { AutoSaveIndicator } from './EditorComponents/AutoSaveIndicator';
import { ContextMenu } from './EditorComponents/ContextMenu';
import { ControlPanel4Scale } from './EditorComponents/ControlPanel4Scale';
import { CustomTransformer } from './EditorComponents/CustomTransformer';
import { SourcePanel } from './EditorComponents/ElementEditorSourcePanel';
import { renderShape } from './EditorComponents/Elements';
import { HelpCenter } from './EditorComponents/HelpCenter';
import { LayersPanel } from './EditorComponents/LayerPanel';
import {
  handleBackgroundClip,
  handleDragEnd,
  handleFileDrop,
  handleShapeClick,
  handleStageClick,
  handleStageDragMove,
  handleTransformEnd,
} from './editor.handler';
import {
  useContextMenu,
  useEditorHotkeys,
  useResize,
  useSelection,
  useStageDrag,
} from './editor.hook';
import { useSnap } from './editor.hook';
import { useEditorStore } from './editor.store';

export const Editor = () => {
  const stageRef = useRef<StageType>(null);
  const layerRef = useRef<LayerType>(null);
  const backgroundRef = useRef<RectType>(null);
  const storeStageRef = useEditorStore((state) => state.stageRef);
  if (!storeStageRef.current && stageRef.current) {
    useEditorStore.setState({ stageRef });
  }

  // 画布
  const editorProps = useEditorStore((state) => state.editorProps);
  const safeArea = useEditorStore((state) => state.safeArea);
  // 选择
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);
  const reversedShapes = useMemo(() => [...shapes].reverse(), [shapes]);
  // 绘制模式
  const isDrawMode = useEditorStore((state) => state.isDrawMode);
  // 选择
  const { selectionBox, handleSelectionMouseDown } = useSelection(stageRef);
  // 上下文菜单
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();
  // 缩放
  const { fitToScreen, handleStageWheel } = useResize();
  // 画布拖拽
  const { isDragMode } = useStageDrag();
  // 对齐辅助线
  const {
    snapLines,
    handleDrag: handleSnapDrag,
    handleDragEnd: handleSnapDragEnd,
  } = useSnap({
    threshold: 5 / editorProps.scaleX,
    enabled: !isDragMode && selectedIds.length <= 1,
    scale: editorProps.scaleX,
  });
  // 绘画
  // const {
  //   lines,
  //   isFreeDrawing,
  //   drawingType,
  //   handleFreeDrawMouseDown,
  //   handleFreeDrawMouseMove,
  //   handleFreeDrawMouseUp,
  // } = useFreeDraw();

  // 添加快捷键支持
  useEditorHotkeys();

  useEffect(() => {
    if (!safeArea.id) {
      return;
    }
    fitToScreen();
  }, [safeArea.id, fitToScreen]);

  const isAnimationPlaying = useEditorStore(
    (state) => state.isAnimationPlaying,
  );

  return (
    <div
      className={clsx(
        `relative w-full h-full overflow-hidden transparent-bg-img`,
        !import.meta.env.DEV &&
          isAnimationPlaying &&
          '!cursor-not-allowed pointer-events-none',
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        handleFileDrop(e);
      }}
    >
      <div
        className={clsx(
          'absolute w-full h-full border-4 border-accent z-10 transition-all pointer-events-none',
          isAnimationPlaying ? 'opacity-100' : 'opacity-0',
        )}
      ></div>

      <Stage
        {...editorProps}
        ref={stageRef}
        className={clsx(isDragMode && '!cursor-grab')}
        onContextMenu={handleContextMenu}
        onMouseDown={(e) => {
          // handleFreeDrawMouseDown(e);

          handleSelectionMouseDown(e);
        }}
        onMouseMove={(e) => {
          // handleFreeDrawMouseMove(e);
        }}
        onMouseUp={(e) => {
          // handleFreeDrawMouseUp(e);
        }}
        onMouseLeave={(e) => {
          // handleFreeDrawMouseUp(e);
        }}
        onDragMove={handleStageDragMove}
        onWheel={handleStageWheel}
        onClick={(e) => {
          if (isDragMode || isDrawMode) {
            return;
          }

          handleStageClick(e);
        }}
        draggable={isDragMode}
      >
        <Layer ref={layerRef} listening={!isDragMode && !isDrawMode}>
          {/* safeArea 边框 */}
          <KonvaRect
            listening={false}
            fill="#FFFFFF"
            strokeWidth={1}
            shadowColor="black"
            shadowBlur={50}
            shadowOpacity={0.5}
            shadowOffset={{ x: 0, y: 0 }}
            {...safeArea}
          />

          {reversedShapes.map((shape) => {
            return renderShape({
              ...shape,
              listening: shape.isLocked ? false : shape.listening,
              draggable: true,
              onTransformEnd: handleTransformEnd,
              onClick: handleShapeClick,
              onDragEnd: (e: any) => {
                handleDragEnd(e);
                handleSnapDragEnd();
              },
              onDragMove: (e: KonvaEventObject<DragEvent>) => {
                if (selectedIds.length <= 5) {
                  // 5个元素以上节省性能，不处理吸附
                  handleSnapDrag(e);
                }
              },
              onMouseEnter: (e: any) => {
                if (shape.isLocked || !shape.visible) {
                  return;
                }
                const container = e.target.getStage().container();
                container.style.cursor = 'move';
              },
              onMouseLeave: (e: any) => {
                if (shape.isLocked || !shape.visible) {
                  return;
                }
                const container = e.target.getStage().container();
                container.style.cursor = 'default';
              },
            });
          })}

          {snapLines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="hsl(var(--p))"
              strokeWidth={2 / editorProps.scaleX}
              dash={[6 / editorProps.scaleX, 3 / editorProps.scaleX]}
              opacity={0.5}
              shadowColor="hsl(var(--p))"
              shadowBlur={2 / editorProps.scaleX}
              shadowOpacity={0.2}
              listening={false}
            />
          ))}

          {!isDragMode && !isDrawMode && <CustomTransformer />}

          {/* 渲染选区 */}
          {selectionBox && (
            <KonvaRect
              x={selectionBox.startX}
              y={selectionBox.startY}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(0,0,255,0.1)"
              stroke="blue"
              strokeWidth={1}
              listening={false}
            />
          )}
        </Layer>

        {/* <Layer>
          {lines.map((line, i) => (
            <Line key={line.id} {...line} />
          ))}
        </Layer> */}

        <Layer id="background-layer">
          {/* 绘制半透明背景 */}
          <Group
            ref={backgroundRef as any}
            listening={false}
            clipFunc={handleBackgroundClip}
          ></Group>
        </Layer>
      </Stage>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}

      <div
        className={clsx(
          'absolute top-4 left-4 transition-all',
          isAnimationPlaying && 'opacity-0',
        )}
      >
        <AutoSaveIndicator />
      </div>

      <div
        className={clsx(
          `absolute top-4 left-[50%] -translate-x-[50%] transition-all`,
          isAnimationPlaying && 'opacity-0',
        )}
      >
        <SourcePanel />
      </div>

      <div
        className={clsx(
          `absolute top-4 right-4 max-w-[400px] transition-all`,
          !import.meta.env.DEV && isAnimationPlaying && 'opacity-0',
        )}
      >
        <LayersPanel />
      </div>

      <div
        className={clsx(
          `absolute bottom-4 right-4 transition-all`,
          isAnimationPlaying && 'opacity-0',
        )}
      >
        <HelpCenter />
      </div>

      <div
        className={clsx(
          `absolute left-4 bottom-4 transition-all`,
          isAnimationPlaying && 'opacity-0',
        )}
      >
        <ControlPanel4Scale
          scale={editorProps.scaleX}
          onFitScreen={fitToScreen}
        />
      </div>

      <Debugger />
    </div>
  );
};

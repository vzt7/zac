import type { Layer as LayerType } from 'konva/lib/Layer';
import { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import type { Rect as RectType } from 'konva/lib/shapes/Rect';
import { useEffect, useRef } from 'react';
import {
  Group,
  Rect as KonvaRect,
  Layer,
  Line,
  Rect,
  Stage,
} from 'react-konva';

import { Debugger } from './Debugger';
import { ContextMenu } from './EditorComponents/ContextMenu';
import { ControlPanel4Scale } from './EditorComponents/ControlPanel4Scale';
import { CustomTransformer } from './EditorComponents/CustomTransformer';
import { SourcePanel } from './EditorComponents/ElementEditorSourcePanel';
import { renderShape } from './EditorComponents/Elements';
import { LayersPanel } from './EditorComponents/LayerPanel';
import {
  handleBackgroundClip,
  handleDragEnd,
  handleImageDrop,
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
import { useHeaderStore } from './header.store';

export const Editor = () => {
  // 添加快捷键支持
  useEditorHotkeys();

  const stageRef = useRef<StageType>(null);
  useEffect(() => {
    useEditorStore.setState({ stageRef });
  }, []);
  const layerRef = useRef<LayerType>(null);
  const backgroundRef = useRef<RectType>(null);

  const theme = useHeaderStore((state) => state.theme);
  const lang = useHeaderStore((state) => state.lang);

  // 画布
  const editorProps = useEditorStore((state) => state.editorProps);
  const safeArea = useEditorStore((state) => state.safeArea);
  // 选择
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);
  const selectedNodes = useEditorStore((state) => state.selectedNodes);
  // 绘制模式
  const isDrawMode = useEditorStore((state) => state.isDrawMode);
  // 选择
  const { selectionBox, handleSelectionMouseDown } = useSelection(stageRef);
  // 上下文菜单
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();
  // 缩放
  const { fitToScreen, handleStageWheel } = useResize({
    stageRef,
    layerRef,
  });
  // 画布拖拽
  const { isDragMode } = useStageDrag();
  // 对齐辅助线
  const {
    snapLines,
    handleDrag: handleSnapDrag,
    handleDragEnd: handleSnapDragEnd,
  } = useSnap({
    shapes: shapes
      .map((shape) => stageRef.current?.findOne(`#${shape.id}`))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    threshold: 5 / editorProps.scaleX,
    enabled: !isDragMode,
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

  return (
    <div
      className={`relative w-full h-full overflow-hidden transparent-bg-img`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        handleImageDrop(e);
      }}
    >
      <Stage
        {...editorProps}
        ref={stageRef}
        className={`${isDragMode ? '!cursor-grab' : ''}`}
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
            {...safeArea}
            fill="#FFFFFF"
            strokeWidth={1}
            listening={false}
            shadowColor="black"
            shadowBlur={50}
            shadowOpacity={0.5}
            shadowOffset={{ x: 0, y: 0 }}
          />

          {shapes.map((shape) => {
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
                const container = e.target.getStage().container();
                container.style.cursor = 'move';
              },
              onMouseLeave: (e: any) => {
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

          {!isDragMode && !isDrawMode && (
            <CustomTransformer selectedNodes={selectedNodes} />
          )}

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

        <Layer>
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

      {/* toolbar */}
      <div
        className={`absolute top-4 left-[50%] -translate-x-[50%] z-10 flex flex-col gap-2 bg-base-100 p-2 shadow-md shadow-black rounded-lg`}
      >
        <SourcePanel />
      </div>

      <div className={`absolute top-4 right-4 max-w-[400px]`}>
        <LayersPanel />
      </div>

      <ControlPanel4Scale
        scale={editorProps.scaleX}
        onFitScreen={fitToScreen}
      />

      <Debugger />
    </div>
  );
};

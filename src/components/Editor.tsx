import Konva from 'konva';
import type { Layer as LayerType } from 'konva/lib/Layer';
import { KonvaEventObject } from 'konva/lib/Node';
import type { Stage as StageType } from 'konva/lib/Stage';
import { debounce } from 'lodash-es';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { Group, Rect as KonvaRect, Layer, Stage } from 'react-konva';

import { ContextMenu } from './EditorComponents/ContextMenu';
import { ControlPanel4Scale } from './EditorComponents/ControlPanel4Scale';
import { CustomTransformer } from './EditorComponents/CustomTransformer';
import {
  ELEMENT_EDITOR_WIDTH,
  ElementEditor,
} from './EditorComponents/ElementEditor';
import { SourcePanel } from './EditorComponents/ElementEditorSourcePanel';
import { renderShape } from './EditorComponents/Elements';
import { LayersPanel } from './EditorComponents/LayerPanel';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import {
  handleBackgroundClip,
  handleClick,
  handleDragEnd,
  handleImageDrop,
  handleStageDragMove,
  handleTransformEnd,
} from './editor.handler';
import {
  useContextMenu,
  useEditorHotkeys,
  useSelection,
  useStageDrag,
} from './editor.hook';
import { useEditorStore } from './editor.store';
import { useHeaderSettings } from './header.store';

export const Editor = () => {
  // 添加快捷键支持
  useEditorHotkeys();

  const transformerRef = useRef<any>(null);
  const stageRef = useRef<StageType>(null);
  useEffect(() => {
    useEditorStore.setState({ stageRef });
  }, []);
  const backgroundRef = useRef<Konva.Group>(null);

  const { mousePosition, handleStageMouseDown } = useSelection(stageRef);
  const { contextMenu, setContextMenu, handleContextMenu, closeContextMenu } =
    useContextMenu(mousePosition);

  const theme = useHeaderSettings((state) => state.theme);
  const lang = useHeaderSettings((state) => state.lang);

  const { isDragMode } = useStageDrag();

  const safeArea = useEditorStore((state) => state.safeArea);
  const editorProps = useEditorStore((state) => state.editorProps);

  const selectedIds = useEditorStore((state) => state.selectedIds);

  const shapes = useEditorStore((state) => state.shapes);
  const guides = useEditorStore((state) => state.guides);

  const selectionBox = useEditorStore((state) => state.selectionBox);

  // 监听 selectedIds 的变化，更新 transformer 的节点
  const selectedNodes = useMemo(() => {
    return selectedIds
      .map((_id) => stageRef.current?.findOne(`#${_id}`))
      .filter(Boolean);
  }, [selectedIds]);

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
      x: shape.x ?? 0 + deltaX,
      y: shape.y ?? 0 + deltaY,
    }));

    console.log(
      effectiveWidth,
      effectiveHeight,
      scaleValue,
      scaleX,
      scaleY,
      safeArea,
    );

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

    // 强制重绘
    backgroundRef.current?.draw();
  }, []);
  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe(
      (state) => state.scale,
      (scale) => {
        fitToScreen(scale);
      },
    );
    return () => unsubscribe();
  }, [fitToScreen]);

  const handleStageWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (isDragMode) return;

    const scaleBy = 1.1;
    const stage = e.target as StageType;
    if (!stage) return;

    const oldScale = stage.scaleX();
    // 根据滚轮方向确定新的缩放值
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    // 限制最小和最大缩放
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 1.5;
    const boundedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

    fitToScreen(boundedScale);
  };

  const layerRef = useRef<LayerType>(null);
  useLayoutEffect(() => {
    const fn = debounce(() => {
      requestAnimationFrame(() => {
        fitToScreen();
      });
    }, 200);
    fitToScreen();
    window.addEventListener('resize', fn);
    return () => {
      window.removeEventListener('resize', fn);
    };
  }, [fitToScreen]);

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
        onMouseDown={handleStageMouseDown}
        onDragMove={handleStageDragMove}
        onWheel={handleStageWheel}
        onClick={handleClick}
        draggable={isDragMode}
      >
        <Layer ref={layerRef} listening={!isDragMode}>
          {/* safeArea 边框 */}
          <KonvaRect
            {...safeArea}
            fill="#FFFFFF"
            strokeWidth={1}
            listening={false}
          />

          {/* 绘制半透明背景 */}
          <Group
            ref={backgroundRef}
            listening={false}
            clipFunc={handleBackgroundClip}
          ></Group>

          {shapes.map((shape) => {
            return renderShape({
              ...shape,
              draggable: !shape.isLocked,
              onTransformEnd: handleTransformEnd,
              onClick: handleClick,
              onDragEnd: handleDragEnd,
              onMouseEnter: (e: any) => {
                // style stage container:
                const container = e.target.getStage().container();
                container.style.cursor = 'move';
              },
              onMouseLeave: (e: any) => {
                const container = e.target.getStage().container();
                container.style.cursor = 'default';
              },
            });
          })}

          {!isDragMode && <CustomTransformer selectedNodes={selectedNodes} />}

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
        className={`absolute top-4 left-[50%] -translate-x-[50%] z-10 flex flex-col gap-2 bg-base-100 p-2 shadow-md shadow-gray-400 rounded-lg`}
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

      {import.meta.env.DEV && (
        <div className="absolute top-0 left-0 bg-warning text-warning-content px-2 py-1">
          <div className="flex flex-col">
            <span>
              画布: {editorProps.width}x{editorProps.height}
            </span>
            <span>已选择: {selectedIds.join(',') || 'null'}</span>
            <span>
              位置: ({mousePosition.x}, {mousePosition.y})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

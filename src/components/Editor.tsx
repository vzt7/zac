import { transparentBackground } from '@/assets/transparent';
import Konva from 'konva';
import type { Layer as LayerType } from 'konva/lib/Layer';
import type { KonvaEventObject } from 'konva/lib/Node';
import { ShapeConfig } from 'konva/lib/Shape';
import type { Stage as StageType } from 'konva/lib/Stage';
import { debounce } from 'lodash-es';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Group,
  Circle as KonvaCircle,
  KonvaNodeComponent,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from 'react-konva';

import { ContextMenu } from './EditorComponents/ContextMenu';
import { ControlPanel4Scale } from './EditorComponents/ControlPanel4Scale';
import { CustomTransformer } from './EditorComponents/CustomTransformer';
import {
  EDITOR_LIBRARY_WIDTH,
  EditorLibrary,
} from './EditorComponents/ElementEditor';
import { ImageElement } from './EditorComponents/ElementImage';
import { TextElement } from './EditorComponents/ElementText';
import { LayersPanel } from './EditorComponents/LayerPanel';
import { Toolbar } from './EditorComponents/Toolbar';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import {
  getSelectedIdsByClickEvent,
  handleBackgroundClip,
  handleClick,
  handleDragEnd,
  handleDrop,
  handleSelect,
  handleStageDragMove,
  handleStageWheel,
  handleTransformEnd,
} from './editor.handler';
import {
  useContextMenu,
  useEditorHotkeys,
  useExport,
  useSelection,
  useStageDrag,
} from './editor.hook';
import { Shape, getEditorCenter, useEditorStore } from './editor.store';
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
      window.innerWidth - SIDEBAR_WIDTH - EDITOR_LIBRARY_WIDTH;
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
    requestAnimationFrame(() => {
      backgroundRef.current?.draw();
    });
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
      onDrop={handleDrop}
    >
      <LayersPanel />

      <Stage
        {...editorProps}
        ref={stageRef}
        className={`${isDragMode ? 'cursor-grab' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleStageMouseDown}
        draggable={isDragMode}
        onDragMove={handleStageDragMove}
        onWheel={handleStageWheel}
      >
        <Layer ref={layerRef} listening={!isDragMode}>
          {/* safeArea 边框 */}
          <Rect {...safeArea} fill="#FFF" strokeWidth={1} listening={false} />

          {/* 形状渲染 */}
          {shapes.map((shape) => {
            if (shape.visible === false) {
              return null;
            }
            const shapeProps: ShapeConfig = {
              ...shape,
              id: shape.id,
              x: shape.x,
              y: shape.y,
              rotation: shape.rotation,
              scaleX: shape.scaleX,
              scaleY: shape.scaleY,
              fill: shape.fill,
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
              shadowBlur: shape.shadowBlur,
              shadowColor: shape.shadowColor,
              shadowOffsetX: shape.shadowOffsetX,
              shadowOffsetY: shape.shadowOffsetY,
              opacity: shape.opacity,
              draggable: !shape.isLocked,
              onClick: (e: any) => !shape.isLocked && handleClick(e),
              onTransformEnd: handleTransformEnd,
              // onDragStart: handleDragStart,
              onDragEnd: handleDragEnd,
            };

            switch (shape.type) {
              case 'rect':
                return (
                  <Rect
                    key={shapeProps.id}
                    {...shapeProps}
                    width={shape.width}
                    height={shape.height}
                  />
                );
              case 'circle':
                return (
                  <KonvaCircle
                    key={shapeProps.id}
                    {...shapeProps}
                    radius={shape.radius}
                  />
                );
              case 'triangle':
              case 'star':
                return (
                  <Line
                    key={shapeProps.id}
                    {...shapeProps}
                    points={shape.points}
                    closed
                  />
                );
              case 'polygon': {
                const points = [];
                const sides = shape.sides || 6;
                const radius = shape.radius || 50;
                for (let i = 0; i < sides; i++) {
                  const angle = (i * 2 * Math.PI) / sides;
                  points.push(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                  );
                }
                return (
                  <Line
                    key={shapeProps.id}
                    {...shapeProps}
                    points={points}
                    closed
                  />
                );
              }
              case 'text':
                return (
                  <TextElement
                    key={shapeProps.id}
                    {...shapeProps}
                    onClick={() => !shape.isLocked && handleSelect([shape.id])}
                    onTransformEnd={handleTransformEnd}
                  />
                );
              case 'image':
                if (!shape.src) return null;
                return (
                  <ImageElement
                    key={shape.id}
                    {...shapeProps}
                    src={shape.src}
                    onTransformEnd={handleTransformEnd}
                  />
                );
              default:
                return null;
            }
          })}

          {/* 绘制半透明背景 */}
          <Group
            ref={backgroundRef}
            listening={false}
            clipFunc={handleBackgroundClip}
          ></Group>

          <CustomTransformer selectedNodes={selectedNodes} />

          {/* 渲染选区 */}
          {selectionBox && (
            <Rect
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

      <ControlPanel4Scale
        scale={editorProps.scaleX}
        onFitScreen={() => fitToScreen()}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}

      <EditorLibrary />

      {import.meta.env.DEV && (
        <div className="absolute right-0 bottom-0 bg-warning text-warning-content px-2 py-1">
          <div>
            <span>Selected: {selectedIds.join(',') || 'null'}</span>
            <span> / </span>
            <span>
              Mouse: ({mousePosition.x}, {mousePosition.y})
            </span>
            <span> / </span>
            <span>EditorProps: {JSON.stringify(editorProps)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

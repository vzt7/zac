import { transparentBackground } from '@/assets/transparent';
import { debug } from '@/utils/debug';
import { SceneContext } from 'konva/lib/Context';
import { KonvaEventObject, Node } from 'konva/lib/Node';
import { debounce } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';

import { Shape } from './editor.store';
import { useEditorStore } from './editor.store';

// 创建一个防抖的添加历史记录函数
const debouncedAddToHistory = debounce((shapes: Shape[]) => {
  addToHistory(shapes);
}, 100); // 100ms 内的多次调用会被合并

export const addToHistory = (newShapes: Shape[]) => {
  const {
    history,
    historyIndex,
    setHistory,
    setHistoryIndex,
    stageRef,
    safeArea,
  } = useEditorStore.getState();

  const stage = stageRef.current;
  if (!stage) return;

  const newHistoryState: (typeof history)[number] = {
    shapes: newShapes,
    stage: {
      x: stage.x(),
      y: stage.y(),
      scaleX: stage.scaleX(),
      scaleY: stage.scaleY(),
    },
    safeArea: { ...safeArea },
  };

  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(newHistoryState);
  setHistory(newHistory);
  setHistoryIndex(newHistory.length - 1);
};

export const handleSelect = (id: string | string[]) => {
  const { setSelectedIds } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);
  setSelectedIds(ids);
};

export const handleUnselect = (id: string | string[]) => {
  const { selectedIds, setSelectedIds } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);
  const _selectedIds = selectedIds.filter((_id) => !ids.includes(_id));
  setSelectedIds(_selectedIds);
};

export const handleLockToggle = (id: string | string[]) => {
  const { shapes, setShapes, setSelectedIds } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);

  const newShapes = shapes.map((shape) => {
    if (ids.includes(shape.id)) {
      return { ...shape, isLocked: !shape.isLocked };
    }
    return shape;
  });

  // setSelectedIds(ids);
  setShapes(newShapes);
  addToHistory(newShapes);
};

export const handleUndo = () => {
  const {
    history,
    historyIndex,
    setHistoryIndex,
    setShapes,
    stageRef,
    setSafeArea,
    editorProps,
    setEditorProps,
  } = useEditorStore.getState();
  if (historyIndex > 1) {
    handleSelect([]);
    setHistoryIndex(historyIndex - 1);

    const prevState = history[historyIndex - 1];
    setShapes(prevState.shapes);
    setSafeArea(prevState.safeArea);
    setEditorProps({
      x: prevState.stage.x,
      y: prevState.stage.y,
      width: editorProps.width,
      height: editorProps.height,
      scaleX: prevState.stage.scaleX,
      scaleY: prevState.stage.scaleY,
    });

    // 恢复 stage 状态
    const stage = stageRef.current;
    if (stage) {
      stage.position({
        x: prevState.stage.x,
        y: prevState.stage.y,
      });
      stage.scale({
        x: prevState.stage.scaleX,
        y: prevState.stage.scaleY,
      });
    }
  }
};

export const handleRedo = () => {
  const {
    history,
    historyIndex,
    setHistoryIndex,
    setShapes,
    stageRef,
    setSafeArea,
    editorProps,
    setEditorProps,
  } = useEditorStore.getState();
  if (historyIndex < history.length - 1) {
    handleSelect([]);
    setHistoryIndex(historyIndex + 1);

    const nextState = history[historyIndex + 1];
    setShapes(nextState.shapes);
    setSafeArea(nextState.safeArea);
    setEditorProps({
      x: nextState.stage.x,
      y: nextState.stage.y,
      width: editorProps.width,
      height: editorProps.height,
      scaleX: nextState.stage.scaleX,
      scaleY: nextState.stage.scaleY,
    });

    // 恢复 stage 状态
    const stage = stageRef.current;
    if (stage) {
      stage.position({
        x: nextState.stage.x,
        y: nextState.stage.y,
      });
      stage.scale({
        x: nextState.stage.scaleX,
        y: nextState.stage.scaleY,
      });
    }
  }
};

export const createShape = (type: string, shape?: Partial<Shape>) => {
  const { shapes, setShapes, safeArea, editorProps } =
    useEditorStore.getState();
  const editorCenter = {
    x: shape?.x ?? safeArea.x + safeArea.width / 2,
    y: shape?.y ?? safeArea.y + safeArea.height / 2,
  };

  const baseShape: Partial<Shape> = {
    id: `${type}-${Date.now()}`,
    x: editorCenter.x,
    y: editorCenter.y,
    rotation: 0,
    // scaleX: editorProps.scaleX,
    // scaleY: editorProps.scaleY,
    zIndex: shapes.length,
    fill: '#000000',
    shadowBlur: 0,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    opacity: 1,
    strokeWidth: 2,
    stroke: '#000000',
    ...shape,
  };

  let newShape: Shape;

  switch (type) {
    case 'rect':
      newShape = {
        type,
        width: 100,
        height: 100,
        ...baseShape,
      } as Shape;
      break;
    case 'circle':
      newShape = {
        type,
        radius: 50,
        ...baseShape,
      } as Shape;
      break;
    case 'triangle':
      newShape = {
        type,
        points: [0, -50, 50, 50, -50, 50],
        ...baseShape,
      } as Shape;
      break;
    case 'polygon':
      newShape = {
        type,
        sides: 6,
        radius: 50,
        ...baseShape,
      } as Shape;
      break;
    case 'star':
      newShape = {
        type,
        points: [
          0, -50, 10, -20, 40, -20, 20, 0, 30, 30, 0, 20, -30, 30, -20, 0, -40,
          -20, -10, -20,
        ],
        ...baseShape,
      } as Shape;
      break;
    case 'freedraw':
      newShape = {
        type,
        stroke: '#000000',
        strokeWidth: 5 / Math.min(editorProps.scaleX, editorProps.scaleY),
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
        globalCompositeOperation: 'source-over',
        draggable: true,
        ...baseShape,
      } as any;
      break;
    case 'line':
      newShape = {
        type,
        points: [0, 0, 100, 0], // 默认水平线，长度100
        lineCap: 'round',
        lineJoin: 'round',
        strokeWidth: 2,
        fill: '', // 线条不需要填充
        ...baseShape,
      } as Shape;
      break;
    case 'arrow':
      newShape = {
        type,
        points: [0, 0, 100, 0], // 默认水平箭头，长度100
        pointerLength: 10, // 箭头长度
        pointerWidth: 10, // 箭头宽度
        lineCap: 'round',
        lineJoin: 'round',
        fill: '', // 箭头线条不需要填充
        strokeWidth: 2,
        ...baseShape,
      } as Shape;
      break;
    default:
      return;
  }

  return newShape;
};

export const handleAddShape = (
  type: string,
  position?: { x: number; y: number },
) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const newShape = createShape(type, { ...position });
  if (!newShape) return;
  const newShapes = [...shapes, newShape];
  setShapes(newShapes);
  addToHistory(newShapes);
};

export const handleTransformEnd = (e: any) => {
  const { shapes, setShapes, editorProps } = useEditorStore.getState();
  const node = e.target as Node;

  // 获取所有变换属性
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const rotation = node.rotation();
  const x = node.x();
  const y = node.y();

  const newShapes = shapes.map((shape) => {
    if (shape.id === node.id()) {
      return {
        ...shape,
        rotation,
        scaleX,
        scaleY,
        width: node.width(),
        height: node.height(),
        x, // 添加位置信息
        y, // 添加位置信息
      };
    }
    return shape;
  });

  setShapes(newShapes);
  addToHistory(newShapes);
};

// 添加对齐辅助处理
export const handleStageDragMove = (e: any) => {
  const { safeArea, editorProps, isDragMode } = useEditorStore.getState();
  const shape = e.target;

  if (isDragMode) {
    const stage = shape;
    const pos = stage.position();

    // 计算新位置，需要考���缩放因素
    const newX = pos.x;
    const newY = pos.y;

    // 限制拖拽边界
    const minX = -((safeArea.width * editorProps.scaleX) / 2);
    const maxX = -minX;
    const minY = -((safeArea.height * editorProps.scaleY) / 2);
    const maxY = -minY;

    // 应用边界限制
    const boundX = Math.min(Math.max(newX, minX), maxX);
    const boundY = Math.min(Math.max(newY, minY), maxY);

    // 应用新位置
    stage.position({
      x: boundX,
      y: boundY,
    });
    return;
  }
};

// 添加位置变化监听
export const handleDragEnd = (e: any) => {
  const node = e.target;
  const { shapes, setShapes } = useEditorStore.getState();

  const newShapes = shapes.map((shape) => {
    if (shape.id === node.id()) {
      return {
        ...shape,
        x: node.x(),
        y: node.y(),
      };
    }
    return shape;
  });

  useEditorStore.setState({ shapes: newShapes });
  // 使用防抖函数替代直接调用
  debouncedAddToHistory(newShapes);
};

export const handleSave = () => {
  const { projectId, shapes } = useEditorStore.getState();
  const safeArea = useEditorStore.getState().safeArea;
  const data = JSON.stringify({ shapes, safeArea });
  localStorage.setItem(projectId, data);
};

export const handleLoad = () => {
  const { projectId, setShapes } = useEditorStore.getState();
  const data = localStorage.getItem(projectId);
  if (data) {
    const { shapes, safeArea } = JSON.parse(data);
    setShapes(shapes);
    useEditorStore.setState({ safeArea });
    addToHistory(shapes);
  }
};

// 添加文本
export const handleAddText = () => {
  const { shapes, setShapes, safeArea, editorProps } =
    useEditorStore.getState();
  const editorCenter = {
    x: safeArea.x + safeArea.width / 2,
    y: safeArea.y + safeArea.height / 2,
  };
  const newShape: Shape = {
    id: `text-${Date.now()}`,
    type: 'text',
    x: editorCenter.x + Math.random() * 50,
    y: editorCenter.y + Math.random() * 50,
    text: '默认文本',
    fontSize: 32 / Math.min(editorProps.scaleX, editorProps.scaleY),
    fontFamily: 'Arial',
    rotation: 0,
    scaleX: editorProps.scaleX,
    scaleY: editorProps.scaleY,
    zIndex: shapes.length,
    fill: '#000000',
  };

  const newShapes = [...shapes, newShape];
  setShapes(newShapes);
  addToHistory(newShapes);
};

// 处理文编辑
export const handleTextEdit = (id: string, newText: string) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const newShapes = shapes.map((shape) => {
    if (shape.id === id) {
      return { ...shape, text: newText };
    }
    return shape;
  });
  setShapes(newShapes);
  addToHistory(newShapes);
};

// 创建一个统一的图片处理函数
const createImageShape = (
  imageUrl: string,
  position: { x: number; y: number },
  callback: (shape: Shape) => void,
) => {
  const { shapes, safeArea } = useEditorStore.getState();

  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    const maxWidth = safeArea.width * 0.95;
    const maxHeight = safeArea.height * 0.95;
    const minWidth = safeArea.width * 0.2;
    const minHeight = safeArea.height * 0.2;

    let finalWidth = img.width;
    let finalHeight = img.height;

    if (img.width > maxWidth || img.height > maxHeight) {
      const ratioWidth = maxWidth / img.width;
      const ratioHeight = maxHeight / img.height;
      const scale = Math.min(ratioWidth, ratioHeight);
      finalWidth = img.width * scale;
      finalHeight = img.height * scale;
    }

    if (img.width < minWidth && img.height < minHeight) {
      const ratioWidth = minWidth / img.width;
      const ratioHeight = minHeight / img.height;
      const scale = Math.min(ratioWidth, ratioHeight);
      finalWidth = img.width * scale;
      finalHeight = img.height * scale;
    }

    // 调整位置，使拖放点位于图片中心
    const newShape: Shape = {
      id: `image-${Date.now()}`,
      type: 'image',
      x: position.x - finalWidth / 2, // 从拖放位置减去宽度的一半
      y: position.y - finalHeight / 2, // 从拖放位置减去高度的一半
      width: finalWidth,
      height: finalHeight,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: shapes.length,
      src: imageUrl,
      fill: 'transparent',
    };

    callback(newShape);
  };
};

// 修改文件类型检查函数
const isImageFile = (type: string) => {
  return type.startsWith('image/') || type === 'image/svg+xml';
};

// 修改URL检查正则
const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
};

// 处理文件上传
export const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && isImageFile(file.type)) {
    const { safeArea, shapes, setShapes } = useEditorStore.getState();
    const editorCenter = {
      x: safeArea.x + safeArea.width / 2,
      y: safeArea.y + safeArea.height / 2,
    };

    const reader = new FileReader();
    reader.onload = () => {
      createImageShape(
        reader.result as string,
        { x: editorCenter.x, y: editorCenter.y },
        (newShape) => {
          const newShapes = [...shapes, newShape];
          setShapes(newShapes);
          addToHistory(newShapes);
        },
      );
    };
    reader.readAsDataURL(file);
  }
};

// 处理拖拽放置
export const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  const { shapes, setShapes, stageRef } = useEditorStore.getState();

  // 获取舞的位置和缩放信息
  const stage = stageRef?.current;
  if (!stage) return;

  // 计算相对于舞台的准确位置
  const stageBox = stage.container().getBoundingClientRect();
  const scale = stage.scaleX();

  // 计算鼠标相对于舞台的实际位置
  const dropPosition = {
    x: (e.clientX - stageBox.left) / scale,
    y: (e.clientY - stageBox.top) / scale,
  };

  // 处理拖拽文件
  if (e.dataTransfer.files?.length) {
    const file = e.dataTransfer.files[0];
    if (isImageFile(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        createImageShape(reader.result as string, dropPosition, (newShape) => {
          const newShapes = [...shapes, newShape];
          setShapes(newShapes);
          addToHistory(newShapes);
        });
      };
      reader.readAsDataURL(file);
    }
  }
  // 处理拖拽图片URL
  else if (isImageUrl(e.dataTransfer.getData('text'))) {
    const imageUrl = e.dataTransfer.getData('text');
    createImageShape(imageUrl, dropPosition, (newShape) => {
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      addToHistory(newShapes);
    });
  }
};

export const handleDelete = (id: string | string[]) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);

  handleSelect([]);
  setTimeout(() => {
    const newShapes = shapes.filter((shape) => !ids.includes(shape.id));
    setShapes(newShapes);
    addToHistory(newShapes);
  }, 0);
};

export const handleDuplicate = (id: string | string[]) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);
  const shapesToDuplicate = shapes.filter((shape) => ids.includes(shape.id));
  if (shapesToDuplicate.length > 0) {
    const _newShapes = shapesToDuplicate.map((shapeToDuplicate) => {
      return {
        ...shapeToDuplicate,
        id: `${shapeToDuplicate.type}-${Date.now()}`,
        x: shapeToDuplicate.x + 20,
        y: shapeToDuplicate.y + 20,
      };
    });
    const newShapes = [...shapes, ..._newShapes];
    setShapes(newShapes);
    setTimeout(() => handleSelect(_newShapes.map((shape) => shape.id)), 0);
    addToHistory(newShapes);
  }
};

export const handleMoveUp = (id: string) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const currentIndex = shapes.findIndex((shape) => shape.id === id);
  if (currentIndex < shapes.length - 1) {
    const newShapes = [...shapes];
    [newShapes[currentIndex], newShapes[currentIndex + 1]] = [
      newShapes[currentIndex + 1],
      newShapes[currentIndex],
    ];
    handleSelect([]);
    setShapes(newShapes);
    addToHistory(newShapes);
  }
};

export const handleMoveDown = (id: string) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const currentIndex = shapes.findIndex((shape) => shape.id === id);
  if (currentIndex > 0) {
    const newShapes = [...shapes];
    [newShapes[currentIndex], newShapes[currentIndex - 1]] = [
      newShapes[currentIndex - 1],
      newShapes[currentIndex],
    ];
    handleSelect([]);
    setShapes(newShapes);
    addToHistory(newShapes);
  }
};

export const handleMoveToTop = (id: string | string[]) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);
  const currentIndexes = shapes.filter((shape) => ids.includes(shape.id));
  if (currentIndexes.length > 0) {
    const newShapesHead: typeof shapes = [];
    const newShapesBail: typeof shapes = [];
    for (const item of shapes) {
      if (ids.includes(item.id)) {
        newShapesBail.push(item);
      } else {
        newShapesHead.push(item);
      }
    }
    const newShapes = [...newShapesHead, ...newShapesBail];
    setShapes(newShapes);
    addToHistory(newShapes);
  }
};

export const handleMoveToBottom = (id: string | string[]) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);
  const currentIndexes = shapes.filter((shape) => ids.includes(shape.id));
  if (currentIndexes.length > 0) {
    const newShapesHead: typeof shapes = [];
    const newShapesBail: typeof shapes = [];
    for (const item of shapes) {
      if (ids.includes(item.id)) {
        newShapesHead.push(item);
      } else {
        newShapesBail.push(item);
      }
    }
    const newShapes = [...newShapesHead, ...newShapesBail];
    setShapes(newShapes);
    addToHistory(newShapes);
  }
};

export const handleUpdate = (item: Partial<Shape> & { id: Shape['id'] }) => {
  const { selectedIds, shapes } = useEditorStore.getState();
  const newShapes = shapes.map((shape) => {
    if (selectedIds.includes(shape.id)) {
      return { ...shape, ...item };
    }
    return shape;
  });
  useEditorStore.setState({ shapes: newShapes });
  addToHistory(newShapes);
};

export const handleBackgroundClip = (ctx: SceneContext) => {
  const { safeArea, editorProps } = useEditorStore.getState();

  // 1. 保存当前上下文状态
  ctx.save();

  // 2. 设置全局合成操作为 "source-over"
  ctx.globalCompositeOperation = 'source-over';

  // 3. 绘制遮罩背景
  ctx.beginPath();
  ctx.rect(
    -editorProps.width,
    -editorProps.height,
    editorProps.width * 4,
    editorProps.height * 4,
  );

  // 4. 在遮罩中挖出安全区域
  ctx.moveTo(safeArea.x, safeArea.y);
  ctx.lineTo(safeArea.x, safeArea.y + safeArea.height);
  ctx.lineTo(safeArea.x + safeArea.width, safeArea.y + safeArea.height);
  ctx.lineTo(safeArea.x + safeArea.width, safeArea.y);
  ctx.closePath();

  // 5. 设置遮罩样式和透度
  const img = new Image();
  img.src = transparentBackground;
  const pattern = ctx.createPattern(img, 'repeat');
  // ctx.fillStyle = pattern!;
  ctx.globalAlpha = 0.4;

  // 6. 使用 destination-over 确保遮罩在元素下方
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fill('evenodd');

  // 7. 恢复上下文状态
  ctx.restore();
  ctx.globalAlpha = 1;
};

/** Stage/Shape 点击事件 */
export const handleClick = (e: KonvaEventObject<MouseEvent>) => {
  // 阻止事件冒泡，避免触发父级Group的点击事件
  e.cancelBubble = true;

  const isRightClick = e.evt.button === 2;
  // 如果是右键点击
  if (isRightClick) {
    return;
  }

  // 获取实际点击的目标元素和其所属组
  const clickedShape = e.target;
  const clickedGroup = clickedShape.getParent();

  // 判断是否点击的是组内元素
  const isGroupElement = clickedGroup?.nodeType === 'Group';

  // 如果点击的是组内元素，使用ID，否则使用元素自身ID
  const targetId = isGroupElement ? clickedGroup.attrs.id : undefined;

  // 获取需要选中的素ID列表
  const newSelectedIds = getSelectedIdsByClickEvent(e, targetId);

  handleSelect(newSelectedIds);
  debug('handleClick', {
    isGroupElement,
    targetId,
    newSelectedIds,
  });
};

export const getSelectedIdsByClickEvent = (
  e: KonvaEventObject<MouseEvent>,
  forceTargetId?: string,
) => {
  const { shapes, safeArea, selectedIds } = useEditorStore.getState();

  const keepShiftKey = e.evt.shiftKey;
  const isRightClick = e.evt.button === 2;

  // 检查否为不可选择的元素
  const targetId = forceTargetId ?? e.target.attrs.id;
  const notAllowedSelection =
    e.target === e.target.getStage() || targetId === safeArea.id;

  // 如果是右键点击且已有选中元素，���持当前选中状态
  if (isRightClick && selectedIds.length > 0) {
    return selectedIds;
  }

  const _selectedIds = keepShiftKey ? selectedIds : [];

  if (
    notAllowedSelection ||
    shapes.some((shape) => shape.id === targetId && shape.isLocked)
  ) {
    return [..._selectedIds];
  }

  return [..._selectedIds, targetId].filter(Boolean) as string[];
};

export const handleEyeToggle = (id: string | string[]) => {
  const { shapes, setShapes, setSelectedIds } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);
  const newShapes = shapes.map((shape) => {
    if (ids.includes(shape.id)) {
      return { ...shape, visible: !(shape.visible ?? true) };
    }
    return shape;
  });
  setShapes(newShapes);
  addToHistory(newShapes);
};

interface GroupShape extends Shape {
  type: 'group';
  children: Shape[];
}

export const handleGroup = (selectedShapes: Shape[]) => {
  const { shapes, setShapes, setSelectedIds } = useEditorStore.getState();

  if (selectedShapes.length <= 1) return;

  // 计算组的边界框
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

  // 创建新的组合
  const groupId = `group-${uuidv4()}`;
  const group: GroupShape = {
    id: groupId,
    type: 'group',
    children: selectedShapes.map((shape) => ({
      ...shape,
      // 调整子元素相对于组的位置
      x: shape.x - bounds.left,
      y: shape.y - bounds.top,
    })),
    x: bounds.left,
    y: bounds.top,
    width: bounds.right - bounds.left,
    height: bounds.bottom - bounds.top,
    isLocked: false,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex: Math.max(...selectedShapes.map((s) => s.zIndex || 0)),
    fill: 'transparent',
  };

  requestAnimationFrame(() => {
    // 从画布中移除原始图形
    const newShapes = shapes.filter(
      (shape) => !selectedShapes.find((s) => s.id === shape.id),
    );

    // 添加组合
    newShapes.push(group);

    setShapes(newShapes);
    setSelectedIds([groupId]);
    addToHistory(newShapes);
  });
};

export const handleUngroup = (selectedShapes: Shape[]) => {
  const { shapes, setShapes, setSelectedIds } = useEditorStore.getState();

  // 找出所有需要���组的组合
  const groupsToUngroup = selectedShapes.filter(
    (shape) => shape.type === 'group',
  );
  if (groupsToUngroup.length === 0) return;

  requestAnimationFrame(() => {
    let newShapes = [...shapes];
    const newSelectedShapes: Shape[] = [];

    groupsToUngroup.forEach((group) => {
      // 移除组合
      newShapes = newShapes.filter((shape) => shape.id !== group.id);

      // 添加子图形，并调整位置
      const children = (group as GroupShape).children.map((child) => ({
        ...child,
        x: child.x + group.x,
        y: child.y + group.y,
      }));

      newShapes.push(...children);
      newSelectedShapes.push(...children);
    });

    setShapes(newShapes);
    setSelectedIds([]);
    addToHistory(newShapes);
  });
};

export const handleCopy = () => {
  const { selectedIds, shapes } = useEditorStore.getState();
  if (selectedIds.length === 0) return;

  const selectedShapes = shapes.filter((shape) =>
    selectedIds.includes(shape.id),
  );
  localStorage.setItem('clipboard', JSON.stringify(selectedShapes));
};

export const handlePaste = () => {
  const clipboardData = localStorage.getItem('clipboard');
  if (!clipboardData) return;

  try {
    const copiedShapes = JSON.parse(clipboardData);
    const newShapes = copiedShapes.map((shape: Shape) => ({
      ...shape,
      id: `${shape.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: shape.x + 20, // 偏移一点距离以区分
      y: shape.y + 20,
    }));

    const { shapes } = useEditorStore.getState();
    const updatedShapes = [...shapes, ...newShapes];

    useEditorStore.setState({ shapes: updatedShapes });
    addToHistory(updatedShapes);

    // 选中新粘贴的图形
    handleSelect(newShapes.map((shape: Shape) => shape.id));
  } catch (error) {
    console.error('Failed to paste shapes:', error);
  }
};

export const handleCut = () => {
  const { selectedIds, shapes } = useEditorStore.getState();
  if (selectedIds.length === 0) return;

  // 先复制选中的图形
  const selectedShapes = shapes.filter((shape) =>
    selectedIds.includes(shape.id),
  );
  localStorage.setItem('clipboard', JSON.stringify(selectedShapes));

  // 然后删除选中的图形
  const remainingShapes = shapes.filter(
    (shape) => !selectedIds.includes(shape.id),
  );
  useEditorStore.setState({
    shapes: remainingShapes,
    selectedIds: [], // 清空选中状态
  });
  addToHistory(remainingShapes);
};

import { transparentBackground } from '@/assets/transparent';
import { SceneContext } from 'konva/lib/Context';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { debounce } from 'lodash-es';

import { Shape, getEditorCenter } from './editor.store';
import { useEditorStore } from './editor.store';

// 创建一个防抖的添加历史记录函数
const debouncedAddToHistory = debounce((shapes: Shape[]) => {
  addToHistory(shapes);
}, 100); // 100ms 内的多次调用会被合并

export const addToHistory = (newShapes: Shape[]) => {
  const { history, historyIndex, setHistory, setHistoryIndex } =
    useEditorStore.getState();
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(newShapes);
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
  const { history, historyIndex, setHistoryIndex, setShapes } =
    useEditorStore.getState();
  if (historyIndex > 0) {
    handleSelect([]);
    setHistoryIndex(historyIndex - 1);
    setShapes(history[historyIndex - 1]);
  }
};

export const handleRedo = () => {
  const { history, historyIndex, setHistoryIndex, setShapes } =
    useEditorStore.getState();
  if (historyIndex < history.length - 1) {
    handleSelect([]);
    setHistoryIndex(historyIndex + 1);
    setShapes(history[historyIndex + 1]);
  }
};

export const handleAddShape = (
  type: string,
  position?: { x: number; y: number },
) => {
  const { shapes, setShapes, safeArea, editorProps } =
    useEditorStore.getState();
  const editorCenter = position || getEditorCenter(safeArea, editorProps);

  const baseShape: Partial<Shape> = {
    id: `shape-${Date.now()}`,
    x: editorCenter.x,
    y: editorCenter.y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    zIndex: shapes.length,
    fill: '#000000',
    shadowBlur: 0,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    opacity: 1,
    strokeWidth: 2,
    stroke: '#000000',
  };

  let newShape: Shape;

  switch (type) {
    case 'rect':
      newShape = {
        ...baseShape,
        type,
        width: 100,
        height: 100,
      } as Shape;
      break;
    case 'circle':
      newShape = {
        ...baseShape,
        type,
        radius: 50,
      } as Shape;
      break;
    case 'triangle':
      newShape = {
        ...baseShape,
        type,
        points: [0, -50, 50, 50, -50, 50],
      } as Shape;
      break;
    case 'polygon':
      newShape = {
        ...baseShape,
        type,
        sides: 6,
        radius: 50,
      } as Shape;
      break;
    case 'star':
      newShape = {
        ...baseShape,
        type,
        points: [
          0, -50, 10, -20, 40, -20, 20, 0, 30, 30, 0, 20, -30, 30, -20, 0, -40,
          -20, -10, -20,
        ],
      } as Shape;
      break;
    default:
      return;
  }

  const newShapes = [...shapes, newShape];
  setShapes(newShapes);
  addToHistory(newShapes);
};

export const handleTransformEnd = (e: any) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const node = e.target;

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
        x, // 添加位置信息
        y, // 添加位置信息
      };
    }
    return shape;
  });

  setShapes(newShapes);
  addToHistory(newShapes);
};

// 添加对齐辅助线处理
export const handleStageDragMove = (e: any) => {
  const { shapes, setGuides, safeArea, editorProps, isDragMode } =
    useEditorStore.getState();
  const shape = e.target;

  if (isDragMode) {
    const stage = shape;
    const pos = stage.position();

    // 计算新位置，需要考虑缩放因素
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

  // 普通元素的对齐辅助线逻辑
  const threshold = 5;
  const newGuides: { x: number; y: number }[] = [];

  shapes.forEach((otherShape) => {
    if (otherShape.id === shape.id()) return;

    if (Math.abs(shape.x() - otherShape.x) < threshold) {
      newGuides.push({ x: otherShape.x, y: 0 });
    }

    if (Math.abs(shape.y() - otherShape.y) < threshold) {
      newGuides.push({ x: 0, y: otherShape.y });
    }
  });

  setGuides(newGuides);
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

// 添加保存/加载功能
export const handleSave = () => {
  const { shapes } = useEditorStore.getState();
  const data = JSON.stringify(shapes);
  localStorage.setItem('editor-shapes', data);
};

export const handleLoad = () => {
  const { setShapes } = useEditorStore.getState();
  const data = localStorage.getItem('editor-shapes');
  if (data) {
    const loadedShapes = JSON.parse(data);
    setShapes(loadedShapes);
    addToHistory(loadedShapes);
  }
};

// 添加文本
export const handleAddText = () => {
  const { shapes, setShapes, safeArea, editorProps } =
    useEditorStore.getState();
  const editorCenter = getEditorCenter(safeArea, editorProps);
  const newShape: Shape = {
    id: `text-${Date.now()}`,
    type: 'text',
    x: editorCenter.x + Math.random() * 50,
    y: editorCenter.y + Math.random() * 50,
    text: '双击编辑文本',
    fontSize: 20,
    fontFamily: 'Arial',
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
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

// 添加图片上传处理
export const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const { shapes, setShapes, safeArea, editorProps } =
      useEditorStore.getState();
    const editorCenter = getEditorCenter(safeArea, editorProps);

    const reader = new FileReader();
    reader.onload = () => {
      const newShape: Shape = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: editorCenter.x + Math.random() * 50,
        y: editorCenter.y + Math.random() * 50,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        zIndex: shapes.length,
        src: reader.result as string,
        fill: 'transparent',
      };

      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      addToHistory(newShapes);
    };
    reader.readAsDataURL(file);
  }
};

export const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();

  const { shapes, setShapes, safeArea, editorProps } =
    useEditorStore.getState();
  const editorCenter = getEditorCenter(safeArea, editorProps);

  const files = Array.from(e.dataTransfer.files);
  files.forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // 创建新的图片元素
        const newImage: Shape = {
          id: `image-${Date.now()}`,
          type: 'image',
          x: editorCenter.x + Math.random() * 50,
          y: editorCenter.y + Math.random() * 50,
          src: imageUrl,
          width: 100,
          height: 100,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          isLocked: false,
          zIndex: shapes.length,
          fill: 'transparent',
        };

        const newShapes = [...shapes, newImage];
        setShapes(newShapes);
        addToHistory(newShapes);
      };
      reader.readAsDataURL(file);
    }
  });
};

export const handleDelete = (id: string | string[]) => {
  const { shapes, setShapes } = useEditorStore.getState();
  const ids = ([] as string[]).concat(id);

  const newShapes = shapes.filter((shape) => !ids.includes(shape.id));
  handleSelect([]);
  setShapes(newShapes);
  addToHistory(newShapes);
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

  // 绘制遮罩区域，扩大绘制范围
  ctx.beginPath();
  ctx.rect(
    -editorProps.width,
    -editorProps.height,
    editorProps.width * 4,
    editorProps.height * 4,
  );

  const img = new Image();
  img.src = transparentBackground;
  const pattern = ctx.createPattern(img, 'repeat');

  // 直接使用 safeArea 的位置
  ctx.moveTo(safeArea.x, safeArea.y);
  ctx.lineTo(safeArea.x, safeArea.y + safeArea.height);
  ctx.lineTo(safeArea.x + safeArea.width, safeArea.y + safeArea.height);
  ctx.lineTo(safeArea.x + safeArea.width, safeArea.y);
  ctx.closePath();

  ctx.globalAlpha = 0.7;
  // ctx.fillStyle = pattern!;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fill('evenodd');
  ctx.globalAlpha = 1;
};

/** Stage/Shape 点击事件 */
export const handleClick = (e: KonvaEventObject<MouseEvent>) => {
  const { keepShiftKey, selectedIds } = useEditorStore.getState();
  const _selectedIds = getSelectedIdsByClickEvent(e);
  if (keepShiftKey) {
    handleSelect([...selectedIds, ..._selectedIds]);
  } else {
    handleSelect(_selectedIds);
  }
};

export const getSelectedIdsByClickEvent = (
  e: KonvaEventObject<MouseEvent, unknown>,
) => {
  const { shapes, safeArea, selectedIds } = useEditorStore.getState();
  // 检查是否为右键点击
  const isRightClick = e.evt.button === 2;

  // 已选择（>=2个）时右键直接返回，兼容右键菜单
  if (isRightClick && selectedIds.length > 1) {
    return selectedIds;
  }
  // TODO: 当选中多个元素时，判断右键点击是否在选中区域内

  // 右键"非基础画布"等元素时可选中
  const targetId = e.target.id();
  const notAllowedSelection =
    e.target === e.target.getStage() || targetId === safeArea.id;
  if (isRightClick && !notAllowedSelection) {
    return [targetId];
  }

  if (
    notAllowedSelection ||
    shapes.some((shape) => shape.id === targetId && shape.isLocked)
  ) {
    return [];
  } else {
    return [targetId];
  }
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
  setSelectedIds(ids);
  setShapes(newShapes);
  addToHistory(newShapes);
};

export const handleStageWheel = (e: KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();

  const scaleBy = 1.1;
  const stage = e.target as Stage;

  if (!stage) return;

  const oldScale = stage.scaleX();

  // 根据滚轮方向确定新的缩放值
  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

  // 限制最小和最大缩放
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 1.5;
  const boundedScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

  useEditorStore.setState({ scale: boundedScale });
};

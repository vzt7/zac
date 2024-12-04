import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Circle,
  Download,
  Grid,
  Group,
  Hexagon,
  Layers,
  Lock,
  RotateCcw,
  RotateCw,
  Ruler,
  Settings,
  Square,
  Star,
  Text,
  Triangle,
  Upload,
} from 'lucide-react';
import { useRef } from 'react';

import {
  addToHistory,
  handleAddShape,
  handleAddText,
  handleImageUpload,
  handleLoad,
  handleRedo,
  handleSave,
  handleUndo,
} from '../editor.handler';
import { useGrouping } from '../editor.hook';
import { useEditorStore } from '../editor.store';

// 扩展工具栏
export const Toolbar = ({
  onExportPNG,
  onExportSVG,
}: {
  onExportPNG: () => void;
  onExportSVG: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { groupSelected, ungroup } = useGrouping();

  const handleLockToggle = () => {
    const { shapes, setShapes } = useEditorStore.getState();
    const newShapes = shapes.map((shape) => {
      if (shape.isSelected) {
        return { ...shape, isLocked: !shape.isLocked };
      }
      return shape;
    });
    setShapes(newShapes);
    addToHistory(newShapes);
  };

  const handleAlign = (direction: 'left' | 'center' | 'right' | 'justify') => {
    const { shapes, setShapes } = useEditorStore.getState();
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
      {
        left: Infinity,
        right: -Infinity,
        top: Infinity,
        bottom: -Infinity,
      },
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
        case 'justify':
          updates = {
            x:
              bounds.left +
              (bounds.right - bounds.left) / 2 -
              (shape.width || 0) / 2,
          };
          break;
      }

      return { ...shape, ...updates };
    });

    setShapes(newShapes);
    addToHistory(newShapes);
  };

  const height = useEditorStore((state) => state.editorProps?.height);

  return (
    <div
      className={`z-10 flex flex-col max-h-[${height}] overflow-y-scroll gap-2 bg-white p-2 shadow-md`}
    >
      <div className="border-b pb-2">
        <button
          onClick={() => handleAddShape('rect')}
          className="p-2 hover:bg-gray-100"
        >
          <Square size={24} />
        </button>
        <button
          onClick={() => handleAddShape('circle')}
          className="p-2 hover:bg-gray-100"
        >
          <Circle size={24} />
        </button>
        <button
          onClick={() => handleAddShape('triangle')}
          className="p-2 hover:bg-gray-100"
        >
          <Triangle size={24} />
        </button>
        <button
          onClick={() => handleAddShape('polygon')}
          className="p-2 hover:bg-gray-100"
        >
          <Hexagon size={24} />
        </button>
        <button
          onClick={() => handleAddShape('star')}
          className="p-2 hover:bg-gray-100"
        >
          <Star size={24} />
        </button>
      </div>

      <div className="border-b pb-2">
        <button
          onClick={() => handleAlign('left')}
          className="p-2 hover:bg-gray-100"
        >
          <AlignLeft size={24} />
        </button>
        <button
          onClick={() => handleAlign('center')}
          className="p-2 hover:bg-gray-100"
        >
          <AlignCenter size={24} />
        </button>
        <button
          onClick={() => handleAlign('right')}
          className="p-2 hover:bg-gray-100"
        >
          <AlignRight size={24} />
        </button>
        <button
          onClick={() => handleAlign('justify')}
          className="p-2 hover:bg-gray-100"
        >
          <AlignJustify size={24} />
        </button>
      </div>

      <div className="border-b pb-2">
        <button onClick={handleLockToggle} className="p-2 hover:bg-gray-100">
          <Lock size={24} />
        </button>
      </div>

      <button onClick={handleUndo} className="p-2 hover:bg-gray-100">
        <RotateCcw size={24} />
      </button>
      <button onClick={handleRedo} className="p-2 hover:bg-gray-100">
        <RotateCw size={24} />
      </button>
      <button onClick={handleSave} className="p-2 hover:bg-gray-100">
        <Settings size={24} />
      </button>
      <button onClick={handleLoad} className="p-2 hover:bg-gray-100">
        <Layers size={24} />
      </button>
      <button onClick={handleAddText} className="p-2 hover:bg-gray-100">
        <Text size={24} />
      </button>
      <button onClick={groupSelected} className="p-2 hover:bg-gray-100">
        <Group size={24} />
      </button>
      <button onClick={onExportPNG} className="p-2 hover:bg-gray-100">
        <Download size={24} />
        <span>Export PNG</span>
      </button>
      <button onClick={onExportSVG} className="p-2 hover:bg-gray-100">
        <Download size={24} />
        <span>Export SVG</span>
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-gray-100"
      >
        <Upload size={24} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </button>
      {/* <button onClick={onToggleGrid} className="p-2 hover:bg-gray-100">
        <Grid size={24} />
      </button>
      <button onClick={onToggleRulers} className="p-2 hover:bg-gray-100">
        <Ruler size={24} />
      </button> */}
    </div>
  );
};

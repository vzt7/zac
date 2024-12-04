import { Settings } from 'lucide-react';
import { ChangeEvent } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape, useEditorStore } from '../editor.store';

export const PropertiesPanel = () => {
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);
  const selectedShape = shapes.find((s) => selectedIds.includes(s.id)) || null;

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    property: keyof Shape,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      handleUpdate({ [property]: value, id: selectedShape!.id });
    }
  };

  const handleColorInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleUpdate({ fill: e.target.value, id: selectedShape!.id });
  };

  const handleEffectChange = (effect: string, value: number) => {
    handleUpdate({ [effect]: value, id: selectedShape!.id });
  };

  if (!selectedShape) return null;

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Settings size={20} />
        <span className="font-bold">属性设置</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">位置</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs">X</span>
              <input
                type="number"
                value={selectedShape.x}
                onChange={(e) => handleNumberInput(e, 'x')}
                className="w-full border p-1 text-sm"
              />
            </div>
            <div>
              <span className="text-xs">Y</span>
              <input
                type="number"
                value={selectedShape.y}
                onChange={(e) => handleNumberInput(e, 'y')}
                className="w-full border p-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">大小</label>
          <div className="grid grid-cols-2 gap-2">
            {selectedShape.type === 'rect' ? (
              <>
                <div>
                  <span className="text-xs">宽度</span>
                  <input
                    type="number"
                    value={selectedShape.width}
                    onChange={(e) => handleNumberInput(e, 'width')}
                    className="w-full border p-1 text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs">高度</span>
                  <input
                    type="number"
                    value={selectedShape.height}
                    onChange={(e) => handleNumberInput(e, 'height')}
                    className="w-full border p-1 text-sm"
                  />
                </div>
              </>
            ) : (
              <div>
                <span className="text-xs">半径</span>
                <input
                  type="number"
                  value={selectedShape.radius}
                  onChange={(e) => handleNumberInput(e, 'radius')}
                  className="w-full border p-1 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">旋转</label>
          <input
            type="number"
            value={selectedShape.rotation}
            onChange={(e) => handleNumberInput(e, 'rotation')}
            className="w-full border p-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">颜色</label>
          <input
            type="color"
            value={selectedShape.fill || '#000000'}
            onChange={handleColorInput}
            className="w-full"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">效果</label>
          <div className="space-y-2">
            <div>
              <span className="text-xs">阴影模糊</span>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedShape.shadowBlur || 0}
                onChange={(e) =>
                  handleEffectChange('shadowBlur', Number(e.target.value))
                }
                className="w-full"
              />
            </div>
            <div>
              <span className="text-xs">阴影颜色</span>
              <input
                type="color"
                value={selectedShape.shadowColor || '#000000'}
                onChange={(e) => handleUpdate({ shadowColor: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <span className="text-xs">透明度</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedShape.opacity || 1}
                onChange={(e) =>
                  handleEffectChange('opacity', Number(e.target.value))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

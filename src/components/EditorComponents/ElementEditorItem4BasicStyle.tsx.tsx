import { ChangeEvent } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';

const PRESET_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#C70039', // Dark Red
  '#6B7280', // Gray
  '#ffffff', // White
  '#4A90E2', // Sky Blue
  '#50E3C2', // Light Cyan
  '#FFC300', // Bright Yellow
  '#FF5733', // Bright Orange
  '#581845', // Dark Purple
  '#900C3F', // Wine Red
  '#FF6F61', // Coral
  '#000000', // Black
  'transparent', // Transparent
];

// Add new constant configuration
const STEP_CONFIG = {
  position: 1, // Position step
  size: 1, // Size step
  rotation: 1, // Rotation step
  opacity: 0.01, // Opacity step
  stroke: 0.5, // Stroke width step
  shadow: 1, // Shadow offset step
};

// Add a helper function to format numbers
const formatNumber = (value: number, precision: number = 2) => {
  return Number(value.toFixed(precision));
};

export const ElementEditorItem4BasicStyle = ({
  defaultChecked = false,
  onCheckedChange,
  selectedShape,
}: {
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  selectedShape: Shape;
}) => {
  const handleColorInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleUpdate({ fill: e.target.value, id: selectedShape!.id });
  };

  const handleEffectChange = (effect: string, value: number | string) => {
    handleUpdate({ [effect]: value, id: selectedShape!.id });
  };

  return (
    <>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      <div className="collapse-title font-medium">Style</div>
      <div className="collapse-content space-y-4">
        {/* Color Picker */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Fill Color</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-lg cursor-pointer hover:scale-110 transition-transform ${
                  color === 'transparent' ? 'transparent-bg-img' : ``
                }`}
                style={{
                  backgroundColor: color === 'transparent' ? '' : color,
                  backgroundSize: '100% 100%',
                }}
                onClick={() =>
                  // TODO: Various cases for svg internal paths fill
                  handleUpdate({ id: selectedShape!.id }, (nextShapes) => {
                    const newShape = nextShapes.find(
                      (s) => s.id === selectedShape!.id,
                    );
                    if (newShape) {
                      if (newShape.isSvgGroup) {
                        newShape.children?.forEach((child) => {
                          child.fill = color;
                        });
                      } else {
                        newShape.fill = color;
                      }
                    }
                    return nextShapes;
                  })
                }
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedShape.fill?.toString() || '#000000'}
            onChange={handleColorInput}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>

        {/* Stroke Style */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Stroke Style</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="select select-bordered select-sm"
              value={selectedShape.lineCap || 'butt'}
              onChange={(e) => handleEffectChange('lineCap', e.target.value)}
            >
              <option value="butt">Butt</option>
              <option value="round">Round</option>
              <option value="square">Square</option>
            </select>
            <select
              className="select select-bordered select-sm"
              value={selectedShape.lineJoin || 'miter'}
              onChange={(e) => handleEffectChange('lineJoin', e.target.value)}
            >
              <option value="miter">Miter</option>
              <option value="round">Round</option>
              <option value="bevel">Bevel</option>
            </select>
          </div>
        </div>

        {/* Dashed Line Settings */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Dashed Line</span>
          </label>
          <div className="join w-full">
            <input
              type="number"
              value={
                selectedShape.dashEnabled ? selectedShape.dash?.[0] || 5 : 0
              }
              onChange={(e) => {
                const value = Number(e.target.value);
                handleUpdate({
                  dashEnabled: value > 0,
                  dash: value > 0 ? [value, value] : undefined,
                  id: selectedShape!.id,
                });
              }}
              className="input input-bordered input-sm w-24 join-item"
              min="0"
              max="20"
            />
            <select
              className="select select-bordered select-sm join-item"
              value={selectedShape.dash?.join(',') || '5,5'}
              onChange={(e) => {
                const [a, b] = e.target.value.split(',').map(Number);
                handleUpdate({
                  dash: [a, b],
                  dashEnabled: true,
                  id: selectedShape!.id,
                });
              }}
            >
              <option value="5,5">Even</option>
              <option value="10,5">Long-Short</option>
              <option value="15,5,5,5">Dotted Line</option>
            </select>
          </div>
        </div>

        {/* Corner Radius Settings (only effective for rectangles) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Corner Radius</span>
          </label>
          <input
            type="range"
            min="0"
            max={
              Math.max(
                selectedShape.width || 0,
                selectedShape.height || 0,
                200,
              ) /
                2 +
              1
            }
            value={selectedShape.cornerRadius || 0}
            onChange={(e) =>
              handleEffectChange('cornerRadius', Number(e.target.value))
            }
            className="range range-primary range-sm"
          />
        </div>

        {/* Add Opacity Control */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Opacity</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step={STEP_CONFIG.opacity}
            value={selectedShape.opacity || 1}
            onChange={(e) =>
              handleEffectChange('opacity', Number(e.target.value))
            }
            className="range range-primary range-sm"
          />
          <div className="w-full flex justify-between text-xs px-2">
            <span>0%</span>
            <span>{formatNumber((selectedShape.opacity || 1) * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Add Stroke Configuration */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Stroke</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="color"
              value={selectedShape.stroke?.toString() || '#000000'}
              onChange={(e) => handleEffectChange('stroke', e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              value={formatNumber(selectedShape.strokeWidth || 0, 1)}
              onChange={(e) =>
                handleEffectChange('strokeWidth', Number(e.target.value))
              }
              className="input input-bordered input-sm"
              step={STEP_CONFIG.stroke}
              min="0"
              max="50"
            />
          </div>
        </div>

        {/* Add Shadow Effect */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Shadow</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={!!selectedShape.shadowEnabled}
                onChange={(e) =>
                  handleEffectChange('shadowEnabled', e.target.checked ? 1 : 0)
                }
              />
              <span className="label-text-alt">Enable Shadow</span>
            </div>
            {Boolean(selectedShape.shadowEnabled) && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="color"
                  value={selectedShape.shadowColor || '#000000'}
                  onChange={(e) =>
                    handleEffectChange('shadowColor', e.target.value)
                  }
                  className="w-full h-8 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  value={selectedShape.shadowBlur || 5}
                  onChange={(e) =>
                    handleEffectChange('shadowBlur', Number(e.target.value))
                  }
                  className="input input-bordered input-sm"
                  min="0"
                  max="50"
                />
                <input
                  type="number"
                  placeholder="X Offset"
                  value={selectedShape.shadowOffsetX || 0}
                  onChange={(e) =>
                    handleEffectChange('shadowOffsetX', Number(e.target.value))
                  }
                  className="input input-bordered input-sm"
                  step={STEP_CONFIG.shadow}
                />
                <input
                  type="number"
                  placeholder="Y Offset"
                  value={selectedShape.shadowOffsetY || 0}
                  onChange={(e) =>
                    handleEffectChange('shadowOffsetY', Number(e.target.value))
                  }
                  className="input input-bordered input-sm"
                  step={STEP_CONFIG.shadow}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

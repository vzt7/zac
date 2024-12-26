import { ChangeEvent } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';

// Add new constant configuration
const STEP_CONFIG = {
  scale: 0.1, // Scale step
};

// Add a helper function to format numbers
const formatNumber = (value: number, precision: number = 2) => {
  return Number(value.toFixed(precision));
};

export const ElementEditorItem4AdvancedSettings = ({
  defaultChecked = false,
  onCheckedChange,
  selectedShape,
}: {
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  selectedShape: Shape;
}) => {
  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    property: keyof Shape,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const finalValue =
        property === 'x' || property === 'y' ? Math.round(value) : value;
      handleUpdate({ [property]: finalValue, id: selectedShape!.id });
    }
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
      <div className="collapse-title font-medium">Advanced</div>
      <div className="collapse-content space-y-4">
        {/* Scale */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Scale</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">
                <span className="label-text-alt">X</span>
              </label>
              <input
                type="number"
                value={formatNumber(selectedShape.scaleX || 1)}
                onChange={(e) => handleNumberInput(e, 'scaleX')}
                className="input input-bordered input-sm w-full"
                step={STEP_CONFIG.scale}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text-alt">Y</span>
              </label>
              <input
                type="number"
                value={formatNumber(selectedShape.scaleY || 1)}
                onChange={(e) => handleNumberInput(e, 'scaleY')}
                className="input input-bordered input-sm w-full"
                step={STEP_CONFIG.scale}
              />
            </div>
          </div>
        </div>

        {/* Blend Mode */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Blend Mode</span>
            <span className="label-text-alt">
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  if (
                    selectedShape.globalCompositeOperation !== 'source-over'
                  ) {
                    handleUpdate({
                      globalCompositeOperation: 'source-over',
                      id: selectedShape!.id,
                    });
                  }
                }}
              >
                Reset
              </button>
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['source-over', 'Normal'],
              ['multiply', 'Multiply'],
              ['screen', 'Screen'],
              ['overlay', 'Overlay'],
              ['darken', 'Darken'],
              ['lighten', 'Lighten'],
              ['color-dodge', 'Color Dodge'],
              ['color-burn', 'Color Burn'],
              ['hard-light', 'Hard Light'],
              ['soft-light', 'Soft Light'],
              ['difference', 'Difference'],
              ['exclusion', 'Exclusion'],
            ].map(([value, label]) => (
              <div
                key={value}
                className={`p-2 border rounded cursor-pointer hover:bg-base-200 ${
                  selectedShape.globalCompositeOperation === value
                    ? 'border-primary'
                    : 'border-base-300'
                }`}
                onClick={() =>
                  handleEffectChange('globalCompositeOperation', value)
                }
              >
                <div className="w-full h-12 mb-1 rounded relative">
                  {/* Bottom Circle */}
                  <div
                    className="absolute w-8 h-8 rounded-full"
                    style={{
                      background: 'rgba(15, 15, 15, 0.5)',
                      left: '15%',
                      top: '50%',
                      transform: 'translate(33%, -50%)',
                    }}
                  />
                  {/* Top Circle (with blend mode) */}
                  <div
                    className="absolute w-8 h-8 rounded-full"
                    style={{
                      background: '#C6C6C6',
                      right: '15%',
                      top: '50%',
                      transform: 'translate(-33%, -50%)',
                      mixBlendMode: value as any,
                    }}
                  />
                </div>
                <div className="text-xs text-center">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

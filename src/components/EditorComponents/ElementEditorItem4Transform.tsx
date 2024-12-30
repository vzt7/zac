import { debug } from '@/utils/debug';
import clsx from 'clsx';
import { Settings2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';

const TRANSFORM_ORIGIN_PRESETS = [
  { label: 'Top Left', value: 'top-left', x: '0%', y: '0%' },
  { label: 'Top', value: 'top', x: '50%', y: '0%' },
  { label: 'Top Right', value: 'top-right', x: '100%', y: '0%' },
  { label: 'Left', value: 'left', x: '0%', y: '50%' },
  { label: 'Center', value: 'center', x: '50%', y: '50%' },
  { label: 'Right', value: 'right', x: '100%', y: '50%' },
  { label: 'Bottom Left', value: 'bottom-left', x: '0%', y: '100%' },
  { label: 'Bottom', value: 'bottom', x: '50%', y: '100%' },
  { label: 'Bottom Right', value: 'bottom-right', x: '100%', y: '100%' },
];

export const ElementEditorItem4Transform = ({
  selectedShape,
}: {
  selectedShape: Shape;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState({
    x: selectedShape._offset4Transform?.offsetXPercent || 0,
    y: selectedShape._offset4Transform?.offsetYPercent || 0,
  });

  const handlePresetSelect = (
    preset: (typeof TRANSFORM_ORIGIN_PRESETS)[number],
  ) => {
    const x = Number(preset.x.replace('%', ''));
    const y = Number(preset.y.replace('%', ''));
    setFormData((prev) => ({ ...prev, x, y }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const xPercent = (formData.x || 0) / 100;
    const yPercent = (formData.y || 0) / 100;
    const width = selectedShape.width || 0;
    const height = selectedShape.height || 0;
    // const currentOffsetX = selectedShape.offsetX || 0;
    // const currentOffsetY = selectedShape.offsetY || 0;

    const offsetX = width * xPercent;
    const offsetY = height * yPercent;
    // const x =
    //   selectedShape.x +
    //   (offsetX - currentOffsetX) / (selectedShape.scaleX ?? 1);
    // const y =
    //   selectedShape.y +
    //   (offsetY - currentOffsetY) / (selectedShape.scaleY ?? 1);
    handleUpdate({
      id: selectedShape.id,
      // x,
      // y,
      offsetX,
      offsetY,
      _offset4Transform: {
        offsetXPercent: formData.x || 0,
        offsetYPercent: formData.y || 0,
      },
    });

    debug(
      `[ElementEditorItem4KeyFrameTransformOrigin.handleSubmit] update shape ${selectedShape.name || selectedShape.id}`,
      {
        // x: selectedShape.x,
        // y: selectedShape.y,
        offsetX: selectedShape.offsetX,
        offsetY: selectedShape.offsetY,
      },
      {
        // x,
        // y,
        offsetX,
        offsetY,
      },
    );

    dialogRef.current?.close();
  };

  return (
    <div>
      <button
        className="btn bg-base-300 w-full"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Settings2 size={16} className="mr-2" />
        Set Transform Origin
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4">Set Transform Origin</h3>
          <p className="text-sm text-gray-500 mb-6">
            <span>
              Please note that if you want the element to maintain center
              rotation within{' '}
            </span>
            <span className="font-bold">the current Key Frame</span>
            <span>, you need to set </span>
            <span className="font-bold">the previous Key Frame</span>
            <span> of the element to center rotation as well.</span>
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {TRANSFORM_ORIGIN_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={clsx(
                    'btn',
                    Number(preset.x.replace('%', '')) === formData.x &&
                      Number(preset.y.replace('%', '')) === formData.y
                      ? 'btn-primary'
                      : 'btn-outline',
                  )}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Custom Position</span>
              </label>
              <div className="flex gap-4">
                <label className="input input-bordered flex items-center gap-2">
                  <span>X</span>
                  <input
                    type="number"
                    name="x"
                    className="input input-ghost border-none w-full"
                    value={formData.x}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span>%</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <span>Y</span>
                  <input
                    type="number"
                    name="y"
                    className="input input-ghost border-none w-full"
                    value={formData.y}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                  />
                  <span>%</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn w-28"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary w-28">
                Confirm
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </div>
  );
};

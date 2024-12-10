import { useEffect, useState } from 'react';

import { canvases } from './SidebarCanvasesData';
import { useHeaderSettings } from './header.store';

export const SidebarCanvases = ({
  onSelect,
}: {
  onSelect: (safeArea: (typeof canvases)[number]) => void;
}) => {
  const [selected, setSelected] = useState<(typeof canvases)[number] | null>(
    null,
  );
  useEffect(() => {
    setCustomConfig(undefined);
  }, [selected]);

  const [customConfig, setCustomConfig] =
    useState<Partial<Parameters<typeof onSelect>['0']>>();
  const isValidCustomConfig = Boolean(
    customConfig?.safeArea?.width &&
      customConfig?.safeArea?.height &&
      customConfig.safeArea.width > 0 &&
      customConfig.safeArea.height > 0,
  );

  const currentProject = useHeaderSettings((state) => state.currentProject);
  useEffect(() => {
    if (currentProject) {
      const selectedCanvas = canvases.find(
        (item) => item.id === currentProject.canvas?.id,
      );
      if (selectedCanvas) {
        setSelected(selectedCanvas);
      }
    }
  }, [currentProject]);

  // 已选择画布时，禁用所有button
  const isCanvasSelected = Boolean(currentProject?.canvas?.id);

  return (
    <div className="flex flex-col gap-4 pb-10">
      {Object.entries(
        canvases.reduce(
          (acc, item) => {
            const category = item.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
          },
          {} as Record<string, typeof canvases>,
        ),
      ).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-medium px-4 mb-2">{category}</h3>
          <div className="flex flex-row flex-wrap gap-4 py-4">
            {items.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelected(item)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 w-32 transition-all ${
                  selected?.id === item.id
                    ? 'border-primary bg-primary/10'
                    : `border-base/5 ${isCanvasSelected ? '' : 'hover:border-primary/50'}`
                } ${isCanvasSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={isCanvasSelected}
              >
                <div className="text-inherit text-4xl mb-2">{item.icon}</div>
                <div className="text-inherit text-sm font-medium">
                  {item.name}
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  {item.id === 'custom' ? (
                    <>? x ?</>
                  ) : (
                    <>
                      {item.safeArea.width} x {item.safeArea.height}
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selected?.id === 'custom' && items[0].id === 'custom' && (
            <div className="flex flex-row flex-nowrap items-center gap-2">
              <input
                type="number"
                placeholder="Width"
                className="input input-bordered w-full max-w-xs"
                max={10000}
                min={1}
                onChange={(e) =>
                  setCustomConfig((prev) => ({
                    ...prev,
                    width: parseInt(e.target.value, 10),
                  }))
                }
              />
              <span>x</span>
              <input
                type="number"
                placeholder="Height"
                className="input input-bordered w-full max-w-xs m-0"
                max={10000}
                min={1}
                onChange={(e) =>
                  setCustomConfig((prev) => ({
                    ...prev,
                    height: parseInt(e.target.value, 10),
                  }))
                }
              />
            </div>
          )}
        </div>
      ))}

      <div className="col-span-3 flex justify-center mt-4">
        {selected && selected.id === 'custom' && (
          <button
            onClick={() => onSelect(customConfig as any)}
            className="btn btn-primary w-full"
            disabled={isCanvasSelected || !isValidCustomConfig}
          >
            {`确认选择${isValidCustomConfig ? ` 自定义${customConfig!.safeArea!.width}x${customConfig!.safeArea!.height}` : ''}`}
          </button>
        )}
        {selected && selected.id !== 'custom' && (
          <button
            onClick={() => onSelect(selected)}
            className="btn btn-primary w-full"
            disabled={isCanvasSelected || !selected}
          >
            {`确认选择 ${selected.name}`}
          </button>
        )}
      </div>
    </div>
  );
};

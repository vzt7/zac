import { useEffect, useState } from 'react';

import { ProjectCanvas, canvases } from './SidebarCanvasesData';
import { useHeaderStore } from './header.store';

export const SidebarCanvases = () => {
  const [selected, setSelected] = useState<(typeof canvases)[number] | null>(
    null,
  );
  useEffect(() => {
    setCustomConfig(undefined);
  }, [selected]);

  const handleSelectCanvas = (canvas: ProjectCanvas) => {
    const { currentProject, selectProject } = useHeaderStore.getState();
    if (!currentProject) {
      return;
    }
    selectProject({
      ...currentProject,
      canvas,
    });
  };

  const [customConfig, setCustomConfig] =
    useState<Partial<Parameters<typeof handleSelectCanvas>['0']>>();
  const isValidCustomConfig = Boolean(
    customConfig?.safeArea?.width &&
      customConfig?.safeArea?.height &&
      customConfig.safeArea.width > 0 &&
      customConfig.safeArea.height > 0,
  );

  const currentProject = useHeaderStore((state) => state.currentProject);
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
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 w-32 transition-all hover:bg-base-300 ${
                  selected?.id === item.id
                    ? 'border-primary bg-primary/10'
                    : `border-base/5 ${isCanvasSelected ? '' : 'hover:border-primary/50'}`
                } ${isCanvasSelected ? 'opacity-60 cursor-not-allowed' : ''} ${
                  items[0].id === 'custom' ? 'w-full' : ''
                }`}
                disabled={isCanvasSelected}
              >
                <div className="text-inherit text-4xl mb-2">{item.icon}</div>
                <div className="text-inherit text-sm font-medium">
                  {item.name}
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  {item.id !== 'custom' && (
                    <>
                      {item.safeArea.width} x {item.safeArea.height}
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selected?.id === 'custom' && items[0].id === 'custom' && (
            <div className="mb-4">
              <div className="flex flex-row flex-nowrap items-center gap-2">
                <input
                  type="number"
                  placeholder="Width"
                  className="input input-bordered w-full max-w-xs input-sm"
                  max={10000}
                  min={1}
                  defaultValue={1980}
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
                  className="input input-bordered w-full max-w-xs input-sm m-0"
                  max={10000}
                  min={1}
                  defaultValue={1080}
                  onChange={(e) =>
                    setCustomConfig((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value, 10),
                    }))
                  }
                />
              </div>
              <button
                onClick={() => handleSelectCanvas(selected)}
                className="btn btn-primary w-full btn-sm h-10 mt-4"
                disabled={isCanvasSelected || !selected}
              >
                {`Confirm ${selected.name}`}
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="col-span-3 flex justify-center mt-4">
        {selected && selected.id === 'custom' && (
          <button
            onClick={() => handleSelectCanvas(customConfig as any)}
            className="btn btn-primary w-full"
            disabled={isCanvasSelected || !isValidCustomConfig}
          >
            {`Confirm ${isValidCustomConfig ? ` Custom ${customConfig!.safeArea!.width}x${customConfig!.safeArea!.height}` : ''}`}
          </button>
        )}
        {selected && selected.id !== 'custom' && (
          <button
            onClick={() => handleSelectCanvas(selected)}
            className="btn btn-primary w-full"
            disabled={isCanvasSelected || !selected}
          >
            {`Confirm ${selected.name}`}
          </button>
        )}
      </div>
    </div>
  );
};

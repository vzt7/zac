import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { canvases as defaultCanvases } from './SidebarCanvasDefaultData';
import { initEditorCanvas } from './editor.init';
import { ProjectCanvas } from './editor.store';
import { useHeaderStore } from './header.store';

export const SidebarCanvasDefault = (
  { canvases }: { canvases: typeof defaultCanvases } = {
    canvases: defaultCanvases,
  },
) => {
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

  const [selected, setSelected] = useState<(typeof canvases)[number] | null>(
    null,
  );

  const handleSelectCanvas = (canvas: ProjectCanvas) => {
    const { currentProject, selectProject } = useHeaderStore.getState();
    if (!currentProject) {
      return;
    }

    if (
      currentProject.canvas?.id &&
      !window.confirm(
        'Change to new Canvas will lost your current canvas history, but keep elements.',
      )
    ) {
      return;
    }

    // Update current canvas
    selectProject({
      ...currentProject,
      canvas,
    });
    // Update Editor Canvas Size
    initEditorCanvas({ specifiedCanvas: canvas, currentProject });
  };

  const [customConfig, setCustomConfig] = useState<{
    width?: number;
    height?: number;
  }>({
    width: 1980,
    height: 1080,
  });
  useEffect(() => {
    if (currentProject?.canvas?.safeArea) {
      setCustomConfig({
        width: currentProject.canvas.safeArea.width,
        height: currentProject.canvas.safeArea.height,
      });
    }
  }, [currentProject?.canvas]);
  const isValidCustomConfig = Boolean(
    customConfig?.width &&
      customConfig?.height &&
      customConfig.width > 0 &&
      customConfig.height > 0,
  );

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
          <h3 className="text-sm font-medium px-2 mb-2">{category}</h3>
          <div
            className={clsx(
              'grid grid-cols-2 gap-4 text-black dark:text-white',
              items[0].id === 'custom' && '!grid-cols-1',
            )}
          >
            {items.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelected(item)}
                className={clsx(
                  `flex flex-col items-center justify-center p-4 py-6 rounded-lg border-2 border-gray-300 dark:border-gray-700 transition-all hover:bg-base-300 hover:border-primary/50`,
                  selected?.id === item.id
                    ? 'border-primary bg-primary/10'
                    : `border-base/5`,
                  isCanvasSelected && 'opacity-60',
                  items[0].id === 'custom' ? 'w-full' : 'min-h-40',
                )}
              >
                <div className="text-inherit text-4xl mb-2">{item.icon}</div>
                <div className="text-inherit text-sm font-medium">
                  {item.name}
                </div>
                <div className="text-xs text-base-content mt-1">
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
            <div className="my-4">
              <div className="flex flex-row flex-nowrap items-center gap-2">
                <input
                  type="number"
                  placeholder="Width"
                  className="input input-bordered w-full max-w-xs"
                  max={10000}
                  min={1}
                  value={customConfig.width}
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
                  value={customConfig.height}
                  onChange={(e) =>
                    setCustomConfig((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value, 10),
                    }))
                  }
                />
              </div>
              <button
                onClick={() =>
                  handleSelectCanvas({
                    id: items[0].id || 'custom',
                    type: items[0].type || 'canvas_image',
                    name: items[0].name || 'Custom',
                    category: items[0].category || 'Custom',
                    safeArea: {
                      width: customConfig.width!,
                      height: customConfig.height!,
                      x: 0,
                      y: 0,
                    },
                  })
                }
                className="btn btn-primary w-full h-10 mt-4"
                disabled={!selected || !isValidCustomConfig}
              >
                {`Confirm ${selected.name}`}
              </button>
            </div>
          )}

          {selected &&
            selected.id !== 'custom' &&
            selected.id !== currentProject?.canvas?.id &&
            selected.category === category &&
            items[0].id !== 'custom' && (
              <button
                onClick={() => handleSelectCanvas(selected)}
                className="btn btn-primary w-full mt-4"
                disabled={!selected}
              >
                {`Confirm ${selected.name}`}
              </button>
            )}
        </div>
      ))}
    </div>
  );
};

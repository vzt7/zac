import { Toolbar } from './Toolbar';
import { useExport } from '../editor.hook';
import { useEditorStore, useSelectedShapes } from '../editor.store';
import { PropertiesPanel } from './ElementEditorPanel';

export const EDITOR_LIBRARY_WIDTH = 400;

export const EditorLibrary = () => {
  const height = useEditorStore((state) => state.editorProps?.height);
  const selectedShapes = useSelectedShapes();

  const stageRef = useEditorStore((state) => state.stageRef);
  const { exportToPNG, exportToSVG } = useExport(stageRef);

  return (
    <div
      style={{
        width: EDITOR_LIBRARY_WIDTH,
      }}
      className={`absolute top-0 right-0 flex flex-col box-border h-full px-6 overflow-hidden bg-base-100 shadow-lg border-l-2 border-base-300 translate-z-0`}
    >
      <header className="">
        <div className="mx-auto mt-8">
          <div className="flex flex-col items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold">ALL Elements</h1>

              <p className="mt-1.5 text-sm text-gray-400">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure,
                recusandae.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              className="inline-block rounded bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring"
              type="button"
            >
              Create Post
            </button>
          </div>
        </div>
      </header>

      <Toolbar onExportPNG={exportToPNG} onExportSVG={exportToSVG} />

      <div className="divider"></div>

      {selectedShapes.every(
        (shape) => !shape.isLocked && (shape.visible ?? true),
      ) && <PropertiesPanel />}
    </div>
  );
};

import { ImageDown, RefreshCw, Save } from 'lucide-react';

import { handleLoad, handleSave } from '../editor.handler';
import { useExport } from '../editor.hook';
import { useEditorStore } from '../editor.store';
import { PropertiesPanel } from './ElementEditorPropertiesPanel';

export const ELEMENT_EDITOR_WIDTH = 400;

export const ElementEditor = () => {
  const selectedShapes = useEditorStore((state) => state.selectedShapes);

  const stageRef = useEditorStore((state) => state.stageRef);
  const { exportToPNG, exportToSVG } = useExport(stageRef);

  return (
    <div
      className={`flex flex-col box-border w-full h-full px-6 overflow-hidden bg-base-100 shadow-lg border-l-2 border-base-300 translate-z-0`}
    >
      <div className="flex flex-col gap-2 py-4">
        <div className="flex flex-row gap-3">
          <button onClick={handleSave} className="btn btn-ghost">
            <Save size={24} />
            <span>Save</span>
          </button>
          <button onClick={handleLoad} className="btn btn-ghost">
            <RefreshCw size={24} />
            <span>Load</span>
          </button>
        </div>
        <div className="flex flex-row gap-3">
          <button onClick={exportToPNG} className="btn btn-ghost">
            <ImageDown size={20} />
            <span>Export PNG</span>
          </button>
          <button onClick={exportToSVG} className="btn btn-ghost">
            <ImageDown size={20} />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      <div className="divider"></div>

      {selectedShapes.length > 0 ? <PropertiesPanel /> : <></>}
    </div>
  );
};

import { Redo, Undo } from 'lucide-react';

import { handleRedo, handleUndo } from '../editor.handler';
import { MAX_SCALE, MIN_SCALE } from '../editor.resize';

interface ControlPanelRightBottomProps {
  scale: number;
  onFitScreen: (scale?: number) => void;
}

export const ControlPanel4Scale = ({
  scale,
  onFitScreen,
}: ControlPanelRightBottomProps) => {
  const handleZoomIn = () => {
    onFitScreen(Math.min(scale * 1.2, MAX_SCALE));
  };

  const handleZoomOut = () => {
    onFitScreen(Math.max(scale * 0.8, MIN_SCALE));
  };

  return (
    <div className="flex items-center gap-2 rounded-lg shadow-md p-2 bg-base-200/40 hover:bg-base-100 transition-all duration-300 *:opacity-30 *:hover:opacity-100">
      <button className="btn btn-sm btn-circle" onClick={handleZoomOut}>
        -
      </button>

      <div className="min-w-[60px] text-center">{Math.round(scale * 100)}%</div>

      <button className="btn btn-sm btn-circle" onClick={handleZoomIn}>
        +
      </button>

      <button className="btn btn-sm" onClick={() => onFitScreen()}>
        Reset
      </button>

      <div className="divider divider-horizontal m-0 py-2"></div>

      <button onClick={handleUndo} className="btn btn-sm">
        <Undo size={14} />
      </button>
      <button onClick={handleRedo} className="btn btn-sm">
        <Redo size={14} />
      </button>
    </div>
  );
};

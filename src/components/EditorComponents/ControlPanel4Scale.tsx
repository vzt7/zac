import { Redo, Undo } from 'lucide-react';

import { handleRedo, handleUndo } from '../editor.handler';

interface ControlPanelRightBottomProps {
  scale: number;
  onFitScreen: (scale?: number) => void;
}

export const ControlPanel4Scale = ({
  scale,
  onFitScreen,
}: ControlPanelRightBottomProps) => {
  const handleZoomIn = () => {
    console.log('handleZoomIn', scale, Math.min(scale * 1.2, 1.5));
    onFitScreen(Math.min(scale * 1.2, 1.5));
  };

  const handleZoomOut = () => {
    console.log('handleZoomOut', scale, Math.max(scale * 0.8, 0.5));
    onFitScreen(Math.max(scale * 0.8, 0.5));
  };

  return (
    <div className="absolute left-4 bottom-4 flex items-center gap-2 bg-base-100 rounded-lg shadow-lg p-2">
      <button className="btn btn-sm btn-circle" onClick={handleZoomOut}>
        -
      </button>

      <div className="min-w-[60px] text-center">{Math.round(scale * 100)}%</div>

      <button className="btn btn-sm btn-circle" onClick={handleZoomIn}>
        +
      </button>

      <button className="btn btn-sm" onClick={() => onFitScreen()}>
        适应屏幕
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

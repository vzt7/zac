import { useEditorStore } from '../editor.store';

interface ControlPanelRightBottomProps {
  scale: number;
  onFitScreen: () => void;
}

export const ControlPanel4Scale = ({
  scale,
  onFitScreen,
}: ControlPanelRightBottomProps) => {
  const updateScale = (newScale: number) => {
    useEditorStore.setState((state) => ({
      editorProps: {
        ...state.editorProps,
        scaleX: newScale,
        scaleY: newScale,
      },
    }));
  };

  const handleZoomIn = () => {
    updateScale(scale * 1.2);
  };

  const handleZoomOut = () => {
    updateScale(scale * 0.8);
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

      <button className="btn btn-sm" onClick={onFitScreen}>
        适应屏幕
      </button>
    </div>
  );
};

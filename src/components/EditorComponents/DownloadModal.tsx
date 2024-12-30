import clsx from 'clsx';
import { Download, Film, ImagePlay } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { handleSelect } from '../editor.handler';
import { useExport as useExportImage } from '../editor.hook';
import { useExport as useExportAnimation } from '../editor.hook.animation';
import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';

export const DownloadModal = forwardRef<HTMLButtonElement, any>(
  (props, ref) => {
    // const { isAuthed } = useAuth();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const currentProject = useHeaderStore((state) => state.currentProject);
    const isAnimationCanvas =
      currentProject?.canvas?.type === 'canvas_animation';

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const stageRef = useEditorStore((state) => state.stageRef);
    useEffect(() => {
      if (!isOpen) {
        setPreviewImage(null);
        return;
      }
      handleSelect([]);
      const src = stageRef.current?.toDataURL();
      if (!src) {
        return;
      }
      setPreviewImage(src);
    }, [isOpen, stageRef]);

    useEffect(() => {
      useEditorStore.setState({
        hideCanvas: isOpen,
      });
      return () => {
        useEditorStore.setState({
          hideCanvas: false,
        });
      };
    }, [isOpen]);

    return (
      <>
        <button
          ref={ref}
          className="btn hidden"
          onClick={() => {
            dialogRef.current?.showModal();
            setIsOpen(true);
          }}
        ></button>
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box px-7">
            <h3 className="font-bold text-xl">Download</h3>
            <p className="text-gray-500 py-2">
              Out of the canvas area will be cut off.
            </p>

            {previewImage && (
              <div>
                <img src={previewImage} />
              </div>
            )}

            {isAnimationCanvas ? (
              <VideoDownload isOpen={isOpen} />
            ) : (
              <ImageDownload isOpen={isOpen} />
            )}
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={() => {
              setIsOpen(false);
            }}
          >
            <button>close</button>
          </form>
        </dialog>
      </>
    );
  },
);

const ImageDownload = ({ isOpen }: { isOpen: boolean }) => {
  // const { isAuthed } = useAuth();
  const isAuthed = false;

  const currentProject = useHeaderStore((state) => state.currentProject);
  const safeArea = useEditorStore((state) => state.safeArea);
  const { exportToPNG } = useExportImage();

  const [pixelRatio, setPixelRatio] = useState(1);

  return (
    <>
      <div className="flex flex-col gap-2 py-6">
        <div className={`${!isAuthed ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <label htmlFor="pixel-ratio">
            Pixel Ratio{' '}
            <span className="text-xs text-gray-500">
              (Higher resolution, larger file size)
            </span>
          </label>
          <input
            id="pixel-ratio"
            type="range"
            className="range mt-2"
            disabled={!isAuthed}
            max={3}
            min={1}
            step={1}
            value={pixelRatio}
            onChange={(e) => setPixelRatio(Number(e.target.value))}
          />
          <div className="flex w-full justify-between px-2 text-sm">
            <span>
              <span>1x</span>
              <span className="ml-1 text-gray-500 text-xs">
                ({safeArea.width}x{safeArea.height})
              </span>
            </span>
            <span>
              <span>2x</span>
              <span className="ml-1 text-gray-500 text-xs">
                ({safeArea.width * 2}x{safeArea.height * 2})
              </span>
            </span>
            <span>
              <span>3x</span>
              <span className="ml-1 text-gray-500 text-xs">
                ({safeArea.width * 3}x{safeArea.height * 3})
              </span>
            </span>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={() => exportToPNG(currentProject!.name!, { pixelRatio })}
      >
        <Download size={20} />
        <span>Download as PNG</span>
      </button>
    </>
  );
};

const VideoDownload = ({ isOpen }: { isOpen: boolean }) => {
  // const { isAuthed } = useAuth();
  const isAuthed = false;

  const currentProject = useHeaderStore((state) => state.currentProject);
  const safeArea = useEditorStore((state) => state.safeArea);
  const { exportToAnimation } = useExportAnimation({
    onProgress: (progress) => {
      setProgress(progress);
    },
  });

  const [pixelRatio, setPixelRatio] = useState(1);
  const [fps, setFps] = useState(30);

  const [isRendering, setIsRendering] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: 'gif' | 'mp4') => {
    const originalShapes = useEditorStore.getState().shapes;
    try {
      setIsRendering(format);
      setError(null);
      await exportToAnimation(currentProject!.name!, {
        format,
        pixelRatio,
        fps,
      });
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsRendering(null);
    }
    useEditorStore.setState({
      shapes: originalShapes,
    });
  };

  return (
    <div className="flex flex-col gap-2 pt-6 pb-2">
      <div className={`${!isAuthed ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <label>
          Pixel Ratio{' '}
          <span className="text-xs text-gray-500">
            (Higher resolution, larger file size)
          </span>
        </label>
        <input
          id="pixel-ratio"
          type="range"
          className="range mt-2"
          disabled={!isAuthed}
          max={3}
          min={1}
          step={1}
          value={pixelRatio}
          onChange={(e) => setPixelRatio(Number(e.target.value))}
        />
        <div className="flex w-full justify-between px-2 text-sm">
          <span>
            <span>1x</span>
            <span className="ml-1 text-gray-500 text-xs">
              ({safeArea.width}x{safeArea.height})
            </span>
          </span>
          <span>
            <span>2x</span>
            <span className="ml-1 text-gray-500 text-xs">
              ({safeArea.width * 2}x{safeArea.height * 2})
            </span>
          </span>
          <span>
            <span>3x</span>
            <span className="ml-1 text-gray-500 text-xs">
              ({safeArea.width * 3}x{safeArea.height * 3})
            </span>
          </span>
        </div>
      </div>

      <div
        className={clsx(
          'mt-2',
          !isAuthed ? 'opacity-50 [&_*]:!cursor-not-allowed' : '',
        )}
      >
        <label>FPS</label>
        <div className={clsx('flex flex-row items-center gap-1')}>
          <input
            type="range"
            className="range mt-2"
            disabled={!isAuthed}
            max={240}
            min={15}
            step={1}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
          />
          <div className="text-center px-4">{fps}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-6">
        {error && <div className="text-error text-sm">{error}</div>}

        <button
          className="btn btn-primary w-full"
          onClick={() => handleExport('gif')}
          disabled={Boolean(isRendering)}
        >
          {isRendering === 'gif' ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              <span>
                {typeof progress === 'number'
                  ? `${progress}% Rendering...`
                  : 'Rendering...'}
              </span>
            </>
          ) : (
            <>
              <ImagePlay size={20} />
              <span>Download GIF</span>
            </>
          )}
        </button>
        <button
          className="btn btn-primary w-full"
          onClick={() => handleExport('mp4')}
          disabled={Boolean(isRendering)}
        >
          {isRendering === 'mp4' ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              <span>
                {typeof progress === 'number'
                  ? `${progress}% Rendering...`
                  : 'Rendering...'}
              </span>
            </>
          ) : (
            <>
              <Film size={20} />
              <span>Download MP4</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import { Download } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { handleSelect } from '../editor.handler';
import { useExport } from '../editor.hook';
import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';

export const DownloadModal = forwardRef<HTMLButtonElement, any>(
  (props, ref) => {
    // const { isAuthed } = useAuth();
    const isAuthed = false;
    const dialogRef = useRef<HTMLDialogElement>(null);

    const currentProject = useHeaderStore((state) => state.currentProject);
    const safeArea = useEditorStore((state) => state.safeArea);
    const stageRef = useEditorStore((state) => state.stageRef);
    const { exportToPNG } = useExport();

    const [pixelRatio, setPixelRatio] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
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

            <div className="flex flex-col gap-2 py-6">
              <div
                className={`${!isAuthed ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
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

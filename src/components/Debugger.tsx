import { FC, useMemo, useRef, useState } from 'react';

import { useEditorStore } from './editor.store';

const StageDebugger = () => {
  const safeArea = useEditorStore((state) => state.safeArea);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const shapes = useEditorStore((state) => state.shapes);
  const shapesAsJson = useMemo(() => {
    try {
      return JSON.stringify(shapes, null, 2);
    } catch (error: any) {
      console.error(error);
      return error.message;
    }
  }, [shapes]);

  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shapesAsJson);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <div className="absolute bottom-0 left-[50%] translate-x-[-50%] bg-warning text-warning-content p-2 rounded-2xl opacity-20 hover:opacity-100 transition-all duration-300">
      <div className="flex flex-col relative">
        <span className="font-bold text-center">
          {safeArea.width} x {safeArea.height}
        </span>
        <button
          className="btn btn-sm my-1"
          onClick={() => dialogRef.current?.showModal()}
        >
          Shapes JSON
        </button>
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box min-h-[400px] relative">
            <button
              className="btn btn-primary w-full mb-4"
              onClick={handleCopy}
            >
              Copy to clipboard
            </button>
            <textarea
              className="textarea textarea-bordered textarea-xs w-full min-h-[400px] text-lg text-base-content"
              value={shapesAsJson}
              onChange={() => null}
            ></textarea>
            {showCopyToast && (
              <div className="toast toast-center">
                <div className="alert alert-success font-bold items-center flex">
                  <span>Copied to clipboard</span>
                </div>
              </div>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export const Debugger = import.meta.env.DEV ? StageDebugger : () => null;

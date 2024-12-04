import { Download } from 'lucide-react';
import { PropsWithChildren, forwardRef, useEffect, useState } from 'react';

import { transparentBackground } from '../assets/transparent';
import { useHeaderSettings } from './header.store';

export const ModalExport = forwardRef<
  HTMLDialogElement,
  PropsWithChildren<{
    onClose: () => void;
    onExport: (type: 'png' | 'svg') => void;
    image: string;
  }>
>(({ onClose, onExport, image, children }, ref) => {
  const lang = useHeaderSettings((state) => state.lang);
  const [ratio, setRatio] = useState(1);

  return (
    <>
      <dialog className="modal" ref={ref} onClose={onClose}>
        <div className="modal-box max-w-[700px]">
          <div className="flex flex-row py-4 justify-around">
            <div
              className="flex justify-center items-center w-[300px] h-[300px] flex-shrink-0 border-gray-200 border-2 rounded-xl"
              style={{
                background: `url(${transparentBackground})`,
              }}
            >
              {image ? (
                <img src={image} className="object-scale-down"></img>
              ) : (
                <span className="loading loading-spinner loading-lg text-gray-400"></span>
              )}
            </div>

            <div className="flex flex-col justify-between py-4">
              <div>
                <div className="text-2xl font-bold my-6 mt-3">导出图片</div>
                <div className="flex flex-row gap-3 items-center justify-start">
                  <div className="text-sm font-bold">缩放比例：</div>
                  <div className="join">
                    {[1, 2, 3].map((num) => (
                      <input
                        key={num}
                        className="join-item btn btn-sm"
                        type="radio"
                        name="options"
                        aria-label={`${num}x`}
                        onClick={() => setRatio(num)}
                        defaultChecked={num === ratio}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-row gap-3 items-center">
                <button
                  className="btn btn-primary"
                  onClick={() => onExport('png')}
                >
                  <Download size={20} />
                  导出 PNG
                </button>
                <button className="btn" onClick={() => onExport('svg')}>
                  <Download size={20} />
                  导出 SVG
                </button>
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          {/* if there is a button in form, it will close the modal */}
          <button>X</button>
        </form>
      </dialog>
    </>
  );
});

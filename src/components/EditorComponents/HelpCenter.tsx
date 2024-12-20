import { isMacOs } from '@/utils/platform';
import { CircleHelp } from 'lucide-react';
import { useRef } from 'react';

export const HelpCenter = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const modKey = isMacOs() ? (
    <kbd className="kbd">⌘</kbd>
  ) : (
    <kbd className="kbd">ctrl</kbd>
  );

  // 详细的使用教程
  // 视频教学
  // 常用功能说明
  // 快捷键完整列表
  // 问题排查指南

  return (
    <div className="rounded-lg shadow-lg">
      <button
        tabIndex={-1}
        className="btn btn-sm w-12 h-12 border-base-200/40 bg-base-200/40 hover:bg-base-100 transition-all duration-300"
        onClick={() => modalRef.current?.showModal()}
      >
        <CircleHelp size={22} opacity={0.9} />
      </button>
      <dialog ref={modalRef} className="modal">
        <div className="modal-box flex flex-col gap-6">
          <div>
            <h1 className="font-bold text-3xl pb-1">Help Center</h1>
            <p className="text-sm text-gray-500">
              {import.meta.env.VITE_APP_NAME} is a tool for creating posters or
              any images.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Auto Save</h2>
            <p className="text-sm text-gray-500">
              Automatically save your projects in local browser storage every 10
              seconds.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Hotkeys Guide</h2>
            <table className="table w-full table-zebra">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Hotkey</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Select ALL</td>
                  <td>
                    {modKey} + <kbd className="kbd">A</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Undo</td>
                  <td>
                    {modKey} + <kbd className="kbd">Z</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Redo</td>
                  <td>
                    {modKey} + <kbd className="kbd">Shift</kbd> +{' '}
                    <kbd className="kbd">Z</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Cut</td>
                  <td>
                    {modKey} + <kbd className="kbd">X</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Copy</td>
                  <td>
                    {modKey} + <kbd className="kbd">C</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Paste</td>
                  <td>
                    {modKey} + <kbd className="kbd">V</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Save</td>
                  <td>
                    {modKey} + <kbd className="kbd">S</kbd>
                  </td>
                </tr>
                <tr>
                  <td>Drag Mode (Canvas)</td>
                  <td>
                    <kbd className="kbd">Space</kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

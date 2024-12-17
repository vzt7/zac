import { ImageDown, RefreshCw, Save } from 'lucide-react';
import { useRef } from 'react';

import { handleLoad, handleSave } from '../editor.handler';
import { useExport } from '../editor.hook';
import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';
import { DownloadModal } from './DownloadModal';
import { ElementEditorItems } from './ElementEditorItems';

export const ELEMENT_EDITOR_WIDTH = 460;

export const ElementEditor = () => {
  const projectId = useEditorStore((state) => state.projectId);

  const downloadModalRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={`flex flex-col box-border w-full h-full px-6 overflow-hidden bg-base-100 shadow-lg border-l-2 border-base-300`}
      style={{
        width: ELEMENT_EDITOR_WIDTH,
      }}
    >
      <div className="flex flex-col gap-2 py-4">
        {projectId && (
          <div className="flex flex-row gap-3">
            <button
              onClick={() => downloadModalRef.current?.click()}
              className="btn btn-outline w-full"
            >
              <ImageDown size={20} />
              <span>Download</span>
            </button>

            <DownloadModal ref={downloadModalRef} />
          </div>
        )}
        {/* <div className="flex flex-row gap-3"></div> */}
      </div>

      <div className="divider mt-0"></div>

      <ElementEditorItems />
    </div>
  );
};

import { ImageDown, Plus } from 'lucide-react';
import { useRef } from 'react';

import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';
import { DownloadModal } from './DownloadModal';
import { ElementEditorItems } from './ElementEditorItems';
import { ElementEditorItemsAnimation } from './ElementEditorItemsAnimation';

export const ELEMENT_EDITOR_WIDTH = 460;

export const ElementEditor = () => {
  const projectId = useEditorStore((state) => state.projectId);
  const currentProject = useHeaderStore((state) => state.currentProject);

  const downloadModalRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={`flex flex-col box-border w-full h-full px-6 overflow-hidden bg-base-100 shadow-lg border-l-2 border-base-300 overflow-y-auto`}
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

      <div className="divider m-0"></div>

      {currentProject?.canvas?.type === 'canvas_animation' && (
        <ElementEditorItemsAnimation />
      )}

      <ElementEditorItems />
    </div>
  );
};

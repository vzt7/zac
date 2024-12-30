import clsx from 'clsx';
import { Download, FileVideo, ImageDown, Plus } from 'lucide-react';
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

  const isAnimationEditing = useEditorStore(
    (state) => state.isAnimationEditing,
  );
  const isAnimationPlaying = useEditorStore(
    (state) => state.isAnimationPlaying,
  );
  const isAnimationCanvas = currentProject?.canvas?.type === 'canvas_animation';
  return (
    <div
      className={clsx(
        `flex flex-col box-border w-full h-full px-6`,
        'bg-base-100 shadow-lg border-l-2 border-base-300 overflow-x-hidden overflow-y-auto',
        'scroll-smooth',
      )}
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
              disabled={isAnimationPlaying || isAnimationEditing}
            >
              {isAnimationCanvas ? (
                <Download size={20} />
              ) : (
                <ImageDown size={20} />
              )}
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

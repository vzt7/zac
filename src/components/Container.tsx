import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import { Editor } from './Editor';
import {
  ELEMENT_EDITOR_WIDTH,
  ElementEditor,
} from './EditorComponents/ElementEditor';
import { handleLoad } from './editor.handler';
import { resetEditorStore, useEditorStore } from './editor.store';
import { useHeaderStore } from './header.store';

export const Container = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const safeArea = useEditorStore((state) => state.safeArea);

  const currentProject = useHeaderStore((state) => state.currentProject);
  const currentProjectId = currentProject?.id;
  useEffect(() => {
    if (!currentProjectId) {
      return;
    }

    resetEditorStore();

    // 切换项目时恢复Editor数据
    handleLoad(currentProjectId);
  }, [currentProjectId]);

  return (
    <div
      className={clsx(
        `relative flex flex-row w-full h-full bg-transparent overflow-hidden`,
        '[&_*]:scrollbar-thin [&_*]:scrollbar-thumb-base-300 [&_*]:scrollbar-thumb-rounded-full [&_*]:scrollbar-track-transparent',
      )}
      ref={wrapperRef}
    >
      <div key={currentProjectId || ''} data-pid={currentProjectId || ''}>
        {safeArea.isInitialed && <Editor />}
      </div>

      <div className={`flex-shrink-0 w-[${ELEMENT_EDITOR_WIDTH}px]`}>
        <ElementEditor />
      </div>
    </div>
  );
};

import { useEffect, useRef } from 'react';

import { Editor } from './Editor';
import {
  ELEMENT_EDITOR_WIDTH,
  ElementEditor,
} from './EditorComponents/ElementEditor';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import { handleLoad } from './editor.handler';
import { EditorStore, useEditorStore } from './editor.store';

export const Container = ({
  specificSafeArea,
  projectId,
}: {
  specificSafeArea: EditorStore['safeArea'];
  projectId: string;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const safeArea = useEditorStore((state) => state.safeArea);

  useEffect(() => {
    const safeArea = useEditorStore.getState().safeArea;
    // if (safeArea.isInitialed) {
    //   return;
    // }

    const CONTAINER_WIDTH =
      window.innerWidth - SIDEBAR_WIDTH - ELEMENT_EDITOR_WIDTH;
    const CONTAINER_HEIGHT = window.innerHeight - HEADER_HEIGHT;

    useEditorStore.setState({
      projectId,
      editorProps: {
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        scaleX: 1,
        scaleY: 1,
      },
      safeArea: {
        ...safeArea,
        isInitialed: true,
        width: specificSafeArea.width,
        height: specificSafeArea.height,
        x: (CONTAINER_WIDTH - specificSafeArea.width) / 2,
        y: (CONTAINER_HEIGHT - specificSafeArea.height) / 2,
      },
    });
    handleLoad(); // 加载历史记录
  }, [specificSafeArea, projectId]);

  return (
    <div
      className={`relative flex flex-row w-full h-full bg-transparent overflow-hidden`}
      ref={wrapperRef}
    >
      <div className="">{safeArea.isInitialed && <Editor />}</div>

      <div className={`flex-shrink-0 w-[${ELEMENT_EDITOR_WIDTH}px]`}>
        <ElementEditor />
      </div>
    </div>
  );
};

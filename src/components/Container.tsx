import type { Stage as StageType } from 'konva/lib/Stage';
import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

import { Editor } from './Editor';
import {
  EDITOR_LIBRARY_WIDTH,
  EditorLibrary,
} from './EditorComponents/ElementEditor';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import { useExport } from './editor.hook';
import { EditorStore, getEditorCenter, useEditorStore } from './editor.store';

interface Scale {
  x: number;
  y: number;
}

export const Container = ({
  specificSafeArea,
}: {
  specificSafeArea: EditorStore['safeArea'];
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const safeArea = useEditorStore((state) => state.safeArea);

  useEffect(() => {
    const safeArea = useEditorStore.getState().safeArea;
    if (safeArea.isInitialed) {
      return;
    }

    const CONTAINER_WIDTH =
      window.innerWidth - SIDEBAR_WIDTH - EDITOR_LIBRARY_WIDTH;
    const CONTAINER_HEIGHT = window.innerHeight - HEADER_HEIGHT;

    console.log(CONTAINER_WIDTH, CONTAINER_HEIGHT);
    useEditorStore.setState({
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
  }, [specificSafeArea]);

  return (
    <div
      className={`relative w-full h-[calc(100vh-${HEADER_HEIGHT}px)] bg-transparent overflow-hidden`}
      ref={wrapperRef}
    >
      {safeArea.isInitialed && <Editor />}
    </div>
  );
};

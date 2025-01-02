import { ELEMENT_EDITOR_WIDTH } from './EditorComponents/ElementEditor';
import { HEADER_HEIGHT } from './Header';
import { SIDEBAR_WIDTH } from './Sidebar';
import { addToHistory, handleSave } from './editor.handler';
import { type ProjectCanvas, useEditorStore } from './editor.store';
import { Project } from './header.store';

export const initEditorCanvas = ({
  specifiedCanvas,
  currentProject,
}: {
  specifiedCanvas: ProjectCanvas;
  currentProject: Project;
}) => {
  const { editorProps, safeArea, shapes, stageRef } = useEditorStore.getState();

  const CONTAINER_WIDTH =
    window.innerWidth - SIDEBAR_WIDTH - ELEMENT_EDITOR_WIDTH;
  const CONTAINER_HEIGHT = window.innerHeight - HEADER_HEIGHT;

  useEditorStore.setState({
    editorProps: {
      width: editorProps.width || CONTAINER_WIDTH,
      height: editorProps.height || CONTAINER_HEIGHT,
      scaleX: editorProps.scaleX || 1,
      scaleY: editorProps.scaleY || 1,
    },
    safeArea: {
      ...safeArea,
      id: specifiedCanvas.id || 'custom',
      isInitialed: true,
      width: specifiedCanvas.safeArea.width,
      height: specifiedCanvas.safeArea.height,
      x: safeArea.x || (CONTAINER_WIDTH - specifiedCanvas.safeArea.width) / 2,
      y: safeArea.y || (CONTAINER_HEIGHT - specifiedCanvas.safeArea.height) / 2,
    },
    history: [],
    historyIndex: 0,
  });

  // 重置历史记录
  addToHistory(shapes);

  handleSave(currentProject.id);

  setTimeout(() => {
    stageRef.current?.draw();
  }, 0);
};

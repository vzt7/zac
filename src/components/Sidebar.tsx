import { Box, Component, Puzzle, SquareMousePointer } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { ProjectCanvas } from './SidebarCanvasesData';
import { SidebarCanvases } from './SidebarCanvases';
import { useHeaderSettings } from './header.store';

export const SIDEBAR_WIDTH = 401;

enum TABS {
  CANVAS = 'canvas',
  TEMPLATE = 'template',
  MATERIAL = 'material',
  COMPONENT = 'component',
}

export const Sidebar = () => {
  const [currentTab, setCurrentTab] = useState<TABS>(TABS.CANVAS);

  const handleSelectCanvas = (canvas: ProjectCanvas) => {
    const { currentProject, changeCurrentProject } =
      useHeaderSettings.getState();
    if (!currentProject) {
      return;
    }
    changeCurrentProject({
      ...currentProject,
      canvas,
    });
  };

  return (
    <div
      className={`box-border flex-shrink-0 h-full flex flex-row bg-base border-r-2 border-base-300`}
      style={{
        width: SIDEBAR_WIDTH,
      }}
    >
      <div className="flex flex-col flex-shrink-0 h-full">
        <button
          className={`btn btn-ghost btn-lg text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.CANVAS ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.CANVAS)}
        >
          <SquareMousePointer size={24} />
          <span>画布</span>
        </button>
        <button
          className={`btn btn-ghost btn-lg text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.TEMPLATE ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.TEMPLATE)}
        >
          <Box size={24} />
          <span>模板</span>
        </button>
        <button
          className={`btn btn-ghost btn-lg text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.MATERIAL ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.MATERIAL)}
        >
          <Puzzle size={24} />
          <span>素材</span>
        </button>
        <button
          className={`btn btn-ghost btn-lg text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.COMPONENT ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.COMPONENT)}
        >
          <Component size={24} />
          <span>组件</span>
        </button>
      </div>

      <div className="divider divider-horizontal m-0 w-0"></div>

      <div className="flex flex-col flex-grow h-full bg-base-200 px-3 py-4 overflow-y-auto">
        {currentTab === TABS.CANVAS && (
          <SidebarCanvases onSelect={handleSelectCanvas} />
        )}
        {currentTab === TABS.TEMPLATE && <div>template</div>}
        {currentTab === TABS.MATERIAL && <div>material</div>}
        {currentTab === TABS.COMPONENT && <div>component</div>}
      </div>
    </div>
  );
};

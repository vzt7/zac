import {
  Box,
  Component,
  Puzzle,
  SquareMousePointer,
  Star,
  TypeOutline,
} from 'lucide-react';
import { Suspense, useState } from 'react';

import { SidebarCanvases } from './SidebarCanvases';
import { SidebarFonts } from './SidebarFonts';
import { SidebarFunctions } from './SidebarFunctions';
import { SidebarIcons } from './SidebarIcons';
import { SidebarMaterials } from './SidebarMaterials';
import { SidebarTemplates } from './SidebarTemplates';

export const SIDEBAR_WIDTH = 421;

enum TABS {
  CANVAS = 'canvas',
  TEMPLATE = 'template',
  MATERIAL = 'material',
  ICON = 'icon',
  FONT = 'font',
  COMPONENT = 'component',
}

export const Sidebar = () => {
  const [currentTab, setCurrentTab] = useState<TABS>(TABS.CANVAS);

  return (
    <div
      className={`box-border flex-shrink-0 h-full flex flex-row bg-base border-r-2 border-base-300`}
      style={{
        width: SIDEBAR_WIDTH,
      }}
    >
      <div className="flex flex-col flex-shrink-0 h-full">
        <button
          className={`btn btn-ghost btn-md text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.CANVAS ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.CANVAS)}
        >
          <SquareMousePointer size={24} />
          <span>Canvas</span>
        </button>
        <button
          className={`btn btn-ghost btn-md text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.TEMPLATE ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.TEMPLATE)}
        >
          <Box size={24} />
          <span>Template</span>
        </button>
        <button
          className={`btn btn-ghost btn-md text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.MATERIAL ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.MATERIAL)}
        >
          <Puzzle size={24} />
          <span>Material</span>
        </button>
        <button
          className={`btn btn-ghost btn-md text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.ICON ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.ICON)}
        >
          <Star size={24} />
          <span>Icon</span>
        </button>
        <button
          className={`btn btn-ghost btn-md text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.FONT ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.FONT)}
        >
          <TypeOutline size={24} />
          <span>Font</span>
        </button>
        <button
          className={`btn btn-ghost btn-md text-sm rounded-none flex-col h-20 ${
            currentTab === TABS.COMPONENT ? 'btn-active' : ''
          }`}
          onClick={() => setCurrentTab(TABS.COMPONENT)}
        >
          <Component size={24} />
          <span>Function</span>
        </button>
      </div>

      <div className="divider divider-horizontal m-0 w-0"></div>

      <div className="flex flex-col flex-grow h-full bg-base-200 px-3 py-4 overflow-y-auto">
        {currentTab === TABS.CANVAS && <SidebarCanvases />}
        {currentTab === TABS.TEMPLATE && <SidebarTemplates />}
        {currentTab === TABS.MATERIAL && <SidebarMaterials />}
        {currentTab === TABS.ICON && <SidebarIcons />}
        {currentTab === TABS.FONT && <SidebarFonts />}
        {currentTab === TABS.COMPONENT && <SidebarFunctions />}
      </div>
    </div>
  );
};

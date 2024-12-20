import {
  Box,
  Component,
  Puzzle,
  Shapes,
  SquareMousePointer,
  TypeOutline,
} from 'lucide-react';
import { Suspense, lazy } from 'react';

import { SIDEBAR_TABS, useSidebarStore } from './sidebar.store';

const SidebarCanvases = lazy(() =>
  import('./SidebarCanvases').then((mod) => ({ default: mod.SidebarCanvases })),
);
const SidebarTemplates = lazy(() =>
  import('./SidebarTemplates').then((mod) => ({
    default: mod.SidebarTemplates,
  })),
);
const SidebarImages = lazy(() =>
  import('./SidebarImages').then((mod) => ({ default: mod.SidebarImages })),
);
const SidebarShapes = lazy(() =>
  import('./SidebarShapes').then((mod) => ({ default: mod.SidebarShapes })),
);
const SidebarIcons = lazy(() =>
  import('./SidebarIcons').then((mod) => ({ default: mod.SidebarIcons })),
);
const SidebarFonts = lazy(() =>
  import('./SidebarFonts').then((mod) => ({ default: mod.SidebarFonts })),
);
const SidebarFunctions = lazy(() =>
  import('./SidebarFunctions').then((mod) => ({
    default: mod.SidebarFunctions,
  })),
);

export const SIDEBAR_WIDTH = 461;

const TABS_LIST = [
  {
    id: SIDEBAR_TABS.CANVAS,
    icon: SquareMousePointer,
    label: 'Canvas',
  },
  // {
  //   id: SIDEBAR_TABS.TEMPLATE,
  //   icon: Blocks,
  //   label: 'Templates',
  // },
  {
    id: SIDEBAR_TABS.IMAGE,
    icon: Puzzle,
    label: 'Images',
  },
  {
    id: SIDEBAR_TABS.SHAPE,
    icon: Shapes,
    label: 'Shapes',
  },
  {
    id: SIDEBAR_TABS.ICON,
    icon: Box,
    label: 'Icons',
  },
  {
    id: SIDEBAR_TABS.FONT,
    icon: TypeOutline,
    label: 'Fonts',
  },
  {
    id: SIDEBAR_TABS.COMPONENT,
    icon: Component,
    label: 'Functions',
  },
];

export const Sidebar = () => {
  const currentTab = useSidebarStore((state) => state.currentTab);
  const setCurrentTab = useSidebarStore((state) => state.setCurrentTab);

  return (
    <div
      className={`relative box-border flex-shrink-0 h-full flex flex-row bg-base border-r-2 border-base-300`}
      style={{
        width: SIDEBAR_WIDTH,
      }}
    >
      <div className="flex flex-col flex-shrink-0 h-full">
        {TABS_LIST.map((tab) => (
          <button
            key={tab.id}
            className={`btn btn-ghost btn-md text-sm mx-0 px-3 rounded-none flex-col h-20 ${
              currentTab === tab.id ? 'btn-active' : ''
            }`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <tab.icon size={24} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="divider divider-horizontal m-0 w-0"></div>

      <div className="flex flex-col flex-grow h-full bg-base-200 p-4 overflow-y-auto overflow-visible">
        <Suspense fallback={<div>Loading...</div>}>
          {currentTab === SIDEBAR_TABS.CANVAS && <SidebarCanvases />}
          {/* {currentTab === SIDEBAR_TABS.TEMPLATE && <SidebarTemplates />} */}
          {currentTab === SIDEBAR_TABS.IMAGE && <SidebarImages />}
          {currentTab === SIDEBAR_TABS.SHAPE && <SidebarShapes />}
          {currentTab === SIDEBAR_TABS.ICON && <SidebarIcons />}
          {currentTab === SIDEBAR_TABS.FONT && <SidebarFonts />}
          {currentTab === SIDEBAR_TABS.COMPONENT && <SidebarFunctions />}
        </Suspense>
      </div>
    </div>
  );
};

import { Clapperboard, Image } from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';

import { canvases } from './SidebarCanvasDefaultData';
import { canvases as videoCanvases } from './SidebarCanvasVideoData';
import { useHeaderStore } from './header.store';

const SidebarCanvasDefault = lazy(() =>
  import('./SidebarCanvasDefault').then((module) => ({
    default: module.SidebarCanvasDefault,
  })),
);

export const SidebarCanvases = () => {
  const [activeTab, setActiveTab] = useState<'default' | 'more'>('default');
  const currentProject = useHeaderStore((state) => state.currentProject);
  const isImageProject = currentProject?.canvas?.type === 'canvas_image';
  const isAnimationProject =
    currentProject?.canvas?.type === 'canvas_animation';
  useEffect(() => {
    if (isAnimationProject) {
      setActiveTab('more');
    }
    if (isImageProject) {
      setActiveTab('default');
    }
  }, [isAnimationProject, isImageProject]);

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="tabs tabs-boxed tabs-lg border-2 border-gray-200 dark:border-gray-800">
        <button
          className={`tab ${activeTab === 'default' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('default')}
          disabled={isAnimationProject}
        >
          <Image size={22} className="mr-2" />
          <span>Image</span>
        </button>
        <button
          className={`relative tab ${activeTab === 'more' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('more')}
          disabled={isImageProject}
        >
          <Clapperboard size={22} className="mr-2" />
          <span>Animation</span>
        </button>
      </div>

      {activeTab === 'more' && (
        <div>
          <p>You selected which is created for Animation (GIF/MP4)</p>
        </div>
      )}

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <SidebarCanvasDefault
            canvases={activeTab === 'default' ? canvases : videoCanvases}
          />
        </Suspense>
      </div>
    </div>
  );
};

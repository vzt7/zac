import { Clapperboard, Image } from 'lucide-react';
import { Suspense, lazy, useState } from 'react';

import { canvases } from './SidebarCanvasDefaultData';
import { canvases as videoCanvases } from './SidebarCanvasVideoData';

const SidebarCanvasDefault = lazy(() =>
  import('./SidebarCanvasDefault').then((module) => ({
    default: module.SidebarCanvasDefault,
  })),
);

export const SidebarCanvases = () => {
  const [activeTab, setActiveTab] = useState<'default' | 'more'>('default');

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="tabs tabs-boxed tabs-lg border-2 border-base-300">
        <button
          className={`tab ${activeTab === 'default' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('default')}
        >
          <Image size={24} className="mr-2" />
          <span>Image</span>
        </button>
        <button
          className={`tab ${activeTab === 'more' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          <Clapperboard size={24} className="mr-2" />
          <span>Animation</span>
        </button>
      </div>

      {activeTab === 'more' && (
        <div>
          <p>You selected which is created for Animation or Video</p>
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

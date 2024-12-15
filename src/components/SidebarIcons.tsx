import { Suspense, lazy, useState } from 'react';

const SidebarIconsDefault = lazy(() => import('./SidebarIconsDefault'));
const SidebarIconsMore = lazy(() => import('./SidebarIconsMore'));

export const SidebarIcons = () => {
  const [activeTab, setActiveTab] = useState<'default' | 'more'>('default');

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="tabs tabs-boxed tabs-lg mx-4 border-2">
        <button
          className={`tab ${activeTab === 'default' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('default')}
        >
          Default
        </button>
        <button
          className={`tab ${activeTab === 'more' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          More
        </button>
      </div>

      <div className="px-4">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab === 'default' && <SidebarIconsDefault />}
          {activeTab === 'more' && <SidebarIconsMore />}
        </Suspense>
      </div>
    </div>
  );
};

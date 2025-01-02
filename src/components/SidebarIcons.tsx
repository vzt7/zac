import { Suspense, lazy, useState } from 'react';

const SidebarIconsDefault = lazy(() => import('./SidebarIconsDefault'));
const SidebarIconsMore = lazy(() => import('./SidebarIconsMore'));

export const SidebarIcons = () => {
  const [activeTab, setActiveTab] = useState<'default' | 'more'>('default');

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="tabs tabs-boxed tabs-lg border-2 border-gray-200 dark:border-gray-800">
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

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab === 'default' && <SidebarIconsDefault />}
          {activeTab === 'more' && <SidebarIconsMore />}
        </Suspense>
      </div>
    </div>
  );
};

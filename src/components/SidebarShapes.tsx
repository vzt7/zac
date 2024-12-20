import { Suspense, lazy, useState } from 'react';

const SidebarShapesDefault = lazy(() =>
  import('./SidebarShapesDefault').then((mod) => ({
    default: mod.SidebarShapesDefault,
  })),
);
// const SidebarShapesMore = lazy(() =>
//   import('./SidebarShapesMore').then((mod) => ({
//     default: mod.SidebarShapesMore,
//   })),
// );

export const SidebarShapes = () => {
  const [activeTab, setActiveTab] = useState<'default' | 'more'>('default');

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* <div className="tabs tabs-boxed tabs-lg border-2 border-base-300">
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
      </div> */}

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          {activeTab === 'default' && <SidebarShapesDefault />}
          {/* {activeTab === 'more' && <SidebarShapesMore />} */}
        </Suspense>
      </div>
    </div>
  );
};

import { Suspense, lazy, useState } from 'react';

import { handleAddImage } from './editor.handler';
import { Shape } from './editor.store';

const SidebarMaterialsIcons = lazy(() => import('./SidebarIconsMore'));

export const SidebarMaterials = () => {
  const [activeTab, setActiveTab] = useState<'images' | 'svg'>('images');

  const handleImageSelect = (item: Partial<Shape>) => {
    if (!item.src) return;
    handleAddImage(item.src);
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="tabs tabs-boxed tabs-lg mx-4 border-2">
        <button
          className={`tab ${activeTab === 'images' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Shape
        </button>
        <button
          className={`tab ${activeTab === 'svg' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('svg')}
        >
          Icon
        </button>
      </div>

      <div className="px-4">
        {activeTab === 'images' && (
          <div className="grid grid-cols-2 gap-2">
            {[{} as any].map((item, index) => (
              <MaterialItem key={index} onClick={() => handleImageSelect(item)}>
                <img src={item.src} className="w-full h-full object-cover" />
              </MaterialItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MaterialItem = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer hover:bg-base-300 bg-base-200 dark:border-gray-600 border-gray-300 hover:border-primary transition-colors"
  >
    <div className="w-16 h-16 flex items-center justify-center rounded-md overflow-hidden">
      {children}
    </div>
  </div>
);

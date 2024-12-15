import getRandomId from '@/utils/getRandomId';
import { startTransition, useState } from 'react';
import * as simpleIcons from 'simple-icons';

import { handleAddSvgByPath } from './editor.handler';

export const SidebarIconsDefault = () => {
  const handleParseSvgElement = async (svg: simpleIcons.SimpleIcon) => {
    handleAddSvgByPath(svg.svg, {
      name: `${svg.title.toLowerCase().replace(/\s+/g, '_')}-${getRandomId()}`,
    });
  };

  const [filteredIcons, setFilteredIcons] = useState(
    Object.values(simpleIcons),
  );

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search icons"
          className="input input-bordered w-full"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (!searchTerm) {
              setFilteredIcons(Object.values(simpleIcons));
              return;
            }
            const filteredIcons = Object.values(simpleIcons).filter((icon) =>
              icon.title.toLowerCase().includes(searchTerm),
            );
            startTransition(() => {
              setFilteredIcons(filteredIcons);
            });
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filteredIcons.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer hover:bg-base-300 bg-base-200 dark:border-gray-600 border-gray-300 hover:border-primary transition-colors"
            onClick={() => {
              handleParseSvgElement(item);
            }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center rounded-md overflow-hidden *:object-cover"
              dangerouslySetInnerHTML={{
                __html: item.svg,
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarIconsDefault;

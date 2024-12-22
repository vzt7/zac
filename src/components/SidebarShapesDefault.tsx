/** https://www.svgrepo.com/ */
import svgs from '@/assets/svgs.json';
import { getShapeRandomId } from '@/utils/getRandomId';
import { MinusIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { ReactSVG } from 'react-svg';

import { handleAddShape, handleAddSvgByTagStr } from './editor.handler';

const SHAPES = [
  {
    name: 'line',
    icon: <MinusIcon size={48} />,
    onClick: () => {
      handleAddShape('line', {
        strokeWidth: 5,
        stroke: '#000000',
      });
    },
  },
  // {
  //   name: 'arrow',
  //   icon: <ArrowUpIcon size={48} />,
  //   onClick: () => {
  //     handleAddShape('arrow', {
  //       strokeWidth: 5,
  //       stroke: '#000000',
  //     });
  //   },
  // },
  ...svgs.map((item) => ({
    name: item.name,
    icon: (
      <ReactSVG
        src={item.url}
        beforeInjection={(svg) => {
          svg.setAttribute(
            'style',
            'width: 48px; height: 48px; fill: currentColor',
          );
          svg.querySelectorAll('path').forEach((path) => {
            path.setAttribute('fill', 'currentColor');
          });
        }}
      />
    ),
    onClick: async () => {
      const svgString = await fetch(item.url).then((res) => res.text());
      const svgTagString = svgString;
      // svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1] || '';
      handleAddSvgByTagStr(svgTagString, {
        name: getShapeRandomId('shape'),
      });
    },
  })),
];

export const SidebarShapesDefault = () => {
  const [customSvgString, setCustomSvgString] = useState('');
  const [customSvgUrl, setCustomSvgUrl] = useState('');

  const [filteredShapes, setFilteredShapes] = useState(SHAPES);

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="gap-2">
        <h3 className="text-lg font-bold pb-1">Custom Shape</h3>
        <p className="text-sm text-gray-500 pb-2">
          You can add your own SVG to the canvas by pasting the SVG code here.
        </p>
        <textarea
          placeholder="<svg>...</svg>"
          className="textarea textarea-bordered w-full leading-tight break-all"
          value={customSvgString}
          onChange={(e) => {
            const svgString = e.target.value;
            const svgUrl = URL.createObjectURL(
              new Blob([svgString], { type: 'image/svg+xml' }),
            );
            if (customSvgUrl) {
              URL.revokeObjectURL(customSvgUrl);
            }
            setCustomSvgUrl(svgUrl);
            setCustomSvgString(svgString);
          }}
        />
        <div className="flex justify-center">
          <ReactSVG
            src={customSvgUrl}
            beforeInjection={(svg) => {
              svg.setAttribute(
                'style',
                'width: 128px; height: 128px; padding: 16px 0 16px 0',
              );
            }}
          />
        </div>
        <div className="flex flex-row gap-2">
          <input
            type="file"
            accept=".svg"
            className="hidden"
            id="upload-svg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                if (customSvgUrl) {
                  URL.revokeObjectURL(customSvgUrl);
                }
                setCustomSvgUrl(url);
                setCustomSvgString('');
              }
            }}
          />
          <label
            htmlFor="upload-svg"
            className="btn btn-outline border-base-300 mt-2 cursor-pointer"
          >
            <UploadIcon size={20} />
          </label>
          <button
            className="btn btn-primary flex-grow mt-2"
            onClick={async () => {
              const svgString = customSvgUrl
                ? await fetch(customSvgUrl)
                    .then((res) => res.text())
                    .then((text) => {
                      return (
                        text.match(/<svg(\s|.)*>(\s|.)*<\/svg>.*/)?.[0] || text
                      );
                    })
                : customSvgString;
              handleAddSvgByTagStr(svgString);
            }}
            disabled={!customSvgUrl}
          >
            <PlusIcon size={20} />
            <span>Add to Canvas</span>
          </button>
        </div>
      </div>

      <div className="divider m-0 p-0"></div>

      <h3 className="text-lg font-bold pb-3">Built-in Shapes</h3>
      <div className="flex items-center mb-2">
        <input
          type="text"
          placeholder="Search shapes"
          className="input input-bordered w-full"
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (!searchTerm) {
              setFilteredShapes(SHAPES);
              return;
            }
            const filteredShapes = SHAPES.filter((shape) =>
              shape.name.toLowerCase().includes(searchTerm),
            );
            setFilteredShapes(filteredShapes);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {filteredShapes.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            onClick={item.onClick}
            className="flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer hover:bg-base-300 bg-base-200 dark:border-gray-600 border-gray-300 hover:border-primary transition-colors"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-md overflow-hidden">
              {item.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

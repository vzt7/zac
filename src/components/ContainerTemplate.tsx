import { MonitorSmartphone, Smartphone, Tv } from 'lucide-react';
import React, { useState } from 'react';

import { EditorStore } from './editor.store';

const templates: (EditorStore['safeArea'] & {
  name: string;
  icon: React.ReactNode;
})[] = [
  {
    name: 'HD',
    width: 1280,
    height: 960,
    x: 0,
    y: 0,
    icon: <MonitorSmartphone size={24} />,
  },
  {
    name: 'Full HD',
    width: 1920,
    height: 1080,
    x: 0,
    y: 0,
    icon: <Tv size={24} />,
  },
  {
    name: '2K',
    width: 2560,
    height: 1440,
    x: 0,
    y: 0,
    icon: <Smartphone size={24} />,
  },
];

export const ContainerTemplate = ({
  onSelect,
}: {
  onSelect: (safeArea: EditorStore['safeArea']) => void;
}) => {
  const [selected, setSelected] = useState<(typeof templates)[number] | null>(
    null,
  );

  if (import.meta.env.DEV) {
    onSelect(templates[0]);
  }

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-3 gap-4 p-4">
        {templates.map((template) => (
          <button
            key={template.name}
            onClick={() => setSelected(template)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              selected?.width === template.width &&
              selected?.height === template.height
                ? 'border-primary bg-primary/10'
                : 'border-base-200 hover:border-primary/50'
            }`}
          >
            <div className="text-4xl mb-2">{template.icon}</div>
            <div className="text-sm font-medium">{template.name}</div>
            <div className="text-xs text-base-content/60 mt-1">
              {template.width} x {template.height}
            </div>
          </button>
        ))}
        {selected && (
          <div className="col-span-3 flex justify-center mt-4">
            <button
              onClick={() => onSelect(selected)}
              className="btn btn-primary w-full"
            >
              确认选择 {selected.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

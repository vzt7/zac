import React, { useState } from 'react';

import { handleAddText } from './editor.handler';

const DEFAULT_FONTS = [
  {
    name: '默认',
    value: 'font-sans',
    description: 'System UI 无衬线字体',
    preview: 'The quick brown fox jumps over the lazy dog',
  },
  {
    name: '衬线',
    value: 'font-serif',
    description: '优雅的衬线字体',
    preview: 'The quick brown fox jumps over the lazy dog',
  },
  {
    name: '等宽',
    value: 'font-mono',
    description: '代码风格等宽字体',
    preview: 'The quick brown fox jumps over the lazy dog',
  },
];

const EFFECT_FONTS = [
  {
    name: '复古',
    value: 'font-retro',
    description: '像素风格复古字体',
    preview: 'The quick brown fox jumps over the lazy dog',
  },
  {
    name: '手写',
    value: 'font-handwriting',
    description: '自然手写风格',
    preview: 'The quick brown fox jumps over the lazy dog',
  },
];

const FontCard = ({
  font,
  isExpanded,
  onClick,
  customText,
  onChangeCustomText,
}: {
  font: (typeof DEFAULT_FONTS)[0];
  isExpanded: boolean;
  onClick: () => void;
  customText?: string;
  onChangeCustomText: (val: string) => void;
}) => {
  const handleAddToCanvas = (fontValue: string) => {
    if (!customText) return;
    handleAddText({
      text: customText,
      fontFamily: fontValue,
    });
  };

  return (
    <div
      className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all ${
        isExpanded
          ? 'border-2 border-primary/80'
          : 'border-2 border-base-300 hover:border-primary/80'
      }`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{font.name}</h4>
          <span className="text-sm text-base-content/60">
            {font.description}
          </span>
        </div>
        <p className={`mt-2 ${font.value}`}>{font.preview}</p>

        {/* 展开的添加区域 */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-base-300">
            <div className="flex flex-col gap-2">
              <textarea
                placeholder="Enter text"
                className="textarea textarea-bordered"
                value={customText || ''}
                onChange={(e) => onChangeCustomText(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm h-10 mt-1"
                onClick={() => handleAddToCanvas(font.value)}
                disabled={!customText}
              >
                Add to Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SidebarFonts = () => {
  const [expandedFont, setExpandedFont] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4">
        {/* 默认字体部分 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">默认字体</h3>
          <div className="space-y-4">
            {DEFAULT_FONTS.map((font, index) => (
              <FontCard
                key={index}
                font={font}
                isExpanded={expandedFont === font.value}
                onClick={() => setExpandedFont(font.value)}
                customText={customText}
                onChangeCustomText={setCustomText}
              />
            ))}
          </div>
        </div>

        {/* 特效字体部分 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">特效字体</h3>
          <div className="space-y-4">
            {EFFECT_FONTS.map((font, index) => (
              <FontCard
                key={index}
                font={font}
                isExpanded={expandedFont === font.value}
                onClick={() => setExpandedFont(font.value)}
                customText={customText}
                onChangeCustomText={setCustomText}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

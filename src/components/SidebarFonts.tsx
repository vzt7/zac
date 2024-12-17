import { useState } from 'react';

import { FontCard, FontItem, FontUploader } from './SidebarFontsData';
import { useEditorStore } from './editor.store';
import { useSidebarStore } from './sidebar.store';

export const SidebarFonts = () => {
  const [expandedFont, setExpandedFont] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('Default Text');

  const fonts = useSidebarStore((state) => state.fonts);
  const customFonts = useSidebarStore((state) => state.customFonts);
  const upsertFont = useSidebarStore((state) => state.upsertFont);
  const handleLoadedFont = (font: FontItem, isPreview: boolean) => {
    upsertFont({
      ...font,
      ...(isPreview
        ? {
            isLoaded4Preview: true,
          }
        : {
            isLoaded: true,
          }),
    });
  };
  const upsertCustomFont = useSidebarStore((state) => state.upsertCustomFont);
  const handleLoadedCustomFont = (font: FontItem, isPreview: boolean) => {
    upsertCustomFont({
      ...font,
      ...(isPreview
        ? {
            isLoaded4Preview: true,
          }
        : {
            isLoaded: true,
          }),
    });
  };
  const removeCustomFont = useSidebarStore((state) => state.removeCustomFont);
  const handleRemoveFont = (
    fontItem: FontItem,
    options?: { isCustomFont?: boolean },
  ) => {
    const confirmText = options?.isCustomFont
      ? 'Remove this custom font?'
      : 'Remove this font from canvas?';
    if (window.confirm(confirmText)) {
      const removeUsingFont = useEditorStore.getState().removeUsingFont;
      removeUsingFont(fontItem.value);
      if (options?.isCustomFont) {
        removeCustomFont(fontItem);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="pb-2">
        {/* 默认字体部分 */}
        <div className="mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">My Fonts</h3>
            <div className="space-y-4 mb-4">
              {customFonts.map((font, index) => (
                <FontCard
                  key={index}
                  font={font}
                  onLoadedFont={handleLoadedCustomFont}
                  isExpanded={expandedFont === font.value}
                  onClick={() => setExpandedFont(font.value)}
                  customText={customText}
                  onChangeCustomText={setCustomText}
                  isCustomFont
                  onRemoveFont={handleRemoveFont}
                />
              ))}

              <FontUploader />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Fonts</h3>
            <div className="space-y-4">
              {fonts.map((font, index) => (
                <FontCard
                  key={index}
                  font={font}
                  onLoadedFont={handleLoadedFont}
                  isExpanded={expandedFont === font.value}
                  onClick={() => setExpandedFont(font.value)}
                  customText={customText}
                  onChangeCustomText={setCustomText}
                  onRemoveFont={handleRemoveFont}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

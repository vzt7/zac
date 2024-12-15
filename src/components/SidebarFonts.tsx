import { debug } from '@/utils/debug';
import { useMutation } from '@tanstack/react-query';
import { CloudDownload, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FontItem } from './SidebarFontsData';
import { handleAddText } from './editor.handler';
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
  const handleRemoveCustomFont = (font: FontItem) => {
    removeCustomFont(font);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-2">
        {/* 默认字体部分 */}
        <div className="mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">My Fonts</h3>
            <div className="space-y-4 mb-4">
              <FontUploader />

              <div className="divider px-3"></div>

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
                  onRemoveCustomFont={handleRemoveCustomFont}
                />
              ))}
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
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const loadFont = async (
  fontItem: FontItem,
  onLoaded?: (result: FontFace) => void,
) => {
  await new Promise((r) => setTimeout(r, 3000));
  const fontUrls = fontItem.isUsed ? fontItem.urls : [fontItem.preview];
  const fontPromises = fontUrls.map((fontUrl) =>
    new FontFace(fontItem.value, `url(${fontUrl})`).load(),
  );
  const loadedFonts = await Promise.all(fontPromises);
  loadedFonts.forEach((font) => {
    document.fonts.add(font);
    onLoaded?.(font);
    debug('[SidebarFonts_handleAddFont]', 'loadedFonts', loadedFonts);
  });
};

const FontCard = ({
  font: currentFontData,
  onLoadedFont,
  isExpanded,
  isCustomFont,
  onClick,
  customText,
  onChangeCustomText,
  onRemoveCustomFont,
}: {
  font: FontItem;
  onLoadedFont: (font: FontItem, isPreview: boolean) => void;
  isExpanded: boolean;
  isCustomFont?: boolean;
  onClick: () => void;
  customText?: string;
  onChangeCustomText: (val: string) => void;
  onRemoveCustomFont?: (font: FontItem) => void;
}) => {
  const { mutateAsync: handlePreviewFont, isPending: isPreviewLoading } =
    useMutation({
      mutationFn: async (fontItem: FontItem) => {
        await loadFont(fontItem, (fontFace) => {
          onLoadedFont(
            {
              ...fontItem,
              fontFace,
            },
            true,
          );
        });
      },
    });
  const { mutateAsync: handleAddFont, isPending: isFontLoading } = useMutation({
    mutationFn: async (fontItem: FontItem) => {
      await loadFont(fontItem, (fontFace) => {
        onLoadedFont(
          {
            ...fontItem,
            fontFace,
          },
          false,
        );
      });
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLocalFontLoading, setIsLocalFontLoading] = useState(false);
  const handleAddLocalFont = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLocalFontLoading(true);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const urls = files.map((file) => URL.createObjectURL(file));

    const nextFontData = {
      ...currentFontData,
      urls,
      preview: urls[0],
    };

    await loadFont(nextFontData, (fontFace) => {
      onLoadedFont(
        {
          ...nextFontData,
          fontFace,
        },
        false,
      );
      setIsLocalFontLoading(false);
      urls.map((url) => URL.revokeObjectURL(url));
    });
  };
  useEffect(() => {
    if (isCustomFont) {
      // 本地字体需要重新上传
      return;
    }

    if (currentFontData.isLoaded) {
      return;
    }
    if (currentFontData?.isUsed) {
      handleAddFont(currentFontData);
      return;
    }
    if (!currentFontData?.isLoaded4Preview) {
      handlePreviewFont(currentFontData);
      return;
    }
  }, []);

  const handleAddToCanvas = (fontValue: string) => {
    if (!customText) return;
    handleAddText({
      text: customText,
      fontFamily: fontValue,
      fontWeight: currentFontData.fontFace?.weight || 'normal',
      fontStyle: currentFontData.fontFace?.style || 'normal',
    });
  };

  return (
    <div
      className={`card bg-base-200 hover:bg-base-300 cursor-pointer transition-all ${
        isExpanded
          ? 'border-2 border-primary/80'
          : 'border-2 border-base-300 hover:border-primary/80'
      } ${isCustomFont && !currentFontData.isLoaded ? '!border-warning !bg-warning/20' : ''}`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h4>
            <span className="font-medium text-black/50">
              {currentFontData.name}
            </span>
            {currentFontData?.isUsed ? (
              <div className="badge badge-primary text-xs ml-2">Using</div>
            ) : null}
          </h4>
          {currentFontData.description && (
            <span className="text-sm text-base-content/60">
              {currentFontData.description}
            </span>
          )}
        </div>
        {isPreviewLoading ? (
          <div className="skeleton h-10"></div>
        ) : (
          <p
            className={`mt-2 px-3 py-1 text-2xl ${isCustomFont ? 'text-base-content/60' : ''}`}
            style={{
              fontFamily: currentFontData.value,
              fontWeight: currentFontData.fontFace?.weight || 'normal',
              fontStyle: currentFontData.fontFace?.style || 'normal',
            }}
          >
            {isCustomFont && !currentFontData.isLoaded
              ? 'Unready to use'
              : 'Poster Master'}
          </p>
        )}

        {/* 展开的添加区域 */}
        {isExpanded && (
          <div className="pt-4 border-t border-base-300">
            {currentFontData?.isLoaded ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="textarea textarea-bordered"
                  style={{
                    fontFamily: currentFontData.value,
                    fontWeight: currentFontData.fontFace?.weight || 'normal',
                    fontStyle: currentFontData.fontFace?.style || 'normal',
                  }}
                  value={customText}
                  onChange={(e) => onChangeCustomText(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm h-10 mt-1"
                  onClick={() => handleAddToCanvas(currentFontData.value)}
                  disabled={!customText}
                >
                  Add to Canvas
                </button>
              </div>
            ) : (
              <>
                {isCustomFont ? (
                  <button
                    className="btn btn-primary btn-sm h-10 w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLocalFontLoading}
                  >
                    {isLocalFontLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>Local Font</span>
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm h-10 w-full"
                    onClick={() => handleAddFont(currentFontData)}
                    disabled={isFontLoading}
                  >
                    {isFontLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <CloudDownload size={16} />
                    )}
                    <span>Load Font</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {isCustomFont && (
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".ttf,.otf,.woff,.woff2"
            multiple
            onChange={handleAddLocalFont}
          />
        )}
      </div>
    </div>
  );
};

const FontUploader = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fontName, setFontName] = useState<string>(''); // 仅需一个整体的字体名字
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upsertCustomFont = useSidebarStore((state) => state.upsertCustomFont);

  const handleFontUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);

    const defaultNameMatched = files[0].name?.match(/(.+)\..*/);
    setFontName(
      defaultNameMatched?.[1] || defaultNameMatched?.[0] || files[0].name,
    );
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    // 确保字体名字已填写
    if (!fontName) {
      return;
    }

    setIsLoading(true);

    // 逐个加载字体
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fontInfo = {
        name: fontName,
        value: fontName.replace(/\s+/g, '-').toLowerCase(),
        urls: [URL.createObjectURL(file)],
        preview: URL.createObjectURL(file),
        isUsed: false,
        isLoaded: false,
        isLoaded4Preview: false,
      } as FontItem;

      try {
        await loadFont(fontInfo, (fontFace) => {
          upsertCustomFont({
            ...fontInfo,
            fontFace,
            isLoaded: true,
            isLoaded4Preview: true,
          });
        });
      } catch (error) {
        console.error(`Load font failed: ${fontInfo.name}`, error);
      }
    }

    resetInput();

    setIsLoading(false);
  };

  const resetInput = () => {
    // 重置状态
    setSelectedFiles([]);
    setFontName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {selectedFiles.length <= 0 && (
          <button
            className="btn btn-outline w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            Local fonts
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".ttf,.otf,.woff,.woff2"
        multiple
        onChange={handleFontUpload}
      />

      <ul className="space-y-2 list-disc">
        {selectedFiles.map((file, index) => (
          <li key={index} className="text-sm text-base-content/60 break-all">
            {file.name}
          </li>
        ))}
      </ul>

      {/* 显示选中的文件信息和编辑表单 */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4 mt-4 border-2 border-primary/80 p-3 rounded-xl">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Font Name</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
              disabled={isLoading}
            />
          </label>

          <div className="space-y-2">
            <button
              className="btn btn-primary w-full"
              onClick={handleSubmit}
              disabled={!fontName || isLoading}
            >
              {isLoading && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              <span>Confirm</span>
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={() => resetInput()}
              disabled={isLoading}
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

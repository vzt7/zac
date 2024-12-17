import { debug } from '@/utils/debug';
import { useMutation } from '@tanstack/react-query';
import { CloudDownload, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { handleAddText } from './editor.handler';
import { useSidebarStore } from './sidebar.store';

export interface FontItem {
  name: string;
  value: string;
  description?: string;
  preview: string;
  urls: string[];
  isUsed?: boolean;
  isLoaded?: boolean;
  isLoaded4Preview?: boolean;
  fontFace?: FontFace;
}

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

export const FontCard = ({
  font: currentFontData,
  onLoadedFont,
  isExpanded,
  isCustomFont,
  onClick,
  customText,
  onChangeCustomText,
  onRemoveFont,
}: {
  font: FontItem;
  onLoadedFont: (font: FontItem, isPreview: boolean) => void;
  isExpanded: boolean;
  isCustomFont?: boolean;
  onClick: () => void;
  customText?: string;
  onChangeCustomText: (val: string) => void;
  onRemoveFont: (font: FontItem, options?: { isCustomFont?: boolean }) => void;
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

  const handleRemoveFont = (fontItem: FontItem) => {
    onRemoveFont(fontItem, { isCustomFont });
  };

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
      }`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h4>
            <span className="font-medium text-base-content/40">
              {currentFontData.name}
            </span>
            {currentFontData?.isUsed && (
              <div className="badge badge-primary text-xs font-bold ml-2">
                Using
              </div>
            )}
            {isCustomFont && !currentFontData.isLoaded && (
              <div className="badge badge-warning text-xs font-bold ml-2">
                Unready
              </div>
            )}
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
            className={`mt-2 px-3 py-1 text-2xl ${isCustomFont ? 'text-base-content font-bold' : ''}`}
            style={{
              fontFamily: currentFontData.value,
              fontWeight: currentFontData.fontFace?.weight || 'normal',
              fontStyle: currentFontData.fontFace?.style || 'normal',
            }}
          >
            {isCustomFont && !currentFontData.isLoaded
              ? 'Not loaded'
              : `Hello ${import.meta.env.VITE_APP_NAME}`}
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
                <div className="flex flex-row gap-2 mt-1">
                  <button
                    className="btn btn-error btn-sm h-10"
                    onClick={() => handleRemoveFont(currentFontData)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    className="btn btn-primary btn-sm h-10 flex-grow"
                    onClick={() => handleAddToCanvas(currentFontData.value)}
                    disabled={!customText}
                  >
                    Add to Canvas
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isCustomFont ? (
                  // Unload custom font
                  <div className="flex flex-row gap-2">
                    <button
                      className="btn btn-error btn-sm h-10"
                      onClick={() => handleRemoveFont(currentFontData)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="btn btn-primary btn-sm h-10 flex-grow"
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
                  </div>
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

export const FontUploader = () => {
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
      <div>
        {selectedFiles.length <= 0 && (
          <button
            className="btn btn-outline w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>Add local font</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".ttf,.otf,.woff,.woff2"
          multiple
          onChange={handleFontUpload}
        />
      </div>

      {/* 显示选中的文件信息和编辑表单 */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4 mt-4 border-2 border-primary/80 p-3 rounded-xl">
          <h4 className="text-lg font-semibold pt-1">Selected Fonts</h4>
          <ul className="space-y-2 list-disc">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="text-sm text-base-content/60 break-all"
              >
                {file.name}
              </li>
            ))}
          </ul>

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

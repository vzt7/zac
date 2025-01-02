import { parseSvgString, parseSvgString2ImageSrc } from '@/utils/svg';
import { useEffect, useRef, useState } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape, useEditorStore } from '../editor.store';

export const ElementEditorItem4ImageEdit = () => {
  const selectedShape = useEditorStore((state) => state.selectedShapes[0]);
  const isSvgImage = selectedShape.isSvgImage;

  return (
    <>
      {isSvgImage ? (
        <SvgEditor selectedShape={selectedShape} />
      ) : // <ImageEditor selectedShape={selectedShape} />
      null}
    </>
  );
};

interface SvgColor {
  selector: string;
  color: string;
  type: 'fill' | 'stroke';
}

const SvgEditor = ({ selectedShape }: { selectedShape: Shape }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [svgColors, setSvgColors] = useState<SvgColor[]>([]);
  const [svgContent, setSvgContent] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const isImageEditing = useEditorStore((state) => state.isImageEditing);

  // 解析SVG并提取颜色
  const parseSvgColors = async (svgUrl: string) => {
    try {
      const response = await fetch(svgUrl);
      const text = await response.text();
      setSvgContent(text);

      const doc = parseSvgString(text);
      const colors: SvgColor[] = [];

      // 查找所有包含 fill 或 stroke 属性的元素
      const _fillElements = doc.querySelectorAll('[fill], [stroke]');
      const elements =
        _fillElements.length > 0 ? _fillElements : doc.querySelectorAll('svg');

      elements.forEach((el) => {
        // 处理 fill 属性
        if (el.tagName === 'svg' && !el.hasAttribute('fill')) {
          // 如果svg没有fill属性，则设置为currentColor
          el.setAttribute('fill', 'currentColor');
          const serializer = new XMLSerializer();
          const content = serializer.serializeToString(doc);
          setSvgContent(content);
        }

        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none') {
          colors.push({
            selector: `[fill="${fill}"]`,
            color: fill,
            type: 'fill',
          });
        }

        // 处理 stroke 属性
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none') {
          colors.push({
            selector: `[stroke="${stroke}"]`,
            color: stroke,
            type: 'stroke',
          });
        }
      });

      setSvgColors([
        ...new Map(
          colors.map((item) => [item.selector + item.type, item]),
        ).values(),
      ]);
    } catch (error) {
      console.error('解析SVG出错:', error);
    }
  };

  // 预览SVG颜色
  const previewSvgColor = async (
    selector: string,
    newColor: string,
    type: 'fill' | 'stroke',
  ) => {
    setSvgColors((prevColors) =>
      prevColors.map((item) =>
        item.selector === selector && item.type === type
          ? { ...item, color: newColor }
          : item,
      ),
    );

    try {
      const doc = parseSvgString(svgContent);

      // 应用所有当前的颜色设置
      svgColors.forEach((colorItem) => {
        const elements = doc.querySelectorAll(colorItem.selector);
        elements.forEach((el) => {
          // 如果是当前正在修改的颜色，使用新值
          if (colorItem.selector === selector && colorItem.type === type) {
            el.setAttribute(type, newColor);
          } else {
            // 否则保持现有的颜色值
            el.setAttribute(colorItem.type, colorItem.color);
          }
        });
      });

      // Clean up old preview URL
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      const serializer = new XMLSerializer();
      const content = serializer.serializeToString(doc);
      const svgBlob = new Blob([content], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error previewing SVG color:', error);
    }
  };

  // 确认更新
  const confirmUpdate = async () => {
    if (previewUrl) {
      const svgString = await (await fetch(previewUrl)).text();
      const imageSrc = parseSvgString2ImageSrc(svgString);
      handleUpdate({
        id: selectedShape.id,
        src: imageSrc,
      });
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      useEditorStore.setState({
        isImageEditing: false,
      });
      dialogRef.current?.close();
    }
  };

  // 取消更新
  const cancelUpdate = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    useEditorStore.setState({
      isImageEditing: false,
    });
    dialogRef.current?.close();
  };

  useEffect(() => {
    if (isImageEditing && selectedShape?.isSvgImage && selectedShape.src) {
      dialogRef.current?.showModal();
      parseSvgColors(selectedShape.src);
      setPreviewUrl(selectedShape.src);
    }
  }, [isImageEditing, selectedShape]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-5xl">
        <h3 className="font-bold text-lg mb-4">Edit SVG Colors</h3>

        <div className="flex gap-6">
          {/* 预览区域 */}
          <div className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-lg p-8 bg-base-200">
            <div className="w-full h-[400px] flex items-center justify-center">
              <img
                src={previewUrl}
                alt="SVG Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 颜色编辑区域 */}
          <div className="w-1/2 space-y-2">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title font-medium">
                Editable Colors ({svgColors.length})
              </div>
              <div className="collapse-content">
                <div className="space-y-4 pt-2">
                  {svgColors.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) =>
                          previewSvgColor(
                            item.selector,
                            e.target.value,
                            item.type,
                          )
                        }
                        className="input input-bordered h-10 w-24"
                      />
                      <span
                        className="text-sm truncate"
                        title={`${item.type}: ${item.selector}`}
                      >
                        {item.color.toUpperCase()}
                      </span>
                    </div>
                  ))}

                  {svgColors.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No editable color attributes found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn w-28" onClick={cancelUpdate}>
            Cancel
          </button>
          <button className="btn w-28 btn-primary" onClick={confirmUpdate}>
            Confirm
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={cancelUpdate}>Close</button>
      </form>
    </dialog>
  );
};

interface AIModel {
  id: string;
  name: string;
  description: string;
  price: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    description: '最新的高质量图像生成模型，适合创建详细和真实的图像',
    price: '0.008 积分/张',
  },
  {
    id: 'sd15',
    name: 'Stable Diffusion 1.5',
    description: '经典的图像生成模型，性能稳定，适合一般用途',
    price: '0.004 积分/张',
  },
  // ... 可以添加更多模型
];

const ImageEditor = ({ selectedShape }: { selectedShape: Shape }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedModel, setSelectedModel] = useState<string>('sdxl');
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewImages, setPreviewImages] = useState<string[]>([
    selectedShape.src!,
  ]);
  const [selectedImage, setSelectedImage] = useState<string>(
    selectedShape.src!,
  );
  const isImageEditing = useEditorStore((state) => state.isImageEditing);
  const [imageSource, setImageSource] = useState<'preview' | 'upload'>(
    'preview',
  );
  const [selectedSourceImage, setSelectedSourceImage] = useState<string>('');

  // 处理 AI 生成图片
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      // TODO: 实现 AI 生成图片的 API 调用
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟 API 调用
      const newImage = 'https://placeholder.com/400x400'; // 模拟新生成的图片
      setPreviewImages((prev) => [...prev, newImage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isImageEditing) {
      dialogRef.current?.showModal();
    }
  }, [isImageEditing]);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-7xl">
        <h3 className="font-bold text-lg mb-4">图片编辑器</h3>

        <div className="flex gap-6">
          {/* 预览区域 - 优化布局 */}
          <div className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-base-200">
            <div
              className={`
              ${previewImages.length === 1 ? 'block' : 'grid'} 
              ${previewImages.length === 2 ? 'grid-cols-2' : ''} 
              ${previewImages.length > 2 ? 'grid-cols-2 md:grid-cols-3' : ''} 
              gap-4
            `}
            >
              {previewImages.map((img, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer border-2 rounded-lg overflow-hidden
                    ${selectedImage === img ? 'border-primary' : 'border-transparent'}
                    ${previewImages.length === 1 ? 'h-full' : 'h-48'}
                  `}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`预览图 ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 功能区 - 优化图生图功能 */}
          <div className="w-1/2 space-y-2">
            {/* AI 生成功能 */}
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title font-medium">AI 图片生成</div>
              <div className="collapse-content">
                <div className="space-y-4">
                  <select
                    className="select select-bordered w-full"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    {AI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.price})
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500">
                    {AI_MODELS.find((m) => m.id === selectedModel)?.description}
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="输入图片生成提示词..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                  <button
                    className={`btn btn-primary w-full ${isGenerating ? 'loading' : ''}`}
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    生成图片
                  </button>
                </div>
              </div>
            </div>

            {/* 图生图功能 */}
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title font-medium">图片优化</div>
              <div className="collapse-content">
                <div className="space-y-4">
                  {/* 图片来源选择 */}
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="imageSource"
                        className="radio radio-primary"
                        checked={imageSource === 'preview'}
                        onChange={() => setImageSource('preview')}
                      />
                      <span>从预览图选择</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="imageSource"
                        className="radio radio-primary"
                        checked={imageSource === 'upload'}
                        onChange={() => setImageSource('upload')}
                      />
                      <span>上传新图片</span>
                    </label>
                  </div>

                  {/* 根据选择显示不同的输入方式 */}
                  {imageSource === 'preview' ? (
                    <div className="grid grid-cols-3 gap-2">
                      {previewImages.map((img, index) => (
                        <div
                          key={index}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden h-24
                            ${selectedSourceImage === img ? 'border-primary' : 'border-base-300'}`}
                          onClick={() => setSelectedSourceImage(img)}
                        >
                          <img
                            src={img}
                            alt={`源图片 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        className="file-input file-input-bordered w-full"
                        onChange={handleImageUpload}
                      />
                    </div>
                  )}

                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="输入优化提示词（可选）..."
                    rows={2}
                  />
                  <button
                    className="btn btn-primary w-full"
                    disabled={imageSource === 'preview' && !selectedSourceImage}
                  >
                    优化图片
                  </button>
                </div>
              </div>
            </div>

            {/* 预留功能区 */}
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title font-medium">更多功能</div>
              <div className="collapse-content">
                <div className="text-center py-4 text-gray-500">
                  即将推出更多功能...
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn w-28"
            onClick={() => {
              useEditorStore.setState({ isImageEditing: false });
              dialogRef.current?.close();
            }}
          >
            取消
          </button>
          <button
            className="btn btn-primary w-28"
            onClick={() => {
              if (selectedImage) {
                handleUpdate({
                  id: selectedShape.id,
                  src: selectedImage,
                });
                useEditorStore.setState({ isImageEditing: false });
                dialogRef.current?.close();
              }
            }}
          >
            确认
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button
          onClick={() => {
            useEditorStore.setState({ isImageEditing: false });
          }}
        >
          关闭
        </button>
      </form>
    </dialog>
  );
};

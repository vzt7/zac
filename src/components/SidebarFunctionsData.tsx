import QRCodeStyling from 'qr-code-styling';
import React, { useEffect, useRef, useState } from 'react';
import BarCode from 'react-barcode';

import { handleAddImage } from './editor.handler';

interface FunctionItem {
  id: string;
  title: string;
  description?: string;
  content?: React.ReactNode;
  modalContent?: React.ReactNode;
  isPinned?: boolean;
}

const functions: FunctionItem[] = [
  {
    id: 'qr_code',
    title: 'QR Code',
    description: 'Create QR Code from text or URL',
    content: <QrCodeFunction />,
  },
  {
    id: 'bar_code',
    title: 'Bar Code',
    description: 'Create Bar Code from text or URL',
    content: <BarCodeFunction />,
  },
  // ... 更多功能项
];

export const useFunctions = () => {
  return functions;
};

function QrCodeFunction() {
  const [text, setText] = useState('');
  const [width, setWidth] = useState(300);
  const [dotType, setDotType] = useState<
    | 'rounded'
    | 'dots'
    | 'square'
    | 'classy'
    | 'classy-rounded'
    | 'extra-rounded'
  >('square');
  const [dotColor, setDotColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState(0.4);
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [margin, setMargin] = useState(0);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [cornerType, setCornerType] = useState<
    'square' | 'dot' | 'extra-rounded'
  >('square');
  const [cornerColor, setCornerColor] = useState('#000000');

  const [url, setUrl] = useState<string>();
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!text || !qrRef.current) return;

    const qrCode = new QRCodeStyling({
      shape,
      width,
      height: width,
      data: text,
      margin,
      dotsOptions: {
        type: dotType,
        color: dotColor,
        gradient: undefined,
      },
      cornersSquareOptions: {
        type: cornerType,
        color: cornerColor,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        imageSize,
        margin: 0,
      },
      ...(imageUrl ? { image: imageUrl } : {}),
    });

    qrRef.current.innerHTML = '';
    qrCode.append(qrRef.current);

    // 转换为图片URL
    qrCode.getRawData('png').then((blob) => {
      const url = URL.createObjectURL(blob as any);
      setUrl(url);
      return () => URL.revokeObjectURL(url);
    });
  }, [
    text,
    width,
    dotType,
    dotColor,
    backgroundColor,
    imageUrl,
    imageSize,
    margin,
    cornerType,
    cornerColor,
    shape,
  ]);

  const handleAdd = () => {
    if (!url) return;
    handleAddImage(url);
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <textarea
        className="textarea textarea-bordered"
        placeholder="Enter text or URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="collapse collapse-arrow bg-base-200">
        <input
          type="checkbox"
          checked={isAdvancedOpen}
          onChange={(e) => setIsAdvancedOpen(e.target.checked)}
        />
        <div className="collapse-title font-medium">Advanced Settings</div>
        <div className="collapse-content">
          <div className="grid grid-cols-1 gap-2 pt-2">
            <div className="grid grid-cols-1 gap-2">
              <label className="input input-bordered flex items-center gap-2">
                <span>Width</span>
                <input
                  type="number"
                  className="grow"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min={100}
                  max={2048}
                />
                <span>px</span>
              </label>
            </div>

            <select
              className="select select-bordered w-full"
              value={shape}
              onChange={(e) => setShape(e.target.value as typeof shape)}
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
            </select>

            <select
              className="select select-bordered w-full"
              value={dotType}
              onChange={(e) => setDotType(e.target.value as typeof dotType)}
            >
              <option value="square">Square Dots</option>
              <option value="rounded">Rounded Dots</option>
              <option value="dots">Circular Dots</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>

            <label className="input input-bordered flex items-center gap-2">
              <span className="flex-shrink-0">Dot Color</span>
              <input
                type="color"
                className="flex-grow"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
              />
            </label>

            <select
              className="select select-bordered w-full"
              value={cornerType}
              onChange={(e) =>
                setCornerType(e.target.value as typeof cornerType)
              }
            >
              <option value="square">Square Corners</option>
              <option value="dot">Dot Corners</option>
              <option value="extra-rounded">Extra Rounded Corners</option>
            </select>

            <label className="input input-bordered flex items-center gap-2">
              <span className="flex-shrink-0">Corner Color</span>
              <input
                type="color"
                className="flex-grow"
                value={cornerColor}
                onChange={(e) => setCornerColor(e.target.value)}
              />
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <span>Margin</span>
              <input
                type="number"
                className="grow"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                min={0}
                max={100}
              />
              <span>px</span>
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <span>Background</span>
              <input
                type="color"
                className="flex-grow"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <span>Logo</span>
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                  }
                  setImageUrl(URL.createObjectURL(file));
                }}
              />
              <div className="btn btn-ghost btn-sm flex-grow">Add Image</div>
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <span className="flex-shrink-0">Logo Size</span>
              <input
                type="range"
                className="range range-xs grow"
                value={imageSize}
                onChange={(e) => setImageSize(Number(e.target.value))}
                min={0.1}
                max={0.9}
                step={0.1}
              />
            </label>
          </div>
        </div>
      </div>

      <div ref={qrRef} className="hidden" />

      {url && (
        <div className="w-[200px] h-[200px] bg-transparent mx-auto p-2">
          <img src={url} className="object-contain" alt="QR Code" />
        </div>
      )}

      <button className="btn btn-primary" onClick={handleAdd} disabled={!url}>
        Add to Canvas
      </button>
    </div>
  );
}

function BarCodeFunction() {
  const [text, setText] = useState('');

  const [enableDisplayValue, setEnableDisplayValue] = useState(true);

  const barCodeWrapperRef = useRef<HTMLDivElement>(null);
  const scale = useRef(1);
  useEffect(() => {
    const width = barCodeWrapperRef.current?.children[0]?.clientWidth;
    if (!width) return;
    scale.current = Math.min(200 / width, 1);
  }, [text]);

  const barCodeRef = useRef<any>(null);
  const handleAdd = () => {
    if (!barCodeRef.current) return;
    try {
      const img = barCodeRef.current.renderElementRef.current.src;
      handleAddImage(img);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <textarea
        className="textarea textarea-bordered"
        placeholder="Enter text or URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {text && (
        <div
          ref={barCodeWrapperRef}
          className={`w-[200px] bg-transparent mx-auto p-2 *:object-contain *:object-center`}
        >
          <BarCode
            ref={barCodeRef}
            value={text}
            displayValue={enableDisplayValue}
            renderer="img"
            background="transparent"
          />
        </div>
      )}

      <label className="flex items-center ml-1">
        <input
          type="checkbox"
          className="checkbox mr-2"
          checked={enableDisplayValue}
          onChange={(e) => setEnableDisplayValue(e.target.checked)}
        />
        <span>Display Text</span>
      </label>

      <button className="btn btn-primary" onClick={handleAdd} disabled={!text}>
        Add to Canvas
      </button>
    </div>
  );
}

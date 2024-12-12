import { Star, StarOff } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

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
    id: '2',
    title: '功能2',
    content: <div>自定义内容区域</div>,
    modalContent: <div>自定义内容区域</div>,
  },
  // ... 更多功能项
];

export const useFunctions = () => {
  return functions;
};

function QrCodeFunction() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [width, setWidth] = useState(300);

  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!text) return;

    QRCode.toDataURL(
      text,
      {
        type: 'image/png',
        errorCorrectionLevel: level,
        width,
      },
      (err, url) => {
        if (err) {
          console.error(`[QrCode]`, err);
          return;
        }
        setUrl(url);
      },
    );
  }, [text, level, width]);

  const handleAdd = () => {
    if (!url) {
      return;
    }
    handleAddImage(url);
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <textarea
        className="textarea textarea-bordered"
        placeholder="请输入文本或URL"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select
        className="select select-bordered w-full"
        value={level}
        onChange={(e) => setLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
      >
        <option disabled>Error correction level</option>
        <option value="L">Low(7%)</option>
        <option value="M">Medium(15%)</option>
        <option value="Q">Quartile(25%)</option>
        <option value="H">High(30%)</option>
        {/* <option value="L">低级纠错(7%)</option>
        <option value="M">中级纠错(15%)</option>
        <option value="Q">高级纠错(25%)</option>
        <option value="H">最高级纠错(30%)</option> */}
      </select>

      <label className="input input-bordered flex items-center gap-2">
        <input
          type="number"
          className="input input-ghost border-none ml-0 px-0 w-full"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          min={1}
          max={2048}
          step={10}
        />
        <span>px</span>
      </label>

      {url && (
        <div className={`w-[200px] h-[200px] bg-base-300 mx-auto`}>
          <img src={url} className="object-contain" />
        </div>
      )}

      <button className="btn btn-primary" onClick={handleAdd} disabled={!url}>
        Add to Canvas
      </button>
    </div>
  );
}

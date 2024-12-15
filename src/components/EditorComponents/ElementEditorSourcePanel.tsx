import {
  Circle,
  Hand,
  Hexagon,
  Image,
  Square,
  Star,
  Triangle,
  Type,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  handleAddShape,
  handleAddText,
  handleImageUpload,
} from '../editor.handler';
import { useEditorStore } from '../editor.store';

// 扩展工具栏
export const SourcePanel = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawingType, setDrawingType] = useState<'free' | null>(null);
  useEffect(() => {
    useEditorStore.setState({
      isDrawMode: Boolean(drawingType),
      drawingType,
    });
  }, [drawingType]);

  const handleShapeClick = (shape: string) => {
    handleAddShape(shape);
    // 点击后关闭下拉菜单
    if (dropdownRef.current) {
      const ul = dropdownRef.current.querySelector('ul');
      if (ul) ul.blur();
    }
  };

  const isDragMode = useEditorStore((state) => state.isDragMode);

  return (
    <div className="">
      <button
        className={`btn btn-ghost ${isDragMode ? 'btn-active' : ''}`}
        onClick={() => {
          useEditorStore.setState({
            isDragMode: !isDragMode,
          });
        }}
      >
        <Hand size={24} />
      </button>

      <div ref={dropdownRef} className="dropdown dropdown-hover dropdown-end">
        <button tabIndex={0} className="btn btn-ghost">
          <Star size={24} />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border-2 border-base-300"
        >
          <li>
            <button
              onClick={() => handleShapeClick('rect')}
              className="flex items-center gap-2"
            >
              <Square size={20} />
              矩形
            </button>
          </li>
          <li>
            <button
              onClick={() => handleShapeClick('circle')}
              className="flex items-center gap-2"
            >
              <Circle size={20} />
              圆形
            </button>
          </li>
          <li>
            <button
              onClick={() => handleShapeClick('triangle')}
              className="flex items-center gap-2"
            >
              <Triangle size={20} />
              三角形
            </button>
          </li>
          <li>
            <button
              onClick={() => handleShapeClick('polygon')}
              className="flex items-center gap-2"
            >
              <Hexagon size={20} />
              多边形
            </button>
          </li>
          <li>
            <button
              onClick={() => handleShapeClick('star')}
              className="flex items-center gap-2"
            >
              <Star size={20} />
              星形
            </button>
          </li>
        </ul>
      </div>

      {/* <button
        onClick={() => setDrawingType(drawingType === 'free' ? null : 'free')}
        className={`btn btn-ghost ${drawingType === 'free' ? 'btn-active' : ''}`}
      >
        <Pencil size={24} />
      </button> */}

      <button onClick={() => handleAddText()} className="btn btn-ghost">
        <Type size={24} />
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-ghost"
      >
        <Image size={24} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </button>
    </div>
  );
};

import {
  ArrowRight,
  Circle,
  Hexagon,
  Image,
  MinusIcon,
  Pencil,
  Square,
  Star,
  Triangle,
  Type,
} from 'lucide-react';
import { useRef } from 'react';

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
  const isDrawMode = useEditorStore((state) => state.isDrawMode);

  const handleShapeClick = (shape: string) => {
    handleAddShape(shape);
    // 点击后关闭下拉菜单
    if (dropdownRef.current) {
      const ul = dropdownRef.current.querySelector('ul');
      if (ul) ul.blur();
    }
  };

  return (
    <div className="">
      <div ref={dropdownRef} className="dropdown dropdown-hover dropdown-end">
        <button tabIndex={0} className="btn btn-ghost">
          <Square size={24} />
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52"
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
          <li>
            <button
              onClick={() => handleShapeClick('line')}
              className="flex items-center gap-2"
            >
              <MinusIcon size={20} />
              直线
            </button>
          </li>
          <li>
            <button
              onClick={() => handleShapeClick('arrow')}
              className="flex items-center gap-2"
            >
              <ArrowRight size={20} />
              箭头
            </button>
          </li>
        </ul>
      </div>

      <button
        onClick={() => useEditorStore.setState({ isDrawMode: !isDrawMode })}
        className={`btn btn-ghost ${isDrawMode ? 'btn-active' : ''}`}
      >
        <Pencil size={24} />
      </button>

      <button onClick={handleAddText} className="btn btn-ghost">
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

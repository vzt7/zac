import {
  Circle,
  Hexagon,
  Image,
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
import { ELEMENT_EDITOR_WIDTH } from './ElementEditor';

// 扩展工具栏
export const SourcePanel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const height = useEditorStore((state) => state.editorProps?.height);

  return (
    <div
      className={`absolute top-4 left-[calc(50%-${ELEMENT_EDITOR_WIDTH}px)] z-10 flex flex-col gap-2 bg-base-300 p-2 shadow-lg shadow-gray-400 rounded-lg`}
    >
      <div className="">
        <button
          onClick={() => handleAddShape('rect')}
          className="btn btn-ghost"
        >
          <Square size={24} />
        </button>
        <button
          onClick={() => handleAddShape('circle')}
          className="btn btn-ghost"
        >
          <Circle size={24} />
        </button>
        <button
          onClick={() => handleAddShape('triangle')}
          className="btn btn-ghost"
        >
          <Triangle size={24} />
        </button>
        <button
          onClick={() => handleAddShape('polygon')}
          className="btn btn-ghost"
        >
          <Hexagon size={24} />
        </button>
        <button
          onClick={() => handleAddShape('star')}
          className="btn btn-ghost"
        >
          <Star size={24} />
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
    </div>
  );
};

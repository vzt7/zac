import { Hand, Image, Type } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { siOpenai } from 'simple-icons';

import { handleAddText, handleImageUpload } from '../editor.handler';
import { useEditorStore } from '../editor.store';
import { AiModal } from './AiModal';

// 扩展工具栏
export const SourcePanel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawingType, setDrawingType] = useState<'free' | null>(null);
  useEffect(() => {
    useEditorStore.setState({
      isDrawMode: Boolean(drawingType),
      drawingType,
    });
  }, [drawingType]);

  const isDragMode = useEditorStore((state) => state.isDragMode);

  const aiModalRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-row gap-2 p-2 shadow-md rounded-lg hover:bg-base-100 bg-base-200/40 transition-all duration-300">
      <button
        title="Drag Canvas"
        className={`btn btn-ghost ${isDragMode ? 'btn-active' : ''}`}
        onClick={() => {
          useEditorStore.setState({
            isDragMode: !isDragMode,
          });
        }}
      >
        <Hand size={24} />
      </button>

      {/* <button
        onClick={() => setDrawingType(drawingType === 'free' ? null : 'free')}
        className={`btn btn-ghost ${drawingType === 'free' ? 'btn-active' : ''}`}
      >
        <Pencil size={24} />
      </button> */}

      <button
        title="Basic Text"
        onClick={() => handleAddText()}
        className="btn btn-ghost"
      >
        <Type size={24} />
      </button>

      <button
        title="Image"
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

      <button
        title="Component"
        className="btn btn-ghost relative opacity-20 hover:opacity-40"
        onClick={() => aiModalRef.current?.click()}
      >
        <div
          dangerouslySetInnerHTML={{ __html: siOpenai.svg }}
          className="w-6 h-6 *:object-cover *:fill-current"
        ></div>
        <div className="badge badge-accent badge-sm absolute top-0 right-0 translate-x-[15%]">
          AI
        </div>
      </button>

      <AiModal ref={aiModalRef} />
    </div>
  );
};

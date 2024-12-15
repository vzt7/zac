import { ChangeEvent, useEffect, useRef } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';

interface TextEditorProps {
  selectedShape: Shape;
}

export const ElementEditorItem4RichText = ({ selectedShape }: TextEditorProps) => {
  const handleTextInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleUpdate({ text: e.target.value, id: selectedShape.id });
  };

  const handleFontChange = (property: string, value: string | number) => {
    handleUpdate({ [property]: value, id: selectedShape.id });
  };

  const textRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const fn = () => {
      if (!textRef.current) return;
      textRef.current.focus();
      textRef.current.setSelectionRange(0, textRef.current.value.length);
    };

    window.addEventListener('dblclick_text_element', fn);
    return () => {
      window.removeEventListener('dblclick_text_element', fn);
    };
  }, []);

  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="checkbox" defaultChecked />
      <div className="collapse-title font-medium">文字设置</div>
      <div className="collapse-content space-y-4">
        {/* 文本内容 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">文本内容</span>
          </label>
          <textarea
            ref={textRef}
            className="textarea textarea-bordered h-24"
            value={selectedShape.text || ''}
            onChange={handleTextInput}
            placeholder="请输入文本内容..."
          />
        </div>

        {/* 字体设置 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">字体</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={selectedShape.fontFamily || 'Arial'}
            onChange={(e) => handleFontChange('fontFamily', e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="SimSun">宋体</option>
            <option value="Microsoft YaHei">微软雅黑</option>
          </select>
        </div>

        {/* 字号和行高 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">字号</span>
            </label>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={selectedShape.fontSize || 16}
              onChange={(e) =>
                handleFontChange('fontSize', Number(e.target.value))
              }
              min="1"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">行高</span>
            </label>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={selectedShape.lineHeight || 1}
              onChange={(e) =>
                handleFontChange('lineHeight', Number(e.target.value))
              }
              min="0.1"
              step="0.1"
            />
          </div>
        </div>

        {/* 对齐方式 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">对齐方式</span>
          </label>
          <div className="join">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                className={`join-item btn btn-sm ${
                  selectedShape.align === align ? 'btn-primary' : ''
                }`}
                onClick={() => handleFontChange('align', align)}
              >
                {align === 'left'
                  ? '左对齐'
                  : align === 'center'
                    ? '居中'
                    : '右对齐'}
              </button>
            ))}
          </div>
        </div>

        {/* 文字装饰 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">文字装饰</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={
                  selectedShape.textDecoration?.includes('underline') || false
                }
                onChange={(e) => {
                  const decorations =
                    selectedShape.textDecoration?.split(' ') || [];
                  if (e.target.checked) {
                    decorations.push('underline');
                  } else {
                    const index = decorations.indexOf('underline');
                    if (index > -1) decorations.splice(index, 1);
                  }
                  handleFontChange('textDecoration', decorations.join(' '));
                }}
              />
              <span className="label-text">下划线</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={
                  selectedShape.textDecoration?.includes('line-through') ||
                  false
                }
                onChange={(e) => {
                  const decorations =
                    selectedShape.textDecoration?.split(' ') || [];
                  if (e.target.checked) {
                    decorations.push('line-through');
                  } else {
                    const index = decorations.indexOf('line-through');
                    if (index > -1) decorations.splice(index, 1);
                  }
                  handleFontChange('textDecoration', decorations.join(' '));
                }}
              />
              <span className="label-text">删除线</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

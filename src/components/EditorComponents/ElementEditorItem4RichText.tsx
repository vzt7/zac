import { ChangeEvent, useEffect, useRef } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';
import { useSidebarStore } from '../sidebar.store';

interface TextEditorProps {
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  selectedShape: Shape;
}

export const ElementEditorItem4RichText = ({
  defaultChecked = false,
  onCheckedChange,
  selectedShape,
}: TextEditorProps) => {
  const handleTextInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleUpdate({ text: e.target.value, id: selectedShape.id });
  };

  const handleFontChange = (property: string, value: string | number) => {
    handleUpdate({ [property]: value, id: selectedShape.id });
  };

  // Focus the text input when double-clicking on the text element
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

  const builtInFonts = useSidebarStore((state) => state.fonts);
  const customFonts = useSidebarStore((state) => state.customFonts);
  const additionalFonts = customFonts
    .concat(builtInFonts)
    .filter((item) => item.isLoaded);

  return (
    <>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      <div className="collapse-title font-medium">Text Properties</div>
      <div className="collapse-content space-y-4">
        {/* Text Content */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Text Content</span>
          </label>
          <textarea
            ref={textRef}
            className="textarea textarea-bordered h-24"
            value={selectedShape.text || ''}
            onChange={handleTextInput}
            placeholder="Please enter text content..."
          />
        </div>

        {/* Font Settings */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Font</span>
          </label>
          <select
            className="select select-bordered select-sm"
            value={selectedShape.fontFamily || 'Arial'}
            onChange={(e) => handleFontChange('fontFamily', e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="SimSun">SimSun</option>
            <option value="Microsoft YaHei">Microsoft YaHei</option>
            {additionalFonts.map((fontItem) => (
              <option key={fontItem.value} value={fontItem.value}>
                {fontItem.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size and Line Height */}
        <div className="grid grid-cols-2 gap-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Font Size</span>
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
              <span className="label-text">Line Height</span>
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

        {/* Text Alignment */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Text Alignment</span>
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
                  ? 'Left Align'
                  : align === 'center'
                    ? 'Center'
                    : 'Right Align'}
              </button>
            ))}
          </div>
        </div>

        {/* Text Decoration */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Text Decoration</span>
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
              <span className="label-text">Underline</span>
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
              <span className="label-text">Strikethrough</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

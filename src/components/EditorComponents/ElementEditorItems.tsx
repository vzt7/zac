import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useEditorStore } from '../editor.store';
import { ElementEditorItem4AdvancedSettings } from './ElementEditorItem4AdvancedSettings';
import { ElementEditorItem4BasicStyle } from './ElementEditorItem4BasicStyle.tsx';
import { ElementEditorItem4ImageCrop } from './ElementEditorItem4ImageCrop';
import { ElementEditorItem4KeyFrame } from './ElementEditorItem4KeyFrame.tsx';
import { ElementEditorItem4RichText } from './ElementEditorItem4RichText';

export const ElementEditorItems = () => {
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);

  const isAnimationEditing = useEditorStore(
    (state) => state.isAnimationEditing,
  );

  const selectedShape =
    (selectedIds.length === 1 && shapes.find((s) => selectedIds[0] === s.id)) ||
    null;

  const [defaultCheckedMap, setDefaultCheckedMap] = useState<{
    [key: string]: boolean;
  }>({
    animation: true,
    style: true,
    text: true,
    advanced: false,
  });
  const handleCheckedChange = (key: string, checked: boolean) => {
    setDefaultCheckedMap((prev) => ({ ...prev, [key]: checked }));
  };
  useEffect(() => {
    localStorage.setItem(
      'defaultCheckedMap',
      JSON.stringify(defaultCheckedMap),
    );
  }, [defaultCheckedMap]);
  useEffect(() => {
    const defaultCheckedMap = localStorage.getItem('defaultCheckedMap');
    if (defaultCheckedMap) {
      setDefaultCheckedMap(JSON.parse(defaultCheckedMap));
    }
  }, []);

  if (!selectedShape) return null;

  return (
    <>
      <div className="flex items-center gap-2 pb-4 cursor-pointer hover:text-primary transition-colors">
        <Settings size={20} />
        <span className="font-bold">Properties</span>
      </div>

      <div
        className="space-y-3 pb-12 pr-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isAnimationEditing && (
          <div className="collapse collapse-arrow bg-base-300">
            <ElementEditorItem4KeyFrame
              selectedShape={selectedShape}
              defaultChecked={defaultCheckedMap['animation']}
              onCheckedChange={(checked) =>
                handleCheckedChange('animation', checked)
              }
            />
          </div>
        )}

        {/* If the selected element is a text element, show the text editor */}
        {selectedShape.type === 'text' && (
          <div className="collapse collapse-arrow bg-base-200">
            <ElementEditorItem4RichText
              selectedShape={selectedShape}
              defaultChecked={defaultCheckedMap['text']}
              onCheckedChange={(checked) =>
                handleCheckedChange('text', checked)
              }
            />
          </div>
        )}

        <div className="collapse collapse-arrow bg-base-300">
          <ElementEditorItem4BasicStyle
            selectedShape={selectedShape}
            defaultChecked={defaultCheckedMap['style']}
            onCheckedChange={(checked) => handleCheckedChange('style', checked)}
          />
        </div>

        <div className="collapse collapse-arrow bg-base-300">
          {/* Transform and Blend Mode */}
          <ElementEditorItem4AdvancedSettings
            selectedShape={selectedShape}
            defaultChecked={defaultCheckedMap['advanced']}
            onCheckedChange={(checked) =>
              handleCheckedChange('advanced', checked)
            }
          />
        </div>

        {/* If the selected element is an image element, show the image cropper (invoked via right-click menu) */}
        {selectedShape.type === 'image' && <ElementEditorItem4ImageCrop />}
      </div>
    </>
  );
};

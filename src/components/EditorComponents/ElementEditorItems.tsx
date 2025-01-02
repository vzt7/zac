import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store.ts';
import { ElementEditorItem4AdvancedSettings } from './ElementEditorItem4AdvancedSettings';
import { ElementEditorItem4BasicStyle } from './ElementEditorItem4BasicStyle.tsx';
import { ElementEditorItem4ImageCrop } from './ElementEditorItem4ImageCrop';
import { ElementEditorItem4ImageEdit } from './ElementEditorItem4ImageEdit.tsx';
import { ElementEditorItem4KeyFrame } from './ElementEditorItem4KeyFrame.tsx';
import { ElementEditorItem4RichText } from './ElementEditorItem4RichText';
import { ElementEditorItem4Transform } from './ElementEditorItem4Transform.tsx';

export const ElementEditorItems = () => {
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);
  const currentProject = useHeaderStore((state) => state.currentProject);
  const isAnimationCanvas = currentProject?.canvas?.type === 'canvas_animation';
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
    transform: true,
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

  if (!selectedShape)
    return (
      <div className="p-12 flex justify-center items-center text-gray-400 dark:text-gray-600">
        No element selected
      </div>
    );

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
        {isAnimationCanvas && isAnimationEditing && (
          <div className="collapse collapse-arrow bg-base-300">
            <input
              type="checkbox"
              defaultChecked={defaultCheckedMap['animation']}
              onChange={(e) =>
                handleCheckedChange('animation', e.target.checked)
              }
            />{' '}
            <div className="collapse-title font-medium">Animation</div>
            <div className="collapse-content space-y-4">
              <ElementEditorItem4KeyFrame selectedShape={selectedShape} />
            </div>
          </div>
        )}

        {isAnimationCanvas && (
          <div className="collapse collapse-arrow bg-base-200">
            <input
              type="checkbox"
              defaultChecked={defaultCheckedMap['transform']}
              onChange={(e) =>
                handleCheckedChange('transform', e.target.checked)
              }
            />
            <div className="collapse-title font-medium">Transform</div>
            <div className="collapse-content space-y-4">
              <ElementEditorItem4Transform selectedShape={selectedShape} />
            </div>
          </div>
        )}

        {/* If the selected element is a text element, show the text editor */}
        {selectedShape.type === 'text' && (
          <div className="collapse collapse-arrow bg-base-200">
            <input
              type="checkbox"
              defaultChecked={defaultCheckedMap['text']}
              onChange={(e) => handleCheckedChange('text', e.target.checked)}
            />

            <div className="collapse-title font-medium">Text Properties</div>
            <div className="collapse-content space-y-4">
              <ElementEditorItem4RichText selectedShape={selectedShape} />
            </div>
          </div>
        )}

        <div className="collapse collapse-arrow bg-base-300">
          <input
            type="checkbox"
            defaultChecked={defaultCheckedMap['style']}
            onChange={(e) => handleCheckedChange('style', e.target.checked)}
          />
          <div className="collapse-title font-medium">Style</div>
          <div className="collapse-content space-y-4">
            <ElementEditorItem4BasicStyle selectedShape={selectedShape} />
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-300">
          <input
            type="checkbox"
            defaultChecked={defaultCheckedMap['advanced']}
            onChange={(e) => handleCheckedChange('advanced', e.target.checked)}
          />
          <div className="collapse-title font-medium">Advanced</div>
          <div className="collapse-content space-y-4">
            <ElementEditorItem4AdvancedSettings selectedShape={selectedShape} />
          </div>
        </div>

        {selectedShape.type === 'image' && (
          <>
            {/* If the selected element is an image element, show the image cropper (invoked via right-click menu) */}
            <ElementEditorItem4ImageCrop />
            {/* Same as image crop */}
            <ElementEditorItem4ImageEdit />
          </>
        )}
      </div>
    </>
  );
};

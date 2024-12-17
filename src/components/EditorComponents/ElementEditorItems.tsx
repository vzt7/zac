import { Settings } from 'lucide-react';
import { useRef } from 'react';

import { useEditorStore } from '../editor.store';
import { ElementEditorItem4AdvancedSettings } from './ElementEditorItem4AdvancedSettings';
import { ElementEditorItem4BasicStyle } from './ElementEditorItem4BasicStyle.tsx';
import { ElementEditorItem4ImageCrop } from './ElementEditorItem4ImageCrop';
import { ElementEditorItem4RichText } from './ElementEditorItem4RichText';

export const ElementEditorItems = () => {
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const shapes = useEditorStore((state) => state.shapes);

  const contentRef = useRef<HTMLDivElement>(null);
  // Add a function to scroll to the top
  const handleScrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectedShape =
    (selectedIds.length === 1 && shapes.find((s) => selectedIds[0] === s.id)) ||
    null;

  if (!selectedShape) return null;

  return (
    <>
      <div
        className="flex items-center gap-2 pb-4 cursor-pointer hover:text-primary transition-colors"
        onClick={handleScrollToTop}
      >
        <Settings size={20} />
        <span className="font-bold">Properties</span>
      </div>

      <div
        ref={contentRef}
        className="space-y-3 pb-12 pr-2 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* If the selected element is a text element, show the text editor */}
        {selectedShape.type === 'text' && (
          <ElementEditorItem4RichText selectedShape={selectedShape} />
        )}

        <div className="collapse collapse-arrow bg-base-300">
          <ElementEditorItem4BasicStyle selectedShape={selectedShape} />
        </div>

        <div className="collapse collapse-arrow bg-base-300">
          {/* Transform and Blend Mode */}
          <ElementEditorItem4AdvancedSettings selectedShape={selectedShape} />
        </div>

        {/* If the selected element is an image element, show the image cropper (invoked via right-click menu) */}
        {selectedShape.type === 'image' && <ElementEditorItem4ImageCrop />}
      </div>
    </>
  );
};

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Circle,
  Eye,
  EyeOff,
  Layers,
  Lock,
  LockOpen,
  Square,
  Trash2,
} from 'lucide-react';

import {
  handleDelete,
  handleEyeToggle,
  handleLockToggle,
  handleSelect,
} from '../editor.handler';
import { Shape, useEditorStore } from '../editor.store';

// 添加图层面板
export const LayersPanel = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        distance: 5,
      },
    }),
  );
  const shapes = useEditorStore((state) => state.shapes);
  const selectedIds = useEditorStore((state) => state.selectedIds);

  const safeArea = useEditorStore((state) => state.safeArea);

  return (
    <div
      className={`absolute left-4 top-4 bg-base-100 rounded-lg overflow-hidden p-2 shadow-md z-10 max-h-[400px] overflow-x-hidden overflow-y-auto`}
    >
      <div className="flex justify-center items-center gap-2 py-3">
        <Layers size={16} />
        <span className="font-bold">图层</span>
      </div>
      <div className="overflow-hidden">
        <div className="mt-1 rounded-lg overflow-hidden px-3 py-1">
          基础画布 {safeArea.width}x{safeArea.height}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;

            if (active.id !== over?.id) {
              const oldIndex = shapes.findIndex((s) => s.id === active.id);
              const newIndex = shapes.findIndex((s) => s.id === over?.id);

              const newShapes = arrayMove(shapes, oldIndex, newIndex);
              useEditorStore.setState({ shapes: newShapes });
            }
          }}
        >
          <SortableContext
            items={shapes}
            strategy={verticalListSortingStrategy}
          >
            {[...shapes].reverse().map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                shape={item}
                selected={selectedIds.includes(item.id)}
                locked={item.isLocked}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

const SortableItem = ({
  id,
  shape,
  selected,
  locked,
}: {
  id: string;
  shape: Shape;
  selected: boolean;
  locked?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        handleSelect([shape.id]);
      }}
      className="mt-1 rounded-lg overflow-hidden"
    >
      <div
        key={shape.id}
        className={`flex flex-row justify-between items-center hover:bg-base-300 cursor-move ${selected ? 'bg-base-300' : ''} transition-all`}
      >
        <div
          className="flex flex-row items-center gap-2 p-2"
          onDoubleClick={() => {}}
        >
          {shape.type === 'rect' ? <Square size={16} /> : <Circle size={16} />}
          <span
            className="max-w-[300px] ml-2 text-ellipsis overflow-hidden whitespace-nowrap"
            title={shape.id}
          >
            {shape.type} - {shape.id}
          </span>
        </div>

        <div className="flex flex-row items-center gap-2 py-2 pr-2 flex-shrink-0">
          <button
            className={`btn btn-ghost btn-sm rounded-md p-1 ${locked ? 'btn-active' : ''}`}
            onClick={() => {
              handleLockToggle(shape.id);
            }}
          >
            {shape.isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
          </button>
          <button
            className="btn btn-ghost btn-sm rounded-md p-1"
            onClick={() => {
              handleEyeToggle(shape.id);
            }}
          >
            {shape.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            className="btn btn-ghost btn-sm btn-error text-error rounded-md p-1"
            onClick={() => {
              handleDelete(shape.id);
            }}
          >
            {<Trash2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

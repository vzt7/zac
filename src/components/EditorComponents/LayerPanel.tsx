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
import { debounce } from 'lodash-es';
import {
  Check,
  ChevronsDownUp,
  ChevronsUpDown,
  Circle,
  Edit,
  Eye,
  EyeOff,
  Layers,
  Lock,
  LockOpen,
  Square,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  handleDelete,
  handleEyeToggle,
  handleLockToggle,
  handleSelect,
  handleUnselect,
  handleUpdate,
} from '../editor.handler';
import { Shape, useEditorStore } from '../editor.store';
import { renderIconShape } from './Elements';

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
  const keepShiftKey = useEditorStore((state) => state.keepShiftKey);

  const [filterValue, setFilterValue] = useState('');
  const filteredShapes = useMemo(() => {
    return shapes.reduce(
      (acc, shape) => {
        if (
          filterValue &&
          (shape.name?.includes(filterValue) || shape.id.includes(filterValue))
        ) {
          acc.unshift({ ...shape, isFiltered: true });
        } else {
          acc.push({ ...shape, isFiltered: false });
        }
        return acc;
      },
      [] as (Shape & { isFiltered: boolean })[],
    );
  }, [shapes, filterValue]);

  const layerPanelRef = useRef<HTMLDivElement>(null);
  const [handleScrollToTop] = useState(() => {
    return debounce(() => {
      layerPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  });

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`bg-base-100 overflow-hidden rounded-lg p-2 shadow-md z-10 select-none hover:bg-base-100 transition-all duration-300 ${
        isExpanded
          ? 'w-[360px] max-h-[500px]'
          : 'w-[60px] max-h-[56px] min-h-[56px] bg-base-200/40 rounded-full'
      }`}
    >
      <div className={`relative flex justify-center items-center py-2`}>
        <div
          className={`flex flex-row gap-3 ${isExpanded ? '' : 'opacity-0 w-0'}`}
        >
          <Layers size={20} />
          <span className="font-bold">Layers</span>
        </div>
        <button
          className={`absolute right-4 top-5 !translate-y-[-50%] btn btn-ghost ${
            isExpanded ? 'btn-sm' : 'translate-x-[18px]'
          } btn-circle opacity-80 transition-all duration-300`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronsDownUp size={20} />
          ) : (
            <ChevronsUpDown size={20} />
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-1 rounded-lg overflow-hidden px-3 py-1">
          <input
            type="text"
            placeholder="ID or Name"
            className="input input-bordered input-sm text-base py-5 w-full"
            onChange={(e) => {
              setFilterValue(e.target.value);
              handleScrollToTop();
            }}
          />
        </div>

        <div
          ref={layerPanelRef}
          className="max-h-[400px] overflow-x-hidden overflow-y-auto"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;

              if (active.id !== over?.id) {
                handleSelect([]);

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
              disabled={keepShiftKey}
            >
              {filteredShapes.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  shape={item}
                  isFiltered={item.isFiltered}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

const SortableItem = ({
  id,
  shape,
  isFiltered,
}: {
  id: string;
  shape: Shape;
  isFiltered?: boolean;
}) => {
  const keepShiftKey = useEditorStore((state) => state.keepShiftKey);
  const selectedIds = useEditorStore((state) => state.selectedIds);

  const selected = selectedIds.includes(shape.id);

  const [isEditMode, setIsEditMode] = useState(false);
  const [newName, setNewName] = useState(shape.name || shape.id);
  useEffect(() => {
    setNewName(shape.name || shape.id);
  }, [shape]);
  const handleSubmit = () => {
    handleUpdate({ id, name: newName });
    setIsEditMode(false);
  };

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled: isEditMode });

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
        if (selected) {
          handleUnselect(shape.id);
        } else {
          if (keepShiftKey) {
            handleSelect([...selectedIds, shape.id]);
          } else {
            handleSelect([shape.id]);
          }
        }
      }}
      className="mt-1 rounded-lg overflow-hidden"
    >
      <div
        key={shape.id}
        className={`flex flex-row justify-between items-center hover:bg-base-300 cursor-move ${selected ? 'bg-base-300' : ''} ${isFiltered ? 'font-bold' : ''} transition-all`}
      >
        <div className="flex flex-row items-center gap-2 p-2 w-[200px] h-[25px]">
          <div className="flex-shrink-0">{renderIconShape(shape)}</div>
          {isEditMode ? (
            <input
              type="text"
              value={newName}
              className="input input-bordered input-sm w-full text-base"
              onChange={(e) => {
                setNewName(e.target.value);
              }}
              onBlur={() => {
                handleSubmit();
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="ml-2 text-ellipsis overflow-hidden whitespace-nowrap"
              title={shape.name || shape.id}
            >
              {shape.name || shape.id}
            </span>
          )}
        </div>

        <div className="flex flex-row items-center gap-2 py-2 pr-2 flex-shrink-0">
          <button
            className={`btn btn-ghost btn-sm rounded-md p-1`}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditMode) {
                handleSubmit();
              }
              setIsEditMode(!isEditMode);
            }}
          >
            {isEditMode ? <Check size={16} /> : <Edit size={16} />}
          </button>
          <button
            className={`btn btn-ghost btn-sm rounded-md p-1 ${shape.isLocked ? 'btn-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleLockToggle(shape.id);
            }}
          >
            {shape.isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
          </button>
          <button
            className={`btn btn-ghost btn-sm rounded-md p-1 ${shape.visible === false ? 'btn-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleEyeToggle(shape.id);
            }}
          >
            {shape.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            className="btn btn-ghost btn-sm btn-error text-error rounded-md p-1"
            onClick={(e) => {
              e.stopPropagation();
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

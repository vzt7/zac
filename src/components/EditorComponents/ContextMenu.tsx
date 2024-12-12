import {
  ArrowDown,
  ArrowUp,
  Copy,
  Group,
  Layers2,
  Lock,
  LockOpen,
  MoveDown,
  MoveUp,
  Trash,
  Ungroup,
} from 'lucide-react';
import { ComponentProps, PropsWithChildren, useEffect, useRef } from 'react';

import {
  handleDelete,
  handleDuplicate,
  handleGroup,
  handleLockToggle,
  handleMoveDown,
  handleMoveToBottom,
  handleMoveToTop,
  handleMoveUp,
  handleUngroup,
  handleUpdate,
} from '../editor.handler';
import { useEditorStore } from '../editor.store';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu = ({ x, y, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedShapes = useEditorStore((state) => state.selectedShapes);
  const isLocked = selectedShapes?.some((shape) => shape.isLocked);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-base-100 shadow-lg rounded-lg py-2 z-50"
      style={{ left: x, top: y }}
    >
      <ContextMenuItemButton
        onClick={() => {
          handleMoveToTop(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <MoveUp size={16} />
        <span>置顶</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          handleMoveToBottom(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <MoveDown size={16} />
        <span>置底</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          handleMoveUp(selectedShapes[0].id);
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        <ArrowUp size={16} />
        <span>上移一层</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          handleMoveDown(selectedShapes[0].id);
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        <ArrowDown size={16} />
        <span>下移一层</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          const safeArea = useEditorStore.getState().safeArea;
          handleUpdate(
            {
              id: selectedShapes[0].id,
              width: safeArea.width,
              height: safeArea.height,
              x: safeArea.x,
              y: safeArea.y,
              scaleX: 1,
              scaleY: 1,
              isLocked: true,
            },
            (newShapes) => {
              const { head, bail } = newShapes.reduce(
                (res, shape) => {
                  if (shape.id === selectedShapes[0].id) {
                    res.head.push(shape);
                  } else {
                    res.bail.push(shape);
                  }
                  return res;
                },
                { head: [], bail: [] } as {
                  head: typeof newShapes;
                  bail: typeof newShapes;
                },
              );
              return [...head, ...bail];
            },
          );
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        <Layers2 size={16} />
        <span>设为背景</span>
      </ContextMenuItemButton>

      <div className="divider m-0"></div>

      <ContextMenuItemButton
        onClick={() => {
          handleGroup(selectedShapes);
          onClose();
        }}
        disabled={selectedShapes.length <= 1}
      >
        <Group size={16} />
        <span>组合</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        onClick={() => {
          handleUngroup(selectedShapes);
          onClose();
        }}
        disabled={!selectedShapes.some((shape) => shape.type === 'group')}
      >
        <Ungroup size={16} />
        <span>取消组合</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        onClick={() => {
          handleLockToggle(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        {isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
        <span>{isLocked ? '解锁' : '锁定'}</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        onClick={() => {
          handleDuplicate(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <Copy size={16} />
        <span>复制</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        className={`text-red-500`}
        disabled={isLocked}
        onClick={() => {
          handleDelete(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <Trash size={16} />
        <span>删除</span>
      </ContextMenuItemButton>
    </div>
  );
};

const ContextMenuItemButton = ({
  children,
  ...restProps
}: PropsWithChildren<ComponentProps<'button'>>) => {
  return (
    <button
      {...restProps}
      className={`w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-2 ${restProps.disabled ? 'text-gray-500 cursor-not-allowed hover:bg-none' : ''} ${restProps.className}`}
    >
      {children}
    </button>
  );
};

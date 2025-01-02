import {
  ArrowDown,
  ArrowUp,
  BringToFront,
  Copy,
  Crop,
  Edit,
  Group,
  Layers2,
  Lock,
  LockOpen,
  SendToBack,
  Trash,
  Ungroup,
} from 'lucide-react';
import { ComponentProps, PropsWithChildren, useEffect, useRef } from 'react';

import { CommonChip } from '../ChipPro';
import {
  handleDelete,
  handleDuplicate,
  handleGroup,
  handleImageCrop,
  handleImageEdit,
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
          handleMoveUp(selectedShapes[0].id);
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        <ArrowUp size={16} />
        <span>Move Up</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          handleMoveDown(selectedShapes[0].id);
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        <ArrowDown size={16} />
        <span>Move Down</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          handleMoveToTop(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <BringToFront size={16} />
        <span>Move Top</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          handleMoveToBottom(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <SendToBack size={16} />
        <span>Move Bottom</span>
      </ContextMenuItemButton>
      <ContextMenuItemButton
        onClick={() => {
          const safeArea = useEditorStore.getState().safeArea;
          const wh = {
            width: safeArea.width,
            height:
              selectedShapes[0].height && selectedShapes[0].width
                ? selectedShapes[0].height *
                  (safeArea.width / selectedShapes[0].width)
                : safeArea.height,
          };
          handleUpdate(
            {
              id: selectedShapes[0].id,
              width: wh.width,
              height: wh.height,
              x: safeArea.x + safeArea.width / 2 - wh.width / 2,
              y: safeArea.y + safeArea.height / 2 - wh.height / 2,
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
        <span>Set as Background</span>
      </ContextMenuItemButton>

      {/* 添加图片编辑功能 */}
      {selectedShapes.length === 1 && selectedShapes[0].type === 'image' && (
        <>
          <div className="divider m-0"></div>
          {selectedShapes[0].isSvgImage ? (
            <ContextMenuItemButton
              onClick={() => {
                // 调用图片编辑处理函数
                handleImageEdit();
                onClose();
              }}
              disabled={selectedShapes[0].isLocked}
            >
              <Edit size={16} />
              <span>Edit Image</span>
            </ContextMenuItemButton>
          ) : (
            <ContextMenuItemButton
              onClick={() => {
                // 调用图片编辑处理函数
                handleImageEdit();
                onClose();
              }}
              disabled={selectedShapes[0].isLocked || true}
            >
              <Edit size={16} />
              <span>Edit Image</span>
              <CommonChip className="absolute top-0 right-0 text-xs px-[6px] py-[2px] !bg-gray-500/80 text-base-content">
                Coming Soon
              </CommonChip>
            </ContextMenuItemButton>
          )}
        </>
      )}

      {selectedShapes.length === 1 &&
        selectedShapes[0].type === 'image' &&
        !selectedShapes[0].isSvgImage && (
          <ContextMenuItemButton
            onClick={() => {
              // 调用裁剪处理函数
              handleImageCrop();
              onClose();
            }}
            disabled={selectedShapes[0].isLocked}
          >
            <Crop size={16} />
            <span>Crop Image</span>
          </ContextMenuItemButton>
        )}

      <div className="divider m-0"></div>

      <ContextMenuItemButton
        onClick={() => {
          handleDuplicate(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <Copy size={16} />
        <span>Duplicate</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        onClick={() => {
          handleLockToggle(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
        disabled={selectedShapes.length > 1}
      >
        {isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
        <span>{isLocked ? 'Unlock' : 'Lock'}</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        onClick={() => {
          handleGroup(selectedShapes);
          onClose();
        }}
        disabled={selectedShapes.length <= 1}
      >
        <Group size={16} />
        <span>Group</span>
      </ContextMenuItemButton>

      <ContextMenuItemButton
        onClick={() => {
          handleUngroup(selectedShapes);
          onClose();
        }}
        disabled={
          selectedShapes.length !== 1 ||
          selectedShapes[0].type !== 'group' ||
          selectedShapes[0].isSvgGroup
        }
      >
        <Ungroup size={16} />
        <span>Ungroup</span>
      </ContextMenuItemButton>

      <div className="divider m-0"></div>

      <ContextMenuItemButton
        className={`text-red-500`}
        disabled={isLocked}
        onClick={() => {
          handleDelete(selectedShapes.map((shape) => shape.id));
          onClose();
        }}
      >
        <Trash size={16} />
        <span>Delete</span>
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
      className={`relative w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-2 ${restProps.disabled ? 'text-gray-500 cursor-not-allowed hover:bg-none' : ''} ${restProps.className}`}
    >
      {children}
    </button>
  );
};

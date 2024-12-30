import { KonvaAnimation } from '@/utils/animation';
import getRandomId from '@/utils/getRandomId';
import { clsx } from 'clsx';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import {
  CircleCheckBig,
  Edit,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import randomcolor from 'randomcolor';
import { useEffect, useRef, useState } from 'react';

import { addToHistory, handleSelect } from '../editor.handler';
import { Shape, useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';
import {
  AnimationHelperModalButton,
  AnimationItemEditingModal,
  AnimationTimeline,
} from './ElementEditorItemsAnimation.components';

// 注册GSAP插件
gsap.registerPlugin(Draggable);

export const ElementEditorItemsAnimation = () => {
  const currentProject = useHeaderStore((state) => state.currentProject);

  const shapes = useEditorStore((state) => state.shapes);

  const animations = useEditorStore((state) => state.animations) || [];
  const handleAddAnimationItem = () => {
    useEditorStore.setState({
      animations: [
        ...(animations || []),
        {
          id: `animation-${getRandomId()}`,
          name: 'Untitled',
          shapes:
            KonvaAnimation.getShapesByAnimationItemIndex(
              animations.length - 1,
            ) || shapes,
          _color: randomcolor({
            luminosity: 'bright',
            format: 'rgba',
            alpha: 1,
          }),
        },
      ],
    });
  };
  const handleUpdateAnimationItem = (data: (typeof animations)[number]) => {
    useEditorStore.setState({
      animations: (animations || []).map((item) =>
        data.id === item.id ? { ...item, ...data } : item,
      ),
    });
  };
  const handleDeleteAnimationItem = (data: (typeof animations)[number]) => {
    useEditorStore.setState({
      animations: (animations || []).filter((item) => data.id !== item.id),
    });
  };

  const [konvaAnimation] = useState(() => new KonvaAnimation());
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const onUpdateFns = useRef<(() => void)[]>([]);
  useEffect(() => {
    const tl = konvaAnimation.createTimeline({
      onUpdate: () => {
        onUpdateFns.current?.forEach((fn) => fn());
      },
    });
    setTimeline((prev) => prev ?? tl);
    return () => {
      tl.kill();
    };
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    useEditorStore.setState({
      isAnimationEditing: isEditing,
    });
  }, [isEditing]);

  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    useEditorStore.setState({
      isAnimationPlaying: isPlaying,
    });
  }, [isPlaying]);

  const tempShapes = useEditorStore((state) => state.tempShapes);
  const setTempShapes = (newShapes: Shape[]) => {
    useEditorStore.setState({
      tempShapes: newShapes,
    });
  };

  const [currentAnimationItem, setCurrentAnimationItem] = useState<
    (typeof animations)[number] | null
  >(null);

  // restore status
  const backupShapes = (shapes: Shape[]) => {
    localStorage.setItem('_pm_animation_editing_pid', currentProject?.id || '');
    setTempShapes(shapes);
  };
  const restoreShapes = (shapes: Shape[]) => {
    const projectId = localStorage.getItem('_pm_animation_editing_pid');
    if (!projectId || currentProject?.id !== projectId) {
      return;
    }
    useEditorStore.setState({
      shapes,
      history: [],
    });
    addToHistory(shapes);
    setTempShapes([]);
  };
  useEffect(() => {
    const { tempShapes, isAnimationEditing, isAnimationPlaying } =
      useEditorStore.getState();
    if (isAnimationEditing || isAnimationPlaying) {
      // 兼容开发环境
      return;
    }
    restoreShapes(tempShapes);
  }, []);

  const handleEditingStart = (
    item: (typeof animations)[number],
    index: number,
  ) => {
    handleSelect([]);
    // 设置当前动画项索引，判断复制粘贴时是否需要更新id
    useEditorStore.setState({
      currentAnimationItemIndex: index,
    });

    if (isEditing) {
      handleEditingComplete(shapes); // 编辑状态时切换动画项，参考源数据
    } else {
      // 首次进入编辑，备份当前shapes
      backupShapes(shapes);
    }

    // 应用已经编辑过的shape
    const updatedShapes =
      KonvaAnimation.getShapesByAnimationItemIndex(index) || tempShapes;
    const nextShapes = updatedShapes.map((shape) => ({
      ...shape,
      _animationItemIndex: index,
    }));
    useEditorStore.setState({
      shapes: nextShapes,
      history: [],
    });
    addToHistory(nextShapes);
    // 当前编辑项
    setCurrentAnimationItem(item);
    setIsEditing(true);
  };

  const handleEditingComplete = (latestShapes: Shape[]) => {
    handleSelect([]);
    useEditorStore.setState({
      currentAnimationItemIndex: null,
    });

    if (!tempShapes) {
      throw new Error(`tempShapes is null`);
    }
    if (!currentAnimationItem) {
      throw new Error(`currentAnimationItem is null`);
    }

    handleUpdateAnimationItem({
      ...currentAnimationItem,
      shapes: latestShapes,
    });

    // debug('[animations_handleEditingComplete_diffShapes]', diffShapes);
  };

  const animationItemEditingModalRef = useRef<HTMLButtonElement | null>(null);

  // debug('animations', animations, 'shapes', shapes);

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-row gap-2">
          {isEditing ? (
            <button
              className="btn btn-accent flex-grow"
              onClick={() => {
                handleEditingComplete(shapes);
                restoreShapes(tempShapes);
                setCurrentAnimationItem(null);
                setIsEditing(false);
                setIsPlaying(false);
              }}
            >
              <CircleCheckBig size={20} className="mr-1" />
              <span>Complete</span>
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary flex-grow"
                onClick={handleAddAnimationItem}
                disabled={isPlaying}
              >
                <Plus size={20} className="mr-1" />
                <span>Add Animation Key Frame</span>
              </button>
              <AnimationHelperModalButton />
            </>
          )}
        </div>
        <div
          className={clsx(
            'grid grid-cols-3 gap-2',
            animations.length <= 0 && 'hidden',
          )}
        >
          {animations.map((item, index) => (
            <div key={item.id} className="relative">
              <div
                className={clsx(
                  'card before:!bg-gray-400 dark:before:!bg-gray-700 image-full shadow-xl transition-all border-2 border-base-300 cursor-pointer overflow-hidden',
                  'hover:[&_.card-body]:opacity-100 hover:border-accent/40',
                  '[&_.card-body]:opacity-0',
                  currentAnimationItem?.id !== item.id &&
                    isEditing &&
                    'opacity-60 hover:bg-base-200',
                  currentAnimationItem?.id === item.id && '!border-accent',
                  isPlaying &&
                    'opacity-60 cursor-not-allowed pointer-events-none',
                )}
                onClick={() => handleEditingStart(item, index)}
              >
                <div
                  className={clsx(
                    'absolute left-0 top-1 my-2 mx-3 badge badge-neutral text-sm font-bold w-[calc(100%-24px)] z-10 truncate',
                    '!bg-transparent border-none',
                  )}
                  style={{
                    color: item._color,
                  }}
                >
                  {/* {item.id.match('-(.+)')?.[1] || item.id} */}
                  {item.name}
                </div>
                <figure
                  className={`text-2xl text-secondary font-bold`}
                  style={{
                    color: item._color,
                  }}
                >
                  {index + 1}
                </figure>
                <div
                  className={clsx(
                    'card-body m-0 p-0 min-h-[180px] flex justify-center items-center transition-all',
                    isEditing &&
                      currentAnimationItem?.id !== item.id &&
                      'pointer-events-none invisible',
                  )}
                >
                  <h2 className="card-title break-all text-lg text-base-content text-center px-2 pb-2 line-clamp-3">
                    {item.name}
                  </h2>
                  <div className="absolute bottom-2 flex justify-center gap-3 p-2 overflow-hidden">
                    {currentAnimationItem &&
                      currentAnimationItem.id === item.id && (
                        <button
                          className="btn btn-circle btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            animationItemEditingModalRef.current?.click();
                          }}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    <button
                      className="btn btn-circle btn-error btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnimationItem(item);
                        if (item.id === currentAnimationItem?.id) {
                          setCurrentAnimationItem(null);
                          restoreShapes(tempShapes);
                          setIsEditing(false);
                          setIsPlaying(false);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {currentAnimationItem && (
            <AnimationItemEditingModal
              ref={animationItemEditingModalRef}
              data={currentAnimationItem}
              onUpdate={(newData) => {
                setCurrentAnimationItem(newData);
                handleUpdateAnimationItem(newData);
              }}
            />
          )}
        </div>

        {isPlaying && timeline && (
          <AnimationTimeline
            timeline={timeline}
            onUpdate={(fn: () => void) => {
              onUpdateFns.current?.push(fn);
              return () => {
                const targetIndex = onUpdateFns.current?.findIndex(
                  (_fn) => _fn === fn,
                );
                if (typeof targetIndex === 'number' && targetIndex >= 0) {
                  onUpdateFns.current?.splice(targetIndex, 1);
                }
              };
            }}
          />
        )}

        {!isEditing && animations.length > 0 && (
          <div className="flex flex-row gap-2">
            {isPlaying ? (
              <button
                className={clsx(
                  'btn btn-primary flex-grow',
                  isPlaying && 'btn-secondary',
                )}
                onClick={() => {
                  if (!timeline) {
                    return;
                  }
                  konvaAnimation?.stop(timeline);
                  restoreShapes(tempShapes);
                  setIsEditing(false);
                  setIsPlaying(false);
                }}
              >
                <PauseCircle size={20} />
                <span>Stop Animation</span>
              </button>
            ) : (
              <button
                className={clsx(
                  'btn btn-primary flex-grow',
                  isPlaying && 'btn-secondary',
                )}
                onClick={async () => {
                  if (!timeline) {
                    return;
                  }
                  handleSelect([]);
                  backupShapes(shapes);
                  await konvaAnimation.ready(timeline);
                  setIsPlaying(true);
                  timeline.play();
                }}
              >
                <PlayCircle size={20} />
                <span>Play Animation</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="divider mt-0"></div>
    </>
  );
};

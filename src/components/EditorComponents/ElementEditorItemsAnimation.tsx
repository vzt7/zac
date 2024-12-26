import { KonvaAnimation } from '@/utils/animation';
import { debug } from '@/utils/debug';
import getRandomId from '@/utils/getRandomId';
import { clsx } from 'clsx';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { unionWith } from 'lodash-es';
import {
  CircleCheckBig,
  Edit,
  Pause,
  PauseCircle,
  Play,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { handleSelect } from '../editor.handler';
import { EditorStore, Shape, useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';

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
    setTimeline(tl);
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
    const { setShapes } = useEditorStore.getState();
    setShapes(shapes);
    setTempShapes([]);
  };
  useEffect(() => {
    const { tempShapes } = useEditorStore.getState();
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
      handleEditingComplete(); // 编辑状态时切换动画项，参考源数据
    } else {
      // 首次进入编辑，备份当前shapes
      backupShapes(shapes);
    }

    // 应用已经编辑过的shape
    const { setShapes } = useEditorStore.getState();
    const updatedShapes =
      KonvaAnimation.getShapesByAnimationItemIndex(index) || tempShapes;
    setShapes(
      updatedShapes.map((shape) => ({ ...shape, _animationItemIndex: index })),
    );
    // 当前编辑项
    setCurrentAnimationItem(item);
    setIsEditing(true);
  };

  const handleEditingComplete = (latestShapes: Shape[] = shapes) => {
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

    const currentAnimationItemIndex = animations.findIndex(
      (item) => item.id === currentAnimationItem.id,
    );

    const prevShapes =
      KonvaAnimation.getShapesByAnimationItemIndex(currentAnimationItemIndex) ||
      latestShapes;
    const nextShapes = unionWith(
      latestShapes,
      prevShapes,
      (a, b) => a.id === b.id,
    );

    handleUpdateAnimationItem({
      ...currentAnimationItem,
      shapes: nextShapes,
    });

    // debug('[animations_handleEditingComplete_diffShapes]', diffShapes);
  };

  const animationItemEditingModalRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <div className="flex flex-col gap-4 py-4">
        {isEditing ? (
          <button
            className="btn btn-accent w-full"
            onClick={() => {
              handleEditingComplete();
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
          <button
            className="btn btn-primary w-full"
            onClick={handleAddAnimationItem}
          >
            <Plus size={20} className="mr-1" />
            <span>Add Animation Key Frame</span>
          </button>
        )}
        <div className="grid grid-cols-3 gap-2">
          {animations?.map((item, index) => (
            <div key={item.id} className="relative">
              <div
                className={clsx(
                  'card bg-base-100 image-full shadow-xl transition-all border-2 border-transparent cursor-pointer overflow-hidden',
                  'hover:[&_.card-body]:opacity-100 hover:bg-base-300',
                  '[&_.card-body]:opacity-0',
                  currentAnimationItem?.id !== item.id &&
                    isEditing &&
                    'opacity-60 hover:bg-base-200',
                  currentAnimationItem?.id === item.id && '!border-primary/80',
                  isPlaying &&
                    'opacity-60 cursor-not-allowed pointer-events-none',
                )}
                onClick={() => handleEditingStart(item, index)}
              >
                <div className="absolute left-0 top-1 m-2 badge badge-neutral text-xs w-[calc(100%-16px)] z-10">
                  {item.id.match('-(.+)')?.[1] || item.id}
                </div>
                <figure
                  className={`text-2xl text-secondary font-bold opacity-[${Math.min(100, 60 + index * 5)}]`}
                >
                  {index + 1}
                </figure>
                <div className="card-body m-0 p-0 min-h-[200px] flex justify-center items-center transition-all">
                  <h2 className="card-title break-all text-lg">{item.name}</h2>
                  <div className="absolute bottom-2 flex justify-center gap-3 p-2 overflow-hidden">
                    <button
                      className="btn btn-circle btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        animationItemEditingModalRef.current?.click();
                      }}
                    >
                      <Edit size={16} />
                    </button>
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

              <AnimationItemEditingModal
                key={item.id}
                ref={animationItemEditingModalRef}
                data={item}
                onUpdate={handleUpdateAnimationItem}
              />
            </div>
          ))}
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
          <div>
            {isPlaying ? (
              <button
                className={clsx(
                  'btn btn-primary w-full',
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
                  'btn btn-primary w-full',
                  isPlaying && 'btn-secondary',
                )}
                onClick={() => {
                  if (!timeline) {
                    return;
                  }
                  handleSelect([]);
                  backupShapes(shapes);
                  setIsPlaying(true);
                  setTimeout(() => {
                    konvaAnimation.play(timeline);
                  }, 0);
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

const AnimationItemEditingModal = forwardRef<
  any,
  {
    data: NonNullable<EditorStore['animations']>[number];
    onUpdate: (newData: NonNullable<EditorStore['animations']>[number]) => void;
  }
>(({ data, onUpdate }, ref) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [formData, setFormData] = useState({
    name: data.name,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...data,
      ...formData,
    });
    dialogRef.current?.close();
  };

  return (
    <>
      <button
        ref={ref}
        className="btn hidden"
        onClick={(e) => {
          e.stopPropagation();
          dialogRef.current?.showModal();
        }}
      ></button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Edit Animation</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input input-bordered"
              />
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
});

interface AnimationTimelineProps {
  timeline: gsap.core.Timeline;
  onUpdate?: (fn: () => void) => CallableFunction;
  onUpdateParams?: (fn: (params: any) => void) => CallableFunction;
}

const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  timeline,
  onUpdate,
}) => {
  const [timelineState, setTimelineState] = useState({
    labelPosition: 1,
    paused: false,
    position: 0,
    endX: 500,
  });

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const scrubberInstanceRef = useRef<Draggable>();

  const createScrubber = () => {
    if (!scrubberRef.current || !timelineRef.current) return;

    scrubberInstanceRef.current = new Draggable(scrubberRef.current, {
      type: 'x',
      cursor: 'pointer',
      bounds: timelineRef.current,
      zIndexBoost: false,
      onPress: () => {
        timeline.pause();
        setTimelineState((prev) => ({ ...prev, paused: true }));
      },
      onDrag: function () {
        const progress = gsap.utils.normalize(
          this.minX || 0,
          this.maxX || 0,
          this.x,
        );
        timeline.progress(progress);
      },
    });
  };

  const updateScrubber = () => {
    if (!scrubberInstanceRef.current) return;

    const progress = timeline.progress();
    const x = gsap.utils.interpolate(
      scrubberInstanceRef.current.minX,
      scrubberInstanceRef.current.maxX,
      progress,
    );

    setTimelineState((prev) => ({
      ...prev,
      position: progress,
    }));

    gsap.set(scrubberRef.current, { x });
  };

  const togglePlayback = () => {
    if (timeline.progress() > 0.98) {
      setTimelineState((prev) => ({ ...prev, paused: false }));
      timeline.restart();
      return;
    }

    setTimelineState((prev) => {
      const newPaused = !prev.paused;
      timeline.paused(newPaused);
      return { ...prev, paused: newPaused };
    });
  };

  useEffect(() => {
    createScrubber();

    const clearFn = onUpdate?.(updateScrubber);

    // const handleResize = () => {
    //   scrubberInstanceRef.current?.update(true);
    //   updateScrubber();
    // };
    // window.addEventListener('resize', handleResize);

    return () => {
      // window.removeEventListener('resize', handleResize);
      scrubberInstanceRef.current?.kill();
      clearFn?.();
    };
  }, []);

  // const { isAnimationPlaying } = useEditorStore((state) => state);
  const duration = timeline.duration();
  const pointScale = duration < 5 ? 5 : duration < 10 ? 10 : 20; // TODO: 根据动画时长动态调整
  const points = Array(Math.round(duration * pointScale) || 0).fill(1);

  // debug('timelineState', timelineState, timeline.labels, duration);

  return (
    <div className="relative w-full pt-6 px-2 pl-12 bg-base-200 rounded-lg">
      <div className="relative h-[60px] w-full">
        <div ref={timelineRef} className={clsx(`relative w-full`)}>
          <div className="px-[12px] w-full flex flex-row justify-between">
            {points.map((_, index) => (
              <div key={index} className={clsx('relative h-12 flex flex-col')}>
                {/* 100ms */}
                <div
                  className={clsx(
                    'divider divider-horizontal h-4 m-0 p-0 w-0 before:bg-base-content/40 after:bg-base-content/40',
                  )}
                ></div>
                {/* 100ms * pointScale */}
                {index % pointScale === 0 && (
                  <div className="absolute bottom-0 left-[50%] -translate-x-[50%]">
                    {~~(index / pointScale)}
                  </div>
                )}
                {/* {(index % 10 === 0 && (
                    <div className="absolute bottom-0 left-[50%] -translate-x-[50%]">
                      {~~(index / 10)}
                    </div>
                  )) ||
                    (points.length - 1 === index && (
                      <div className="absolute bottom-0 left-[50%] -translate-x-[50%]">
                        {~~(duration * 100) / 100}
                      </div>
                    ))} */}
              </div>
            ))}
          </div>
          <div
            ref={scrubberRef}
            className="absolute top-0 left-0 w-5 h-full cursor-pointer z-20"
            style={{ touchAction: 'none' }}
          >
            <div className="absolute top-4 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-base-content/70 rounded-full" />
          </div>
        </div>
      </div>

      <div className="absolute top-[40%] left-3 -translate-y-1/2">
        <button onClick={togglePlayback} className="btn btn-circle btn-sm">
          {timelineState.paused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </div>
    </div>
  );
};

export default AnimationTimeline;

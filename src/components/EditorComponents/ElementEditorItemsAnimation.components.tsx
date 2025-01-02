import { debug } from '@/utils/debug';
import { clsx } from 'clsx';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { HelpCircle, Pause, Play } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { EditorStore, useEditorStore } from '../editor.store';

export const AnimationItemEditingModal = forwardRef<
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
  useEffect(() => {
    setFormData({
      name: data.name,
    });
  }, [data]);

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
                autoComplete="off"
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

export const AnimationTimeline: React.FC<{
  timeline: gsap.core.Timeline;
  onUpdate?: (fn: () => void) => CallableFunction;
  onUpdateParams?: (fn: (params: any) => void) => CallableFunction;
}> = ({ timeline, onUpdate }) => {
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
  const pointStep = 10;
  const points = Array(50).fill(1);
  const formatNum = (num: number) => {
    if (num < 1 && num > 0) {
      return num.toFixed(1);
    }
    return num.toFixed(0);
  };

  const animations = useEditorStore((state) => state.animations);
  const colors = animations?.map((item) => item._color || '#c6c6c6') || [];

  const labels = useMemo(() => {
    const _labels = timeline.labels;
    const _labelsKeys = Object.keys(_labels);
    const res: [number, number][] = [];
    for (let i = 0; i < _labelsKeys.length; i += 1) {
      const key = _labelsKeys[i];
      const item = _labels[key];
      // if (i === 0) {
      //   res.push([0, item]);
      //   continue;
      // }
      if (i === _labelsKeys.length - 1) {
        res.push([item, duration]);
        continue;
      }
      const nextKey = _labelsKeys[i + 1];
      const nextItem = _labels[nextKey];
      res.push([item, nextItem]);
    }
    return res;
  }, [duration, timeline.labels]);

  useEffect(() => {
    debug(
      'timelineState',
      timelineState,
      'raw labels',
      timeline.labels,
      'labels',
      labels,
      'duration',
      duration,
      'children',
      timeline.getChildren(),
    );
  }, []);

  if (duration <= 0) {
    return null;
  }

  return (
    <div className="relative w-full pt-16 px-5 bg-base-300 rounded-lg">
      <div className="flex flex-col gap-1 w-[calc(100%-16px)] mx-2 py-2">
        {labels.map(([start, end], index) => (
          <div
            key={index}
            className={clsx(
              'h-4 min-w-4 flex justify-center items-center rounded-full',
            )}
            style={{
              width: `${((end - start) / duration) * 100}%`,
              marginLeft: `${((start || 0) / duration) * 100}%`,
              // marginLeft: 0,
              backgroundColor: colors[index],
            }}
          ></div>
        ))}
      </div>
      <div className="relative h-[50px] my-[10px] w-full">
        <div ref={timelineRef} className={clsx(`relative w-full`)}>
          <div className="px-[12px] w-full flex flex-row justify-between">
            {points.map((_, index) => (
              <div key={index} className={clsx('relative h-12 flex flex-col')}>
                {/* 100ms */}
                <div
                  className={clsx(
                    'divider divider-horizontal h-2 m-0 p-0 w-0 before:bg-base-content/40 after:bg-base-content/40',
                    index % pointStep === 0 && 'h-3',
                  )}
                ></div>
                {/* 100ms * pointScale */}
                {(index % pointStep === 0 || index === points.length - 1) && (
                  <div
                    className="absolute bottom-0 left-[50%] -translate-x-[50%] p-1 cursor-pointer"
                    onClick={() => {
                      timeline.progress(index / points.length);
                    }}
                  >
                    {formatNum((index / (points.length - 1)) * duration)}
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
            <div className="absolute top-2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-base-content/70 rounded-full hover:bg-primary/70 transition-all duration-300" />
          </div>
        </div>
      </div>
      <div className="absolute top-9 left-3 -translate-y-1/2">
        <button
          onClick={togglePlayback}
          className="btn btn-circle hover:bg-base-content/20"
        >
          {timelineState.paused ? (
            <Play size={20} fill="currentColor" />
          ) : (
            <Pause size={20} fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
};

export const AnimationHelperModalButton = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  return (
    <>
      <button
        className="btn w-12 p-0"
        onClick={() => dialogRef.current?.showModal()}
      >
        <HelpCircle size={24} strokeWidth={1.5} />
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-3xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-lg mb-2 flex flex-row items-center gap-2">
              <HelpCircle size={18} strokeWidth={2.5} />
              <span>Animation Key Frames</span>
            </h3>
            <p>
              You can create animation by adding key frames. Key frames are
              points in the animation timeline that define the state of the
              element at a specific time.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold">How to use?</h4>
            <ul className="list-decimal list-inside">
              <li>
                Add key frames by clicking the 'Add Animation Key Frame' button.
              </li>
              <li>
                Then click the key frame card to edit it. You can change the
                position, shape, color, etc.
              </li>
              <li>
                After editing the key frame, click the 'Complete' button to
                complete the key frame.
              </li>
              <li>
                Preview the animation by clicking the 'Play Animation' button.
              </li>
              <li>
                Download the animation GIF/MP4 by clicking the 'Download'
                button.
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold">Why not animation effects?</h4>
            <ul className="list-disc list-inside">
              <li>
                Check out the element is the same as which in the previous key
                frame. You can copy it across key frames, so the element will
                keep the same identity.
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold">How to rotate by center?</h4>
            <ul className="list-disc list-inside">
              <li>
                You can set the transform origin to the center of the element by
                the 'Transform Origin' property setting.
              </li>
              <li>
                The key frame will be affected by previous key frame, so maybe
                you need to set the transform origin for the previous key frame
                as well.
              </li>
            </ul>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

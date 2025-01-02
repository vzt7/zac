import { gsap } from 'gsap';
import React, { useEffect, useRef } from 'react';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';

const EASE_FUNCTION_NAMES = [
  'none',
  'power1',
  'power1.in',
  'power1.out',
  'power1.inOut',
  'power2',
  'power2.in',
  'power2.out',
  'power2.inOut',
  'power3',
  'power3.in',
  'power3.out',
  'power3.inOut',
  'power4',
  'power4.in',
  'power4.out',
  'power4.inOut',
  'back',
  'back.in',
  'back.out',
  'back.inOut',
  'bounce',
  'bounce.in',
  'bounce.out',
  'bounce.inOut',
  'circ',
  'circ.in',
  'circ.out',
  'circ.inOut',
  'elastic',
  'elastic.in',
  'elastic.out',
  'elastic.inOut',
  'expo',
  'expo.in',
  'expo.out',
  'expo.inOut',
  'sine',
  'sine.in',
  'sine.out',
  'sine.inOut',
];

export const ElementEditorItem4KeyFrame = ({
  selectedShape,
}: {
  selectedShape: Shape;
}) => {
  const handleAnimationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    handleUpdate({
      ...selectedShape,
      _animationKeyFrameRecords: {
        ...selectedShape._animationKeyFrameRecords,
        [name]:
          name === 'duration' || name === 'delay'
            ? Number(value)
            : name === 'ease'
              ? value
              : parseFloat(value),
      } as gsap.TweenVars,
    });
  };
  const setEaseFunctions = (ease?: string) => {
    handleUpdate({
      ...selectedShape,
      _animationKeyFrameRecords: {
        ...selectedShape._animationKeyFrameRecords,
        ease,
      } as gsap.TweenVars,
    });
  };

  const records = {
    ...(selectedShape._animationKeyFrameRecords || {}),
    ease: selectedShape._animationKeyFrameRecords?.ease || 'none',
    duration: selectedShape._animationKeyFrameRecords?.duration ?? 1,
    delay: selectedShape._animationKeyFrameRecords?.delay ?? 0,
  };

  const easePreviewTargetRef = useRef<HTMLDivElement>(null);
  const handleEasePlay = (ease: string) => {
    const tween = gsap.to(easePreviewTargetRef.current, {
      delay: 0.3,
      duration: 1,
      ease: ease,
      left: 'calc(95% - 48px)',
    });
    tween.play();

    return () => {
      tween.pause();
      tween.time(0);
      tween.kill();
    };
  };
  useEffect(() => {
    if (selectedShape._animationKeyFrameRecords?.ease) {
      const clearFn = handleEasePlay(
        selectedShape._animationKeyFrameRecords.ease,
      );
      return () => {
        clearFn();
      };
    }
  }, [selectedShape._animationKeyFrameRecords?.ease]);

  return (
    <>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Duration</span>
        </label>
        <div className="flex flex-row gap-4 items-center">
          <input
            type="range"
            name="duration"
            className="range range-sm w-full"
            value={records.duration || 0}
            onChange={handleAnimationChange}
            min={0}
            max={30}
            step={0.1}
          />
          <label className="input input-bordered input-sm flex items-center gap-2 w-48">
            <input
              type="number"
              name="duration"
              className="input input-ghost input-sm border-none w-full"
              value={records.duration || 0}
              onChange={handleAnimationChange}
              min={0}
              max={30}
              step={0.1}
            />
            <span>s</span>
          </label>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Delay</span>
        </label>
        <div className="flex flex-row gap-4 items-center">
          <input
            type="range"
            name="delay"
            className="range range-sm w-full"
            value={records.delay || 0}
            onChange={handleAnimationChange}
            min={0}
            max={60}
            step={0.1}
          />
          <label className="input input-bordered input-sm flex items-center gap-2 w-48">
            <input
              type="number"
              name="delay"
              className="input input-ghost input-sm border-none w-full"
              value={records.delay || 0}
              onChange={handleAnimationChange}
              min={0}
              max={60}
            />
            <span>s</span>
          </label>
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Easing function</span>
        </label>
        <div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                key={selectedShape.id}
                className="toggle toggle-primary"
                defaultChecked={Boolean(records.ease)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setEaseFunctions('none');
                  } else {
                    setEaseFunctions(undefined);
                  }
                }}
              />
              <span className="label-text">
                {records.ease ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>
        {Boolean(records.ease) && (
          <div className="p-4 bg-base-100 rounded-lg">
            <div className={`relative w-full h-12 mb-4`}>
              <div
                ref={easePreviewTargetRef}
                className="absolute top-0 left-[5%] w-12 h-12 bg-primary rounded-lg"
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {EASE_FUNCTION_NAMES.map((ease) => (
                <label key={ease} className="cursor-pointer">
                  <div className="flex flex-row gap-2 items-center">
                    <input
                      type="radio"
                      name="ease"
                      value={ease}
                      className="radio radio-xs"
                      checked={records.ease === ease}
                      onChange={handleAnimationChange}
                    />
                    <span className="label-text text-xs font-semibold">
                      {ease}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

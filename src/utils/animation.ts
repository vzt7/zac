import { Shape, useEditorStore } from '@/components/editor.store';
import { gsap } from 'gsap';
import { Stage } from 'konva/lib/Stage';
import { keyBy } from 'lodash-es';

import { debug } from './debug';

export class KonvaAnimation {
  static getShapesByAnimationItemIndex = (index: number) => {
    if (index < 0) {
      return null;
    }
    const { animations } = useEditorStore.getState();
    const targetShapes = animations?.[index]?.shapes || [];
    return targetShapes;
  };

  createTimeline(options?: gsap.TimelineVars) {
    const { stageRef } = useEditorStore.getState();

    const timeline = gsap.timeline({
      repeat: 0,
      repeatDelay: 1,
      paused: true,
      ...options,
      onUpdate: () => {
        options?.onUpdate?.();
        stageRef.current?.getLayers()[0].batchDraw();
      },
    });

    this.currentTimeline = timeline;

    return timeline;
  }

  currentTimeline: gsap.core.Timeline | null = null;
  currentTimelineClearFn: CallableFunction | null = null;

  play(
    timeline: gsap.core.Timeline,
    /** 动画项索引，指定index播放时，store 中的 shapes必须为该index对应的shapes */
    animationItemIndex: number = 0,
  ) {
    const { animations, stageRef, shapes, setShapes } =
      useEditorStore.getState();

    this.currentTimeline = timeline;

    const currentShapes = [...shapes];
    const timelineAddList: CallableFunction[][] = [];
    const shapeAddList: Shape[] = [];

    while (animationItemIndex < (animations || []).length) {
      const nextShapes =
        KonvaAnimation.getShapesByAnimationItemIndex(animationItemIndex) ||
        shapes;
      debug(`[KonvaAnimation.play] nextShapes`, nextShapes);

      const timelineAddFns: ((
        timeline: gsap.core.Timeline,
        timelineLabel?: string,
      ) => void)[] = [];
      for (let i = 0; i < nextShapes.length; i++) {
        const nextItem = nextShapes[i];
        this.addItem2Timeline(timelineAddFns, shapeAddList, {
          stage: stageRef.current!,
          nextItem,
        });
      }
      timelineAddList.push([...timelineAddFns]);

      animationItemIndex += 1;
    }

    const tempShapes = currentShapes.concat(
      Object.values(keyBy(shapeAddList.reverse(), 'id')), // 后面会把前面的覆盖，反转后即优先取前面的
    );
    setShapes(tempShapes);

    const go2Play = (maxDelay: number = 2000) => {
      if (maxDelay <= 0) {
        throw new Error('Animation is not ready with unknown element');
      }
      const isReady = shapeAddList.every((shape) => {
        const node = stageRef.current?.findOne(`#${shape.id}`);
        return node;
      });
      if (!isReady) {
        setTimeout(() => go2Play(maxDelay - 200), 200);
      } else {
        timelineAddList.forEach((fnList, listIndex) => {
          timeline.addLabel(`${listIndex}`);
          fnList.forEach((fn, index) =>
            fn(timeline, index === 0 ? `${listIndex}` : '<'),
          );
        });
        timeline.play();
      }
    };

    go2Play();

    return () => {
      this.currentTimelineClearFn?.();
    };
  }

  stop(timeline: gsap.core.Timeline) {
    if (!timeline) {
      return;
    }

    timeline.pause();
    timeline.time(0);
    timeline.clear(true);

    if (timeline === this.currentTimeline) {
      this.currentTimeline = null;
    }
  }

  addItem2Timeline(
    timelineAddFns: CallableFunction[],
    shapeAddList: Shape[],
    {
      stage,
      nextItem,
    }: {
      stage: Stage;
      nextItem: Shape;
    },
  ) {
    const node = stage.findOne(`#${nextItem.id}`);
    const isDynamicAdded = !node;
    if (isDynamicAdded) {
      shapeAddList.push({
        ...nextItem,
        isLocked: true,
        visible: false,
        _animationKeyFrameRecords: {},
        _animation_isDynamicAdded: true,
      });
    }

    timelineAddFns.push(
      (timeline: gsap.core.Timeline, timelineLabel?: string) => {
        const _node = stage.findOne(`#${nextItem.id}`);

        const duration = nextItem._animationKeyFrameRecords?.duration ?? 0;
        const ease = nextItem._animationKeyFrameRecords?.ease ?? null;
        console.log('timelineLabel', timelineLabel, duration, ease, nextItem);

        if (ease === null) {
          timeline.to(
            _node!,
            {
              ...this.mapKonvaProperty2GsapProperty(nextItem),
              duration: 0.001,
            },
            timelineLabel,
          );
          timeline.to(
            _node!,
            {
              // ...this.mapKonvaProperty2GsapProperty(nextItem),
              ...nextItem._animationKeyFrameRecords,
              duration: duration <= 0 ? 0.001 : duration,
              onStart: () => {
                if (isDynamicAdded && nextItem.visible !== false) {
                  _node?.setAttr('visible', true);
                }
              },
            },
            timelineLabel,
          );
          return;
        }

        timeline.to(
          _node!,
          {
            ...this.mapKonvaProperty2GsapProperty(nextItem),
            ...nextItem._animationKeyFrameRecords,
            duration: duration <= 0 ? 0.001 : duration,
            onStart: () => {
              if (isDynamicAdded && nextItem.visible !== false) {
                _node?.setAttr('visible', true);
              }
            },
          },
          timelineLabel,
        );
      },
    );
  }

  private mapKonvaProperty2GsapProperty(shape: Shape) {
    // Konva属性 映射到 gsap 动画属性
    return {
      x: shape.x,
      y: shape.y,
      rotation: typeof shape.rotation === 'number' ? shape.rotation : 0,
      offsetX: shape.offsetX ?? 0,
      offsetY: shape.offsetY ?? 0,

      width: shape.width,
      height: shape.height,
      scaleX: shape.scaleX ?? 1,
      scaleY: shape.scaleY ?? 1,
      opacity: shape.opacity ?? 1,
    };
  }
}

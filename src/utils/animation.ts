import { Shape, useEditorStore } from '@/components/editor.store';
import { gsap } from 'gsap';
import Konva from 'konva';
import {
  differenceBy,
  differenceWith,
  isEqual,
  keyBy,
  unionWith,
} from 'lodash-es';

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

  async ready(
    timeline: gsap.core.Timeline,
    /** 动画项索引，指定index播放时，store 中的 shapes必须为该index对应的shapes */
    animationItemIndex: number = 0,
  ) {
    const { animations, stageRef, shapes, setShapes } =
      useEditorStore.getState();
    if (!stageRef.current) {
      throw new Error('Stage is not ready');
    }

    this.currentTimeline = timeline;

    const originalShapes = [...shapes];
    const originalShapesMap = keyBy(originalShapes, 'id');
    let initShapes: Shape[] = [...originalShapes];
    const timelineAddList: CallableFunction[] = [];

    for (let i = animationItemIndex; i < (animations || []).length; i += 1) {
      const prevShapes =
        KonvaAnimation.getShapesByAnimationItemIndex(i - 1) || [];
      const currentShapes =
        KonvaAnimation.getShapesByAnimationItemIndex(i) || shapes;
      debug(`[KonvaAnimation.play] currentShapes`, currentShapes);

      // 增
      const added = differenceBy(currentShapes, prevShapes, 'id');
      const addedMap = keyBy(added, 'id');
      // 删
      const removed = differenceBy(prevShapes, currentShapes, 'id');
      const removedMap = keyBy(removed, 'id');
      // 改
      const updated = differenceWith(prevShapes, currentShapes, isEqual);
      const updatedMap = keyBy(updated, 'id');

      initShapes = unionWith(
        initShapes,
        currentShapes,
        (a, b) => a.id === b.id,
      );

      // 计算每一动画项下各元素的 zIndex
      const zIndexMap = Object.fromEntries(
        [...initShapes].map((item) => {
          const _index = currentShapes.findIndex(
            (shape) => shape.id === item.id,
          );
          if (_index < 0) {
            return [item.id, initShapes.length] as const;
          }
          return [item.id, initShapes.length - _index] as const; // +1 因为 0 是遮罩占用了
        }),
      );

      const actions: ((timelineIndex: number, index: number) => void)[] = [];
      currentShapes.map((item) => {
        const fn = (timelineLabelIndex: number) => {
          const node = stageRef.current!.findOne(`#${item.id}`)!;
          return this.getTimelineActionItem({
            node,
            item,
            timeline,
            timelineLabelIndex,
            timelinePosition: `${timelineLabelIndex}`,
            added,
            addedMap,
            updated,
            updatedMap,
            removed,
            removedMap,
            zIndexMap,
          });
        };
        actions.push(fn);
      });
      timelineAddList.push((timelineLabelIndex: number) => {
        timeline.addLabel(String(timelineLabelIndex));
        actions.map((fn, index) => {
          fn(timelineLabelIndex, index);
        });
      });

      debug(`[KonvaAnimation.ready] ${i}`, prevShapes, currentShapes);
    }

    setShapes(
      initShapes.map((item) => {
        return {
          ...item,
          opacity: originalShapesMap[item.id] ? 1 : 0, // 初始值取决于默认canvas内是否存在该元素，否则由动画控制
        };
      }),
    );

    const go2Ready = (callback: () => void, maxDelay: number = 2000) => {
      if (maxDelay <= 0) {
        throw new Error('Animation is not ready with unknown element');
      }
      const isReady = initShapes.every((shape) => {
        const node = stageRef.current?.findOne(`#${shape.id}`);
        return node;
      });
      if (!isReady) {
        setTimeout(() => go2Ready(callback, maxDelay - 200), 200);
      } else {
        timelineAddList.forEach((fn, index) => fn(index));
        setTimeout(() => callback(), 100);
      }
    };

    await new Promise((resolve) => {
      go2Ready(() => resolve(1), 2000);
    });
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

  getTimelineActionItem({
    node,
    item,
    timeline,
    timelineLabelIndex,
    timelinePosition,
    added,
    addedMap,
    updated,
    updatedMap,
    removed,
    removedMap,
    onStart,
    zIndexMap,
  }: {
    node: Konva.Node;
    item: Shape;
    timeline: gsap.core.Timeline;
    timelineLabelIndex: number;
    timelinePosition: string;
    added: Shape[];
    addedMap: Record<string, Shape>;
    updated: Shape[];
    updatedMap: Record<string, Shape>;
    removed: Shape[];
    removedMap: Record<string, Shape>;
    zIndexMap: Record<string, number>;
    onStart?: () => void;
  }) {
    if (removedMap[item.id]) {
      debug(
        `[KonvaAnimation.getTimelineActionItem] set opacity 0 for removed ${item.name || item.id} on ${timelinePosition}`,
      );
      timeline.to(
        node,
        {
          opacity: 0,
          duration: 0.00001,
        },
        timelinePosition,
      );
      return;
    }

    if (!addedMap[item.id] && !updatedMap[item.id]) {
      debug(
        `[KonvaAnimation.getTimelineActionItem] do nothing for not added or updated "${item.name || item.id}" on ${timelinePosition}`,
      );
      return;
    }

    // if (addedMap[item.id]) {
    //   debug(
    //     `[KonvaAnimation.getTimelineActionItem] set opacity 1 for added "${item.name || item.id}" on ${timelinePosition}`,
    //   );
    //   timeline.to(
    //     node,
    //     {
    //       opacity: 1,
    //       duration: 0.00001,
    //     },
    //     timelinePosition,
    //   );
    // }

    const interceptedItem = item;

    const duration = interceptedItem._animationKeyFrameRecords?.duration ?? 0;
    const ease = interceptedItem._animationKeyFrameRecords?.ease ?? null;

    if (ease === null || duration <= 0) {
      debug(
        `[KonvaAnimation.getTimelineActionItem] set init position for "${interceptedItem.name || interceptedItem.id}" on ${timelinePosition}`,
      );
      timeline.to(
        node,
        {
          ...this.mapKonvaProperty2GsapProperty(interceptedItem, node),
          ...interceptedItem._animationKeyFrameRecords,
          duration: 0.00001,
          zIndex: zIndexMap[interceptedItem.id],
        },
        timelinePosition,
      );
    }

    debug(
      `[KonvaAnimation.getTimelineActionItem] set animation for "${interceptedItem.name || interceptedItem.id}" on ${timelinePosition}`,
      {
        ...this.mapKonvaProperty2GsapProperty(interceptedItem, node),
        ...interceptedItem._animationKeyFrameRecords,
        duration: duration <= 0 ? 0.00001 : duration,
      },
    );
    timeline.to(
      node,
      {
        ...this.mapKonvaProperty2GsapProperty(interceptedItem, node),
        ...interceptedItem._animationKeyFrameRecords,
        duration: duration <= 0 ? 0.00001 : duration,
        zIndex: zIndexMap[interceptedItem.id],
        onStart() {
          onStart?.();
        },
      },
      timelinePosition,
    );
  }

  // Konva属性 映射到 gsap 动画属性
  private mapKonvaProperty2GsapProperty(shape: Shape, node: Konva.Node) {
    return {
      x: shape.x,
      y: shape.y,
      rotation: typeof shape.rotation === 'number' ? shape.rotation : 0,
      offsetX: shape.offsetX ?? 0,
      offsetY: shape.offsetY ?? 0,

      width: shape.width ?? node.width(),
      height: shape.height ?? node.height(),
      scaleX: shape.scaleX ?? 1,
      scaleY: shape.scaleY ?? 1,
      opacity: shape.opacity ?? 1,

      fill: shape.fill,
      skewX: shape.skewX ?? 0,
      skewY: shape.skewY ?? 0,
    } as gsap.TweenVars;
  }
}

import Konva from 'konva';
import {
  ArrowRight as LucideArrowRight,
  Box as LucideBox,
  Circle as LucideCircle,
  Image as LucideImage,
  Minus as LucideMinus,
  Pen as LucidePen,
  Pentagon as LucidePentagon,
  type LucideProps,
  Square as LucideSquare,
  Star as LucideStar,
  Triangle as LucideTriangle,
  Type as LucideType,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  Arrow,
  Circle,
  Group,
  Image,
  Line,
  Path,
  Rect,
  RegularPolygon,
  Star,
} from 'react-konva';
import { Text } from 'react-konva';
import useImage from 'use-image';

import { handleUpdate } from '../editor.handler';
import { Shape } from '../editor.store';

const DEFAULT_FILL = '#000000';
const DEFAULT_WIDTH = 100;

// 合并后的渲染方法
export const renderShape = (shape: Shape) => {
  const commonProps = shape;

  switch (shape.type) {
    case 'group':
      return (
        <Group key={commonProps.id} {...commonProps}>
          {shape.children?.map((child) =>
            renderShape({
              ...child,
              draggable: false,
              // onClick: (e: any) => {
              //   e.cancelBubble = true;
              // },
            }),
          )}
        </Group>
      );
    case 'rect':
      return (
        <Rect
          key={commonProps.id}
          {...commonProps}
          width={commonProps.width || DEFAULT_WIDTH}
          height={commonProps.height || DEFAULT_WIDTH}
        />
      );
    case 'circle':
      return (
        <Circle
          key={commonProps.id}
          {...commonProps}
          width={commonProps.width || DEFAULT_WIDTH}
          height={commonProps.height || DEFAULT_WIDTH}
          radius={commonProps.radius || DEFAULT_WIDTH / 2}
        />
      );
    case 'triangle':
      return (
        <RegularPolygon
          key={commonProps.id}
          {...commonProps}
          radius={commonProps.radius || 50}
          sides={commonProps.sides || 3}
          points={commonProps.points || [0, -50, 50, 50, -50, 50]}
        />
      );
    case 'polygon':
      return (
        <RegularPolygon
          key={commonProps.id}
          {...commonProps}
          fill={commonProps.fill || DEFAULT_FILL}
          sides={commonProps.sides || 6}
          radius={commonProps.radius || 50}
        />
      );
    case 'star':
      return (
        <Star
          key={commonProps.id}
          {...commonProps}
          numPoints={commonProps.numPoints || 5}
          innerRadius={commonProps.innerRadius || 20}
          outerRadius={commonProps.outerRadius || 50}
          fill={commonProps.fill || DEFAULT_FILL}
          points={
            commonProps.points || [
              0, -50, 10, -20, 40, -20, 20, 0, 30, 30, 0, 20, -30, 30, -20, 0,
              -40, -20, -10, -20,
            ]
          }
        />
      );
    case 'text':
      return (
        <TextElement
          key={commonProps.id}
          {...commonProps}
          fill={commonProps.fill || DEFAULT_FILL}
        />
      );
    // return <SvgElement src={commonProps.image as string} />;
    case 'svg':
      return (
        <Image
          {...commonProps}
          image={commonProps.image}
          fill={commonProps.fill || DEFAULT_FILL}
        />
      );
    case 'image':
      return (
        <ImageElement key={commonProps.id} {...commonProps} src={shape.src!} />
      );
    case 'line':
      return (
        <Line
          key={commonProps.id}
          {...commonProps}
          points={commonProps.points || [0, 0, 100, 0]}
          lineCap={commonProps.lineCap || 'round'}
          lineJoin={commonProps.lineJoin || 'round'}
          strokeWidth={commonProps.strokeWidth || 2}
          fill={commonProps.fill || ''}
        />
      );
    // case 'freedraw':
    //   return (
    //     <Line
    //       key={commonProps.id}
    //       {...commonProps}
    //       fill={commonProps.fill || DEFAULT_FILL}
    //       stroke={commonProps.stroke || '#000000'}
    //       strokeWidth={
    //         commonProps.strokeWidth ||
    //         5 / Math.min(editorProps.scaleX, editorProps.scaleY)
    //       }
    //       tension={commonProps.tension || 0.5}
    //       lineCap={commonProps.lineCap || 'round'}
    //       lineJoin={commonProps.lineJoin || 'round'}
    //       globalCompositeOperation={
    //         commonProps.globalCompositeOperation || 'source-over'
    //       }
    //       draggable={commonProps.draggable || true}
    //     />
    //   );
    // case 'arrow':
    //   return <ArrowElement key={commonProps.id} {...commonProps} />;
    case 'path':
      return (
        <Path
          key={commonProps.id}
          {...commonProps}
          fill={commonProps.fill || DEFAULT_FILL}
        />
      );
    default:
      return null;
  }
};

export const renderIconShape = (shape: Shape, props?: LucideProps) => {
  switch (shape.type) {
    case 'rect':
      return <LucideSquare size={16} {...props} />;
    case 'circle':
      return <LucideCircle size={16} {...props} />;
    case 'triangle':
      return <LucideTriangle size={16} {...props} />;
    case 'polygon':
      return <LucidePentagon size={16} {...props} />;
    case 'star':
      return <LucideStar size={16} {...props} />;
    case 'text':
      return <LucideType size={16} {...props} />;
    case 'svg':
      return <LucideImage size={16} {...props} />;
    case 'image':
      return <LucideImage size={16} {...props} />;
    case 'line':
      return <LucideMinus size={16} {...props} />;
    case 'arrow':
      return <LucideArrowRight size={16} {...props} />;
    case 'freedraw':
      return <LucidePen size={16} {...props} />;
    default:
      return <LucideBox size={16} {...props} />;
  }
};

const SvgElement = ({ src }: { src: string }) => {
  const ref = useRef<Konva.Image>(null);
  const [image] = useImage(src);
  return <Image ref={ref} image={image} />;
};

const ImageElement = ({
  src,
  ...restProps
}: Omit<ComponentProps<typeof Image>, 'image'> & { src: string }) => {
  const [image] = useImage(src, 'anonymous', 'origin');

  useEffect(() => {
    if (image) {
      image.src = src;
    }
  }, [src]);

  return (
    <Image
      {...restProps}
      image={image}
      ref={(ref) => {
        ref?.cache();
        ref?.drawHitFromCache();
      }}
    />
  );
};

const TextElement = (props: Shape) => {
  return (
    <Text
      {...props}
      onDblClick={(e) => {
        window.dispatchEvent(new CustomEvent('dblclick_text_element'));
      }}
    />
  );
};

// const ArrowElement = (commonProps: Shape) => {
//   const arrowRef = useRef<Konva.Arrow>(null);
//   const anchor1Ref = useRef<Konva.Circle>(null);
//   const anchor2Ref = useRef<Konva.Circle>(null);

//   const syncRef = useRef(() => {});

//   // 获取初始points
//   const points = commonProps.points || [0, 0, 100, 0];

//   const handleDragMove = (e: any, isStart: boolean) => {
//     if (!arrowRef.current) return;

//     // 获取相对于Group的位置
//     const pos = e.target.position();
//     const group = e.target.getParent();

//     // 创建新的points数组
//     const newPoints = [...points];
//     if (isStart) {
//       newPoints[0] = pos.x;
//       newPoints[1] = pos.y;
//     } else {
//       newPoints[2] = pos.x;
//       newPoints[3] = pos.y;
//     }

//     // 更新Arrow的points
//     arrowRef.current.points(newPoints);
//     arrowRef.current.getLayer()?.batchDraw();
//   };

//   const handleDragEnd = (e: any) => {
//     // 获取 Group 的位置
//     const group = e.target.getParent();
//     const groupPos = group.position();

//     // 更新 commonProps 中的位置
//     handleUpdate({
//       id: commonProps.id,
//       x: groupPos.x,
//       y: groupPos.y,
//     });
//   };

//   console.log('points', points);

//   return (
//     <Group
//       x={commonProps.x}
//       y={commonProps.y}
//       draggable={commonProps.draggable}
//       onDragEnd={handleDragEnd}
//     >
//       <Arrow
//         ref={arrowRef}
//         {...commonProps}
//         x={0}
//         y={0}
//         points={points}
//         pointerLength={commonProps.pointerLength ?? 10}
//         pointerWidth={commonProps.pointerWidth ?? 10}
//         lineCap={commonProps.lineCap || 'round'}
//         lineJoin={commonProps.lineJoin || 'round'}
//         fill={commonProps.fill || ''}
//         strokeWidth={commonProps.strokeWidth ?? 2}
//       />

//       {/* 起点锚点 */}
//       <Circle
//         ref={anchor1Ref}
//         x={points[0]}
//         y={points[1]}
//         radius={8}
//         fill="white"
//         stroke="black"
//         strokeWidth={1}
//         draggable
//         onDragMove={(e) => handleDragMove(e, true)}
//       />

//       {/* 终点锚点 */}
//       <Circle
//         ref={anchor2Ref}
//         x={points[2]}
//         y={points[3]}
//         radius={8}
//         fill="white"
//         stroke="black"
//         strokeWidth={1}
//         draggable
//         onDragMove={(e) => handleDragMove(e, false)}
//       />
//     </Group>
//   );
// };

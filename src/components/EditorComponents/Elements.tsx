import Konva from 'konva';
import { useRef } from 'react';
import {
  Arrow,
  Circle,
  Group,
  Image,
  Line,
  Rect,
  RegularPolygon,
  Star,
} from 'react-konva';
import useImage from 'use-image';

import { Shape } from '../editor.store';
import { ImageElement } from './ElementImage';
import { TextElement } from './ElementText';

const SvgElement = ({ src }: { src: string }) => {
  const ref = useRef<Konva.Image>(null);
  const [image] = useImage(src);
  return <Image ref={ref} image={image} />;
};

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
      return <Rect key={commonProps.id} {...commonProps} />;
    case 'circle':
      return <Circle key={commonProps.id} {...commonProps} />;
    case 'triangle':
      return (
        <RegularPolygon
          key={commonProps.id}
          {...commonProps}
          radius={commonProps.radius || 50}
          sides={commonProps.sides || 3}
        />
      );
    case 'polygon':
      return (
        <RegularPolygon
          key={commonProps.id}
          {...commonProps}
          radius={commonProps.radius || 50}
          sides={commonProps.sides || 6}
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
        />
      );
    case 'text':
      return <TextElement key={commonProps.id} {...commonProps} />;
    // return <SvgElement src={commonProps.image as string} />;
    case 'svg':
      return <Image {...commonProps} image={commonProps.image} />;
    case 'image':
      return (
        <ImageElement key={commonProps.id} {...commonProps} src={shape.src!} />
      );
    case 'line':
      return <Line key={commonProps.id} {...commonProps} />;
    case 'freedraw':
      return <Line key={commonProps.id} {...commonProps} />;
    case 'arrow':
      return (
        <Arrow
          key={commonProps.id}
          {...commonProps}
          points={commonProps.points || [0, 0, 100, 100]}
        />
      );
    default:
      return null;
  }
};

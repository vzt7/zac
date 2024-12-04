import { ShapeConfig } from 'konva/lib/Shape';
import { Circle, Group, Line, Rect, RegularPolygon, Star } from 'react-konva';

import { Shape } from '../editor.store';
import { ImageElement } from './ElementImage';
import { TextElement } from './ElementText';

// 合并后的渲染方法
export const renderShape = (shape: Shape) => {
  switch (shape.type) {
    case 'group':
      return (
        <Group {...shape}>
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
      return <Rect {...shape} />;
    case 'circle':
      return <Circle {...shape} />;
    case 'triangle':
      return <RegularPolygon {...shape} radius={50} sides={3} />;
    case 'polygon':
      return <RegularPolygon {...shape} radius={50} sides={6} />;
    case 'star':
      return (
        <Star {...shape} numPoints={5} innerRadius={20} outerRadius={50} />
      );
    case 'text':
      return <TextElement {...shape} />;
    case 'image':
      return <ImageElement {...shape} src={shape.src!} />;
    case 'line':
      return <Line {...shape} />;
    default:
      return null;
  }
};

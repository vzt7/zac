import {
  Arrow,
  Circle,
  Group,
  Line,
  Rect,
  RegularPolygon,
  Star,
} from 'react-konva';

import { Shape } from '../editor.store';
import { ImageElement } from './ElementImage';
import { TextElement } from './ElementText';

// 合并后的渲染方法
export const renderShape = (shape: Shape) => {
  const commonProps = shape;

  switch (shape.type) {
    case 'group':
      return (
        <Group {...commonProps}>
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
      return <Rect {...commonProps} />;
    case 'circle':
      return <Circle {...commonProps} />;
    case 'triangle':
      return (
        <RegularPolygon
          {...commonProps}
          radius={commonProps.radius || 50}
          sides={commonProps.sides || 3}
        />
      );
    case 'polygon':
      return (
        <RegularPolygon
          {...commonProps}
          radius={commonProps.radius || 50}
          sides={commonProps.sides || 6}
        />
      );
    case 'star':
      return (
        <Star
          {...commonProps}
          numPoints={commonProps.numPoints || 5}
          innerRadius={commonProps.innerRadius || 20}
          outerRadius={commonProps.outerRadius || 50}
        />
      );
    case 'text':
      return <TextElement {...commonProps} />;
    case 'image':
      return <ImageElement {...commonProps} src={shape.src!} />;
    case 'line':
      return <Line {...commonProps} />;
    case 'freedraw':
      return <Line {...commonProps} />;
    case 'arrow':
      return (
        <Arrow
          {...commonProps}
          points={commonProps.points || [0, 0, 100, 100]}
        />
      );
    default:
      return null;
  }
};

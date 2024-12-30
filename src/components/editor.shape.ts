import type { Shape } from './editor.store';

const DEFAULT_FILL = '#000000';
const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 100;

const DEFAULT_PROPS: Record<string, Partial<Shape>> = {
  rect: {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  circle: {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    radius: DEFAULT_WIDTH / 2,
  },
  triangle: {
    radius: 50,
    sides: 3,
    points: [0, -50, 50, 50, -50, 50],
  },
  polygon: {
    radius: 50,
    sides: 6,
    fill: DEFAULT_FILL,
  },
  star: {
    numPoints: 5,
    innerRadius: 20,
    outerRadius: 50,
    fill: DEFAULT_FILL,
    points: [
      0, -50, 10, -20, 40, -20, 20, 0, 30, 30, 0, 20, -30, 30, -20, 0, -40, -20,
      -10, -20,
    ],
  },
  text: {
    fill: DEFAULT_FILL,
  },
  svg: {
    fill: DEFAULT_FILL,
  },
  line: {
    points: [0, 0, 100, 0],
    lineCap: 'round',
    lineJoin: 'round',
    strokeWidth: 2,
    fill: DEFAULT_FILL,
  },
  path: {
    fill: DEFAULT_FILL,
  },
};

export const getDefaultShapeProps = (type: string) => {
  return DEFAULT_PROPS[type as keyof typeof DEFAULT_PROPS];
};

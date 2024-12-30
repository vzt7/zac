import { Shape } from './editor.store';
import { useEditorStore } from './editor.store';

export const handleUpdateAnimationItemShapes = (
  item: Partial<Shape> & { id: Shape['id'] },
) => {
  const { animations } = useEditorStore.getState();
  const newAnimations = animations?.map((animationItem) => {
    return {
      ...animationItem,
      shapes: animationItem.shapes.map((shape) => {
        if (item.id === shape.id) {
          return { ...shape, ...item };
        }
        return shape;
      }),
    };
  });
  useEditorStore.setState({ animations: newAnimations });
};

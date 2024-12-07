import { Text } from 'react-konva';

import { Shape } from '../editor.store';

export const TextElement = (props: Shape) => {
  return (
    <Text
      {...props}
      onDblClick={() => {
        window.dispatchEvent(new CustomEvent('dblclick_text_element'));
      }}
    />
  );
};

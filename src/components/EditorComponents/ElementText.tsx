import { ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import { Text as KonvaText } from 'react-konva';

import { handleTextEdit } from '../editor.handler';

export const TextElement = (props: ComponentProps<typeof KonvaText>) => {
  const { text, id } = props;
  return (
    <>
      <KonvaText
        {...props}
        // opacity={0}
        onDblClick={(e) => {
          const textNode = e.target;
          const stage = textNode.getStage();
          if (!stage) {
            return;
          }
          const container = stage.container();
          const textarea = document.createElement('textarea');
          textarea.value = text || '';
          textarea.rows = 1;
          textarea.style.position = 'absolute';
          const textNodeWidth = textNode.width() * textNode.scaleX();
          const textNodeHeight = textNode.height() * textNode.scaleY();
          textarea.className = `textarea textarea-bordered !w-[${~~textNodeWidth}px] !h-[${~~textNodeHeight}px]`;
          console.log(textNodeWidth, textNodeHeight);
          const top =
            textNode.absolutePosition().y +
            container.offsetTop +
            (textNode.height() * textNode.scaleY()) / 2;
          textarea.style.top = `${top}px`;
          const left =
            textNode.absolutePosition().x +
            container.offsetLeft +
            (textNode.width() * textNode.scaleX()) / 2;
          textarea.style.left = `${left}px`;
          document.body.appendChild(textarea);
          textarea.focus();

          textarea.addEventListener('blur', () => {
            handleTextEdit(id!, textarea.value);
            document.body.removeChild(textarea);
          });
        }}
      />
    </>
  );
};

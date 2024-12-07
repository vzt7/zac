import { ComponentProps } from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export const ImageElement = ({
  src,
  ...restProps
}: Omit<ComponentProps<typeof KonvaImage>, 'image'> & { src: string }) => {
  const [image] = useImage(src);

  return (
    <KonvaImage
      {...restProps}
      image={image}
      ref={(ref) => {
        ref?.cache();
        ref?.drawHitFromCache();
      }}
    />
  );
};

import { ComponentProps, useEffect, useRef } from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

export const ImageElement = ({
  src,
  ...restProps
}: Omit<ComponentProps<typeof Image>, 'image'> & { src: string }) => {
  const [image] = useImage(src);

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

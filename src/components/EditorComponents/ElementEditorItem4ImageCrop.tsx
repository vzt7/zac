import { useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

import { handleUpdate } from '../editor.handler';
import { useEditorStore } from '../editor.store';

enum CropRatio {
  '1:1' = 1 / 1,
  '4:3' = 4 / 3,
  '16:9' = 16 / 9,
  '3:4' = 3 / 4,
  '9:16' = 9 / 16,
}

export const ElementEditorItem4ImageCrop = () => {
  const isImageCropping = useEditorStore((state) => state.isImageCropping);
  const containerRef = useRef<HTMLDivElement>(null);

  const [crop, onCropChange] = useState({ x: 0, y: 0 });
  const [zoom, onZoomChange] = useState(1);
  const [rotation, onRotationChange] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspect, setAspect] = useState<number>(4 / 3);
  const [customAspect, setCustomAspect] = useState<number | null>(null);
  const [cropShape, setCropShape] = useState<'rect' | 'round'>('rect');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleOpenModal = () => {
    dialogRef.current?.showModal();
  };
  const handleCloseModal = () => {
    dialogRef.current?.close();
    useEditorStore.setState({
      isImageCropping: false,
    });

    // reset
    onCropChange({ x: 0, y: 0 });
    onZoomChange(1);
    onRotationChange(0);
    setAspect(4 / 3);
    setCropShape('rect');
  };

  const [imageSrc, setImageSrc] = useState<string>();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      handleOpenModal();
    } else {
      handleCloseModal();
    }
  }, [open]);

  useEffect(() => {
    if (isImageCropping) {
      setOpen(true);
      setTimeout(() => {
        const { initialSrc, src } = useEditorStore.getState().selectedShapes[0];
        setImageSrc(initialSrc || src);
      }, 200);
    } else {
      setOpen(false);
    }
  }, [imageSrc, isImageCropping]);

  const showCroppedImage = async () => {
    if (!imageSrc) {
      return;
    }
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
      );
      const item = useEditorStore.getState().selectedShapes[0];
      handleUpdate({
        id: item.id,
        src: croppedImage,
      });
      handleCloseModal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <dialog ref={dialogRef} className="modal" onClose={handleCloseModal}>
        <div className="modal-box min-w-[50vw] min-h-[50vh] flex flex-row gap-4">
          <div
            className="relative w-[800px] h-[50vh] min-h-[400px] px-16"
            ref={containerRef}
          >
            {(imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={customAspect || aspect}
                cropShape={cropShape}
                // restrictPosition={false}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onRotationChange={onRotationChange}
                onCropComplete={(croppedArea, croppedAreaPixels) => {
                  setCroppedAreaPixels(croppedAreaPixels);
                }}
                onMediaLoaded={(mediaSize) => {
                  onZoomChange(1.2);
                }}
              />
            )) || <div className="skeleton w-full h-full"></div>}
          </div>

          {/* settings */}
          <div className="flex flex-col gap-4 px-4 min-w-[300px] flex-grow">
            <div className="flex justify-between items-center gap-3">
              <label className="label flex-shrink-0">Crop Ratio</label>
              <select
                value={customAspect === null ? aspect : 0}
                onChange={(e) => {
                  setCustomAspect(null);
                  setAspect(parseFloat(e.target.value));
                }}
                className="select select-bordered w-full max-w-xs"
              >
                <option value={CropRatio['1:1']}>1:1</option>
                <option value={CropRatio['4:3']}>4:3</option>
                <option value={CropRatio['16:9']}>16:9</option>
                <option value={CropRatio['3:4']}>3:4</option>
                <option value={CropRatio['9:16']}>9:16</option>
                {customAspect && <option value={0}>Custom</option>}
              </select>
              <span>=</span>
              <input
                type="number"
                value={
                  customAspect === null ? aspect.toPrecision(3) : customAspect
                }
                onChange={(e) => {
                  setCustomAspect(Number(e.target.value));
                }}
                onBlur={(e) => {
                  setCustomAspect(
                    e.target.value ? Number(e.target.value) : null,
                  );
                }}
                className="input input-bordered w-full max-w-xs"
              />
            </div>

            <div className="flex justify-between items-center gap-3">
              <label className="label flex-shrink-0">Crop Shape</label>
              <select
                value={cropShape}
                onChange={(e) =>
                  setCropShape(e.target.value as 'rect' | 'round')
                }
                className="select select-bordered w-full max-w-xs"
              >
                <option value="rect">Rect</option>
                <option value="round">Round</option>
              </select>
            </div>

            <div className="flex justify-between items-center gap-3">
              <label className="label flex-shrink-0">Rotation</label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => onRotationChange(Number(e.target.value))}
                className="range range-primary"
              />
            </div>

            <div className="flex justify-between items-center gap-3">
              <label className="label flex-shrink-0">Scale</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => {
                  onZoomChange(Number(e.target.value));
                }}
                className="range range-primary"
              />
            </div>

            <button
              className="btn btn-primary w-full mt-4"
              onClick={showCroppedImage}
            >
              Confirm
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </div>
  );
};

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any,
  rotation = 0,
) => {
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // 解决跨域问题
      image.src = url;
    });

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180;
  };

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get Canvas context');
  }

  const radians = getRadianAngle(rotation);
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const width = image.width;
  const height = image.height;

  // 计算旋转后的画布大小
  const rotatedWidth = width * cos + height * sin;
  const rotatedHeight = width * sin + height * cos;

  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;

  // 将图像绘制到旋转后的画布上
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -width / 2, -height / 2);

  // 获取裁剪区域的图像数据
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  // 转换为Base64格式
  return canvas.toDataURL('image/png');
};

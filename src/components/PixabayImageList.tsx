import { PIXABAY_CATEGORY } from '@/hooks/usePixabayApi';
import { usePixabayApi } from '@/hooks/usePixabayApi';
import { debug } from '@/utils/debug';
import { Search } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { handleAddImage } from './editor.handler';
import { useEditorStore } from './editor.store';

export const PixabayImageList = ({
  data,
  isLoading,
  onChangePage,
}: {
  data: NonNullable<ReturnType<typeof usePixabayApi>['data']>;
  isLoading: boolean;
  onChangePage: (fn: (prev: number) => number) => void;
}) => {
  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading) {
        onChangePage((prev) => prev + 1);
      }
    },
    [isLoading, onChangePage],
  );
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const [loadingItemIds, setLoadingItemIds] = useState<number[]>([]);
  const handleAdd2Canvas = async (image: (typeof data.hits)[number]) => {
    debug('[handleAdd2Canvas]', image);

    setLoadingItemIds((prev) => [...prev, image.id]);
    await fetch(image.largeImageURL).catch(() => null); // TODO: 处理图片加载失败 & 链接过期或失效时
    setLoadingItemIds((prev) => prev.filter((id) => id !== image.id));

    const asBackground = data.args.category === PIXABAY_CATEGORY.BACKGROUNDS;
    if (asBackground) {
      const { safeArea } = useEditorStore.getState();
      const bgShape = {
        width: safeArea.width,
        height: image.imageHeight * (safeArea.width / image.imageWidth),
      };
      handleAddImage(
        image.largeImageURL,
        {
          ...bgShape,
          x: safeArea.x + safeArea.width / 2 - bgShape.width / 2,
          y: safeArea.y + safeArea.height / 2 - bgShape.height / 2,
          isLocked: true,
        },
        { insertTo: 'bottom' },
      );
    } else {
      handleAddImage(image.largeImageURL);
    }
  };

  return (
    <div>
      {/* Images Grid */}
      <div className="grid grid-cols-1 gap-4">
        {data.hits.map((image) => (
          <div
            key={image.id}
            className="card bg-base-100 overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:[&_img]:scale-125"
            onClick={() => handleAdd2Canvas(image)}
          >
            <figure>
              <img
                src={image.webformatURL}
                alt={image.tags}
                className="w-full h-48 object-cover transition-all duration-500"
              />
              <div className="absolute bottom-0 left-0 w-full p-2 text-xs opacity-70 bg-base-100/50 hover:bg-base-100/80 hover:opacity-100 transition-all cursor-auto">
                By{' '}
                <a
                  href={image.pageURL}
                  target="_blank"
                  className="link link-primary no-underline hover:underline"
                >
                  {image.user}
                </a>{' '}
                on{' '}
                <a
                  className="link link-primary no-underline hover:underline"
                  target="_blank"
                  href="https://pixabay.com"
                >
                  Pixabay
                </a>
              </div>

              {loadingItemIds.includes(image.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-100/40">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              )}
            </figure>
            {/* <div className="card-body p-2"></div> */}
          </div>
        ))}
      </div>

      {/* Loading State */}
      <div className="flex justify-center my-12">
        {isLoading && (
          <span className="loading loading-spinner loading-md"></span>
        )}
      </div>

      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-4" />
    </div>
  );
};

export const PixabayImageListRateLimitTip = ({
  data,
  onRefetch,
}: {
  data: ReturnType<typeof usePixabayApi>['data'];
  onRefetch: () => void;
}) => {
  const resetTime = data?.xRateLimitReset || 0;
  return (
    <div role="alert" className="alert alert-warning items-start">
      <TriangleAlert size={20} className="mt-2" />
      <div className="leading-tight">
        <p>
          <span>Rate limit exceeded</span>
          <span>Reset in {resetTime} seconds</span>
        </p>
        <button
          className="btn btn-sm btn-outline w-full mt-2"
          onClick={() => onRefetch()}
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export const PixabayImageListSearchInput = ({
  isLoading,
  isDisabled,
  onSearch,
}: {
  isLoading: boolean;
  isDisabled: boolean;
  onSearch: (searchValue: string) => void;
}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-row items-center gap-2">
      <input
        type="text"
        placeholder="Search images..."
        className="input input-bordered w-full"
        onChange={(e) => setSearchValue(e.target.value)}
        disabled={isDisabled}
      />
      <button
        className="btn btn-primary"
        onClick={() => onSearch(searchValue || '')}
        disabled={isDisabled || !searchValue}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <Search size={20} />
        )}
      </button>
    </div>
  );
};

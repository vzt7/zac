import { debug } from '@/utils/debug';
import { useQuery } from '@tanstack/react-query';
import { Search, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { handleAddImage } from './editor.handler';
import { useEditorStore } from './editor.store';

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: Array<{
    id: number;
    pageURL: string;
    type: string;
    tags: string;
    previewURL: string;
    previewWidth: number;
    previewHeight: number;
    webformatURL: string;
    webformatWidth: number;
    webformatHeight: number;
    largeImageURL: string;
    fullHDURL: string;
    imageURL: string;
    imageWidth: number;
    imageHeight: number;
    imageSize: number;
    views: number;
    downloads: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
  }>;
  xRateLimitLimit: number; // The maximum number of requests that the consumer is permitted to make in 60 seconds.
  xRateLimitRemaining: number; // The number of requests remaining in the current rate limit window.
  xRateLimitReset: number; // The remaining time in seconds after which the current rate limit window resets.
}

enum CATEGORY {
  BACKGROUNDS = 'backgrounds',
  FASHION = 'fashion',
  NATURE = 'nature',
  SCIENCE = 'science',
  EDUCATION = 'education',
  FEELINGS = 'feelings',
  HEALTH = 'health',
  PEOPLE = 'people',
  RELIGION = 'religion',
  PLACES = 'places',
  ANIMALS = 'animals',
  INDUSTRIES = 'industries',
  COMPUTER = 'computer',
  FOOD = 'food',
  SPORTS = 'sports',
  TRANSPORTATION = 'transportation',
  TRAVEL = 'travel',
  BUILDINGS = 'buildings',
  BUSINESS = 'business',
  MUSIC = 'music',
}

const usePixabayBackgrounds = ({
  page,
  search,
  category = 'backgrounds',
}: {
  page: number;
  search?: string | null;
  category?: string | null;
}) => {
  useState<PixabayResponse | null>(null);
  return useQuery({
    queryKey: ['elements', 'backgrounds', page, search, category],
    queryFn: async () => {
      const startTime = Date.now();
      const res = await fetch(
        `https://pixabay.com/api/?key=${import.meta.env.VITE_PIXABAY_API_KEY}&category=${category}&image_type=photo&page=${page}&per_page=20${
          search ? `&q=${search}` : ''
        }`,
      )
        .then(async (res) => {
          const data: PixabayResponse = await res.json();
          return {
            ...data,
            page,
            search,
            xRateLimitReset: Number(res.headers.get('x-ratelimit-limit')),
            xRateLimitRemaining: Number(
              res.headers.get('x-ratelimit-remaining'),
            ),
            xRateLimitLimit: Number(res.headers.get('x-ratelimit-reset')),
          };
        })
        .then(async (res) => {
          const endTime = Date.now();
          if (endTime - startTime <= 1000) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 - (endTime - startTime)),
            );
          }
          return res;
        });
      return res;
    },
  });
};

export const SidebarImages = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<string | null>(CATEGORY.BACKGROUNDS);
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
    setSearch(null);
  };

  const {
    data: _pixabayBackgrounds,
    isLoading: isLoadingPixabayBackgrounds,
    error,
    refetch,
  } = usePixabayBackgrounds({ page, search, category });
  const [pixabayBackgrounds, setPixabayBackgrounds] =
    useState<PixabayResponse | null>(null);
  useEffect(() => {
    if (!_pixabayBackgrounds) return;

    setPixabayBackgrounds((prev) =>
      _pixabayBackgrounds.page === 1
        ? _pixabayBackgrounds
        : {
            ..._pixabayBackgrounds,
            hits: [...(prev?.hits || []), ...(_pixabayBackgrounds?.hits || [])],
          },
    );
  }, [_pixabayBackgrounds]);

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const handleSearch = () => {
    if (searchValue === search && page === 1) {
      refetch();
    } else {
      setSearch(searchValue);
      setPage(1);
    }
  };

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoadingPixabayBackgrounds) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoadingPixabayBackgrounds],
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

  const [isImageLoading, setIsImageLoading] = useState<number[]>([]);
  const handleAdd2Canvas = async (image: PixabayResponse['hits'][number]) => {
    debug('[handleAdd2Canvas]', image);

    setIsImageLoading((prev) => [...prev, image.id]);
    await fetch(image.largeImageURL).catch(() => null); // TODO: 处理图片加载失败 & 链接过期或失效时
    setIsImageLoading((prev) => prev.filter((id) => id !== image.id));

    const asBackground = category === CATEGORY.BACKGROUNDS;
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

  // Handle rate limit error
  if (error) {
    const resetTime = pixabayBackgrounds?.xRateLimitReset || 0;
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
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">
      <h3 className="text-lg font-bold pb-1">Images</h3>
      <p className="text-sm text-gray-500 pb-2">
        Click to add image to canvas as background.
      </p>

      {/* Category Selector */}
      <div className="w-full flex flex-row items-center gap-2">
        <select
          className="select select-bordered select-sm h-10 w-full"
          onChange={handleCategoryChange}
        >
          <option value={CATEGORY.BACKGROUNDS}>Backgrounds</option>
          <option value={CATEGORY.FASHION}>Fashion</option>
          <option value={CATEGORY.NATURE}>Nature</option>
          <option value={CATEGORY.SCIENCE}>Science</option>
          <option value={CATEGORY.EDUCATION}>Education</option>
          <option value={CATEGORY.FEELINGS}>Feelings</option>
          <option value={CATEGORY.HEALTH}>Health</option>
          <option value={CATEGORY.PEOPLE}>People</option>
          <option value={CATEGORY.RELIGION}>Religion</option>
          <option value={CATEGORY.PLACES}>Places</option>
          <option value={CATEGORY.ANIMALS}>Animals</option>
          <option value={CATEGORY.INDUSTRIES}>Industry</option>
          <option value={CATEGORY.COMPUTER}>Computer</option>
          <option value={CATEGORY.FOOD}>Food</option>
          <option value={CATEGORY.SPORTS}>Sports</option>
          <option value={CATEGORY.TRANSPORTATION}>Transportation</option>
          <option value={CATEGORY.TRAVEL}>Travel</option>
          <option value={CATEGORY.BUILDINGS}>Buildings</option>
          <option value={CATEGORY.BUSINESS}>Business</option>
          <option value={CATEGORY.MUSIC}>Music</option>
        </select>
      </div>

      {/* Search Input */}
      <div className="w-full mb-4 flex flex-row items-center gap-2">
        <input
          type="text"
          placeholder="Search images..."
          className="input input-bordered w-full"
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={isLoadingPixabayBackgrounds}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSearch()}
          disabled={isLoadingPixabayBackgrounds}
        >
          {isLoadingPixabayBackgrounds ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 gap-4">
        {pixabayBackgrounds?.hits.map((image) => (
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
              <div className="absolute bottom-0 left-0 w-full p-2 text-xs opacity-70 bg-base-100/50 hover:bg-base-100/80 transition-all cursor-auto">
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

              {isImageLoading.includes(image.id) && (
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
        {isLoadingPixabayBackgrounds && (
          <span className="loading loading-spinner loading-md"></span>
        )}
      </div>

      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-4" />
    </div>
  );
};

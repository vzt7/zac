import { useQuery } from '@tanstack/react-query';

export interface PixabayResponse {
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

export enum PIXABAY_CATEGORY {
  ALL = '',
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

export enum PIXABAY_IMAGE_TYPE {
  ALL = 'all',
  PHOTO = 'photo',
  ILLUSTRATION = 'illustration',
  VECTOR = 'vector',
}

export enum PIXABAY_COLORS {
  ALL = '',
  GRAYSCALE = 'grayscale',
  TRANSPARENT = 'transparent',
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  TURQUOISE = 'turquoise',
  BLUE = 'blue',
  LILAC = 'lilac',
  PINK = 'pink',
  WHITE = 'white',
  GRAY = 'gray',
  BLACK = 'black',
  BROWN = 'brown',
}

export const createPixabayRequestUrl = (args: {
  page: number;
  search?: string | null;
  category?: PIXABAY_CATEGORY | null;
  image_type?: string | null;
  orientation?: string | null;
  safesearch?: boolean;
  order?: string | null;
  lang?: string | null;
  min_width?: number;
  min_height?: number;
  max_width?: number;
  max_height?: number;
  colors?: PIXABAY_COLORS | null;
  editors_choice?: boolean;
}) => {
  const baseUrl = 'https://pixabay.com/api/';
  const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
  const params = new URLSearchParams({
    key: apiKey,
    page: args.page.toString(),
    per_page: '50',
    ...(args.category && { category: args.category }),
    ...(args.image_type && { image_type: args.image_type }),
    ...(args.orientation && { orientation: args.orientation }),
    ...(args.safesearch && {
      safesearch: args.safesearch ? 'true' : 'false',
    }),
    ...(args.order && { order: args.order }),
    ...(args.lang && { lang: args.lang }),
    ...(args.min_width && { min_width: args.min_width.toString() }),
    ...(args.min_height && { min_height: args.min_height.toString() }),
    ...(args.max_width && { max_width: args.max_width.toString() }),
    ...(args.max_height && { max_height: args.max_height.toString() }),
    ...(args.colors && { colors: args.colors }),
    ...(args.editors_choice && {
      editors_choice: args.editors_choice ? 'true' : 'false',
    }),
  });

  if (args.search) {
    params.append('q', args.search);
  }

  return {
    url: `${baseUrl}?${params.toString()}`,
    args,
  };
};

export const usePixabayApi = (
  requestUrl: ReturnType<typeof createPixabayRequestUrl>,
) => {
  return useQuery({
    queryKey: ['elements', requestUrl.url],
    queryFn: async () => {
      const startTime = Date.now();
      const res = await fetch(requestUrl.url)
        .then(async (res) => {
          const data: PixabayResponse = await res.json();
          return {
            ...data,
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
      return { ...res, args: requestUrl.args };
    },
  });
};

import fontsIndex from '@/assets/fonts.json';

export interface FontItem {
  name: string;
  value: string;
  description?: string;
  preview: string;
  urls: string[];
  isUsed?: boolean;
  isLoaded?: boolean;
  isLoaded4Preview?: boolean;
  fontFace?: FontFace;
}

// TODO: 更多字体
export const DEFAULT_FONTS: FontItem[] = fontsIndex.map((fontItem) => ({
  ...fontItem,
  value: fontItem.dir,
  isUsed: false,
  isLoaded: false,
}));

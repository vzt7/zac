import {
  ChevronsLeftRightEllipsis,
  MonitorSmartphone,
  Smartphone,
  Tv,
} from 'lucide-react';
import React from 'react';

import type { SafeArea } from './editor.store';

export interface ProjectCanvas {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  safeArea: SafeArea;
}

export const canvases: ProjectCanvas[] = [
  // 社交媒体封面
  {
    id: 'redbook_cover',
    name: '小红书封面',
    safeArea: {
      width: 1080,
      height: 1440,
      x: 0,
      y: 0,
    },
    icon: <Smartphone size={24} />,
    category: '社交媒体',
  },
  {
    id: 'tiktok_cover',
    name: 'TikTok 封面',
    safeArea: {
      width: 1080,
      height: 1920,
      x: 0,
      y: 0,
    },
    icon: <Smartphone size={24} />,
    category: '社交媒体',
  },
  {
    id: 'wechat_cover',
    name: '微信公众号封面',
    safeArea: {
      width: 900,
      height: 383,
      x: 0,
      y: 0,
    },
    icon: <Smartphone size={24} />,
    category: '社交媒体',
  },
  // 营销物料
  {
    id: 'a4_poster',
    name: 'A4海报',
    safeArea: {
      width: 2480,
      height: 3508,
      x: 0,
      y: 0,
    },
    icon: <MonitorSmartphone size={24} />,
    category: '营销物料',
  },
  {
    id: 'square_ad',
    name: '方形广告',
    safeArea: {
      width: 1080,
      height: 1080,
      x: 0,
      y: 0,
    },
    icon: <Tv size={24} />,
    category: '营销物料',
  },
  {
    id: 'banner_ad',
    name: '横幅广告',
    safeArea: {
      width: 1600,
      height: 500,
      x: 0,
      y: 0,
    },
    icon: <MonitorSmartphone size={24} />,
    category: '营销物料',
  },
  {
    id: 'custom',
    name: '自定义',
    safeArea: {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    },
    icon: <ChevronsLeftRightEllipsis size={24} />,
    category: '自定义',
  },
];

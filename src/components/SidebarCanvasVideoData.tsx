import {
  SiAmazon,
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { ChevronsLeftRightEllipsis } from 'lucide-react';

import type { ProjectCanvas } from './editor.store';

export const canvases: (ProjectCanvas & { icon: React.ReactNode })[] = [
  {
    id: 'custom',
    category: '',
    name: 'Custom',
    type: 'canvas_animation',
    safeArea: {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    },
    icon: <ChevronsLeftRightEllipsis size={24} />,
  },
  {
    id: 'youtube_channel_cover',
    category: 'Youtube',
    name: 'Youtube Channel Cover',
    type: 'canvas_animation',
    safeArea: {
      width: 2560,
      height: 1440,
      x: 0,
      y: 0,
    },
    icon: <SiYoutube size={24} />,
  },
  {
    id: 'youtube_video_thumbnail',
    category: 'Youtube',
    name: 'Youtube Video Thumbnail',
    type: 'canvas_animation',
    safeArea: {
      width: 1280,
      height: 720,
      x: 0,
      y: 0,
    },
    icon: <SiYoutube size={24} />,
  },
  {
    id: 'x_profile_photo',
    category: 'X / Twitter',
    name: 'X Profile Photo',
    type: 'canvas_animation',
    safeArea: {
      width: 400,
      height: 400,
      x: 0,
      y: 0,
    },
    icon: <SiX size={24} />,
  },
  {
    id: 'x_post_landscape',
    category: 'X / Twitter',
    name: 'X Post Landscape',
    type: 'canvas_animation',
    safeArea: {
      width: 1600,
      height: 1600,
      x: 0,
      y: 0,
    },
    icon: <SiX size={24} />,
  },
  {
    id: 'amazon_product_image',
    category: 'Amazon',
    name: 'Amazon Product Image',
    type: 'canvas_animation',
    safeArea: {
      width: 2000,
      height: 2000,
      x: 0,
      y: 0,
    },
    icon: <SiAmazon size={24} />,
  },
  {
    id: 'instagram_cover_square',
    category: 'Instagram',
    name: 'Instagram Post (Square)',
    type: 'canvas_animation',
    safeArea: {
      width: 1080,
      height: 1080,
      x: 0,
      y: 0,
    },
    icon: <SiInstagram size={24} />,
  },
  {
    id: 'instagram_cover_portrait',
    category: 'Instagram',
    name: 'Instagram Post (Portrait)',
    type: 'canvas_animation',
    safeArea: {
      width: 1080,
      height: 1350,
      x: 0,
      y: 0,
    },
    icon: <SiInstagram size={24} />,
  },
  {
    id: 'facebook_post_square',
    category: 'Facebook',
    name: 'Facebook Post (Square)',
    type: 'canvas_animation',
    safeArea: {
      width: 1200,
      height: 1200,
      x: 0,
      y: 0,
    },
    icon: <SiFacebook size={24} />,
  },
  {
    id: 'facebook_cover',
    category: 'Facebook',
    name: 'Facebook Cover',
    type: 'canvas_animation',
    safeArea: {
      width: 820,
      height: 312,
      x: 0,
      y: 0,
    },
    icon: <SiFacebook size={24} />,
  },
];

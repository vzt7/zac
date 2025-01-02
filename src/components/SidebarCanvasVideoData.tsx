// import {
//   SiAmazon,
//   SiFacebook,
//   SiInstagram,
//   SiX,
//   SiYoutube,
// } from '@icons-pack/react-simple-icons';
// import { ChevronsLeftRightEllipsis, Clapperboard } from 'lucide-react';
import { canvases as imageCanvases } from './SidebarCanvasDefaultData';
import type { ProjectCanvas } from './editor.store';

export const canvases: (ProjectCanvas & { icon: React.ReactNode })[] =
  imageCanvases.map((item) => ({ ...item, type: 'canvas_animation' }));

// export const canvases: (ProjectCanvas & { icon: React.ReactNode })[] = [
//   {
//     id: 'custom',
//     category: '',
//     name: 'Custom',
//     type: 'canvas_animation',
//     safeArea: {
//       width: 0,
//       height: 0,
//       x: 0,
//       y: 0,
//     },
//     icon: <ChevronsLeftRightEllipsis size={24} />,
//   },
//   {
//     id: 'recommend_tiny_square',
//     category: 'Recommend',
//     name: 'Tiny Square',
//     type: 'canvas_animation',
//     safeArea: {
//       width: 400,
//       height: 400,
//       x: 0,
//       y: 0,
//     },
//     icon: <Clapperboard size={24} />,
//   },
//   {
//     id: 'recommend_small_square',
//     category: 'Recommend',
//     name: 'Small Square',
//     type: 'canvas_animation',
//     safeArea: {
//       width: 640,
//       height: 640,
//       x: 0,
//       y: 0,
//     },
//     icon: <Clapperboard size={24} />,
//   },
//   {
//     id: 'recommend_normal_square',
//     category: 'Recommend',
//     name: 'Normal Square',
//     type: 'canvas_animation',
//     safeArea: {
//       width: 1024,
//       height: 1024,
//       x: 0,
//       y: 0,
//     },
//     icon: <Clapperboard size={24} />,
//   },
// ];

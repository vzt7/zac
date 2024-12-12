import { useEffect, useState } from 'react';

import { handleAddShape } from './editor.handler';
import { Shape } from './editor.store';
import { useHeaderStore } from './header.store';

// 定义模板接口
interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  elements: Shape[];
}

// 示例模板数据
const templates: Template[] = [
  {
    id: 'template-1',
    name: '小红书封面模板 1',
    thumbnail: '/templates/redbook-1.jpg',
    category: '小红书',
    elements: [
      {
        id: 'rect-1',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        fill: '#FF4D4F',
      },
      {
        id: 'text-1',
        type: 'text',
        x: 150,
        y: 150,
        text: '示例标题',
        fontSize: 24,
        fill: '#FFFFFF',
      },
    ],
  },
  {
    id: 'template-2',
    name: 'TikTok 封面模板 1',
    thumbnail: '/templates/tiktok-1.jpg',
    category: 'TikTok',
    elements: [
      // 模板元素
    ],
  },
  {
    id: 'template-3',
    name: 'TikTok 封面模板 1',
    thumbnail: '/templates/tiktok-1.jpg',
    category: 'TikTok',
    elements: [
      {
        id: 'image-1733927397263',
        type: 'image',
        x: 1317.2064777327935,
        y: 270,
        width: 1080,
        height: 1080,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        src: '/src/assets/elements/bg-0.webp',
        fill: 'transparent',
        isLocked: true,
      },
      {
        id: 'image-1733927397514',
        type: 'image',
        x: 2559.230769230769,
        y: 665.9514170040486,
        width: 240,
        height: 240,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        src: "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='240'%20height='240'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='currentColor'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%20class='lucide%20lucide-chevrons-left-right-ellipsis'%3e%3cpath%20d='m18%208%204%204-4%204'/%3e%3cpath%20d='m6%208-4%204%204%204'/%3e%3cpath%20d='M8%2012h.01'/%3e%3cpath%20d='M12%2012h.01'/%3e%3cpath%20d='M16%2012h.01'/%3e%3c/svg%3e",
        fill: 'transparent',
        isLocked: false,
      },
    ],
  },
];

export const useTemplates = () => {
  return { templates };
};

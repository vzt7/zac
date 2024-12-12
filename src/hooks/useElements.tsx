import bg0 from '@/assets/elements/bg-0.webp';
import svg0 from '@/assets/elements/svg-0.svg';
import { useState } from 'react';

// 示例数据 - 实际使用时可以从props或API获取
const elements = [{ src: bg0 }, { src: svg0 }];

const backgrounds = [{ src: bg0 }];

export const useElements = () => {
  return {
    elements,
    backgrounds,
  };
};

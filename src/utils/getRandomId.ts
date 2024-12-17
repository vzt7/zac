import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

export const getRandomId = () => {
  return nanoid();
};

export const getShapeRandomId = (name: string) => {
  return `${name.toLowerCase().replace(/\s+/g, '_')}-${getRandomId()}`;
};

export default getRandomId;

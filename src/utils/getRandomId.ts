import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

const getRandomId = () => {
  return nanoid();
};

export default getRandomId;

import { useEffect, useState } from 'react';

export const getAuth = async () => {
  return {
    isAnonymous: true,
    isAuthed: true,
    isPro: false,
  };
};

export const useAuth = () => {
  const [data, setData] =
    useState<Partial<Awaited<ReturnType<typeof getAuth>>>>();

  useEffect(() => {
    getAuth().then(setData);
  }, []);

  return data || {};
};

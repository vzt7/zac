export const getAuth = async () => {
  return {
    isAnonymous: true,
    isAuthed: true,
  };
};

export const useAuth = () => {
  const isAuthed = true;

  return {
    isAnonymous: true,
    isAuthed,
  };
};

export const getAuth = async () => {
  return {
    isAuthed: true,
  };
};

export const useAuth = () => {
  const isAuthed = true;

  return {
    isAuthed,
  };
};

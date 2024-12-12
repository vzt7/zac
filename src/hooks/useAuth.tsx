export const getAuth = async () => {
  return {
    isAuthed: false,
  };
};

export const useAuth = () => {
  const isAuthed = false;

  return {
    isAuthed,
  };
};

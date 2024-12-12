import { useHeaderStore } from '@/components/header.store';
import { getAuth } from '@/hooks/useAuth';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  loader: async () => {
    const auth = await getAuth();
    if (!auth.isAuthed) {
      return redirect({
        to: '/home',
      });
    } else {
      const currentProject = useHeaderStore.getState().currentProject;
      const id = currentProject?.id;
      return redirect({
        to: id ? `/${id}` : '/_',
      });
    }
  },
});

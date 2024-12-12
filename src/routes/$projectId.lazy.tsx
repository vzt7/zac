import { useHeaderStore } from '@/components/header.store';
import { useAuth } from '@/hooks/useAuth';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const Route = createLazyFileRoute('/$projectId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthed === false) {
      navigate({
        to: '/home',
      });
    }
  }, [isAuthed, navigate]);

  const { projectId } = Route.useParams();
  const projects = useHeaderStore((state) => state.projects);
  useEffect(() => {
    const targetProject =
      projects.find((item) => item.id === projectId) || null;
    useHeaderStore.setState({
      currentProject: targetProject,
    });
  }, [projectId, projects]);

  // prevent default drag and drop behavior
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => e.preventDefault();

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const currentProject = useHeaderStore((state) => state.currentProject);

  return (
    <div className="flex flex-col h-full bg-base-100">
      <Header />
      <div
        className={`flex flex-row flex-grow bg-transparent min-h-[500px] min-w-[500px]`}
      >
        {currentProject?.id && <Sidebar />}

        <div className="divider divider-horizontal m-0 w-0"></div>

        {currentProject?.id && currentProject?.canvas?.id ? (
          <Container
            specificSafeArea={currentProject.canvas.safeArea}
            projectId={currentProject.id}
          />
        ) : (
          <div className="grid w-full h-full place-content-center px-4 bg-base-300">
            <h1 className="uppercase tracking-widest pointer-events-none">
              Waiting for initial canvas
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

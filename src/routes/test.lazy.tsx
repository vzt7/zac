import { useHeaderSettings } from '@/components/header.store';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Container } from '../components/Container';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const Route = createLazyFileRoute('/test')({
  component: RouteComponent,
});

function RouteComponent() {
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

  const currentProject = useHeaderSettings((state) => state.currentProject);

  return (
    <div className="flex flex-col h-full bg-base-100">
      <Header />
      <div
        className={`flex flex-row flex-grow bg-transparent min-h-[500px] min-w-[500px]`}
      >
        <Sidebar />

        <div className="divider divider-horizontal m-0 w-0"></div>

        {currentProject?.id && currentProject?.canvas?.id ? (
          <Container
            specificSafeArea={currentProject.canvas.safeArea}
            projectId={currentProject.id}
          />
        ) : (
          <div className="grid w-full h-full place-content-center px-4 bg-base-300">
            <h1 className="uppercase tracking-widest pointer-events-none">
              等待创建初始画布 | Waiting for initial canvas
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

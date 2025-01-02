import { Container } from '@/components/Container';
import { useHeaderStore } from '@/components/header.store';
import { SIDEBAR_TABS, useSidebarStore } from '@/components/sidebar.store';
import { useAuth } from '@/hooks/useAuth';
import { useProjectPageStore } from '@/store/projectPage';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const Route = createLazyFileRoute('/$projectId')({
  component: RouteComponent,
});

function RouteComponent() {
  // Read projectId from route params
  const navigate = useNavigate();
  const { projectId } = Route.useParams();
  const [isProjectReady, setIsProjectReady] = useState(false);
  useEffect(() => {
    setIsProjectReady(false);
  }, [projectId]);

  useEffect(() => {
    const projects = useHeaderStore.getState().projects;
    if (!projectId || projectId === '_') {
      const targetProject = projects.sort((a, b) =>
        dayjs(a.updatedAt).isAfter(b.updatedAt) ? -1 : 1,
      )[0];
      if (targetProject) {
        navigate({
          to: '/$projectId',
          params: {
            projectId: targetProject?.id || '_',
          },
          replace: true,
        });
      }
    } else {
      const targetProject =
        projects.find((item) => item.id === projectId) || null;

      useHeaderStore.setState({
        currentProject: targetProject,
      });
    }
    setIsProjectReady(true);
  }, [navigate, projectId]);

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
  const fonts = useSidebarStore((state) => state.fonts);
  const customFonts = useSidebarStore((state) => state.customFonts);
  const isFontsReady = [...fonts, ...customFonts].every((font) =>
    font.isUsed ? font.isLoaded : true,
  );
  const isCanvasReady = Boolean(
    currentProject?.id && currentProject?.canvas?.id,
  );
  useEffect(() => {
    useProjectPageStore.setState({
      isProjectReady: isProjectReady && isCanvasReady && isFontsReady,
      isCanvasReady: isCanvasReady,
      isFontsReady: isFontsReady,
    });
    if (!isFontsReady) {
      useSidebarStore.setState({
        currentTab: SIDEBAR_TABS.FONT,
      });
    }
  }, [isProjectReady, isCanvasReady, isFontsReady]);

  return (
    <div className="flex flex-col h-full bg-base-100">
      <Header />
      <div
        className={`flex flex-row flex-grow bg-transparent min-h-[500px] min-w-[500px]`}
      >
        {currentProject?.id && <Sidebar />}

        <div className="divider divider-horizontal m-0 w-0"></div>

        {isProjectReady && isCanvasReady && isFontsReady ? (
          <Container />
        ) : (
          <div className="grid w-full h-full min-w-[500px] place-content-center px-4 bg-base-300 text-center">
            <h1 className="uppercase tracking-widest pointer-events-none text-2xl">
              {!isCanvasReady
                ? 'Waiting for initial canvas'
                : !isFontsReady
                  ? 'Waiting for fonts'
                  : ''}
            </h1>
            {!isFontsReady && (
              <p className="text-gray-500">
                Please upload the fonts on the Fonts tab.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

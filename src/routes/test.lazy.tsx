import { ContainerTemplate } from '@/components/ContainerTemplate';
import { EditorStore } from '@/components/editor.store';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import { Container } from '../components/Container';
import { HEADER_HEIGHT, Header } from '../components/Header';
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

  const [currentSafeArea, setCurrentSafeArea] = useState<
    EditorStore['safeArea'] | null
  >(null);

  return (
    <div className="flex flex-col h-full bg-base-100">
      <Header />
      <div
        className={`flex flex-row flex-grow bg-transparent min-h-[500px] min-w-[500px]`}
      >
        <Sidebar />
        {currentSafeArea ? (
          <Container specificSafeArea={currentSafeArea} />
        ) : (
          <ContainerTemplate onSelect={setCurrentSafeArea} />
        )}
      </div>
    </div>
  );
}

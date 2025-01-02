import { Check, CloudUpload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { handleSave } from '../editor.handler';
import { useEditorStore } from '../editor.store';
import { useHeaderStore } from '../header.store';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'done';

const AUTO_SAVE_INTERVAL = 1000 * 10;

export const AutoSaveIndicator = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  useEffect(() => {
    lastSavedRef.current = lastSaved;
  }, [lastSaved]);
  const lastSavedRef = useRef<Date | null>(null);

  const currentProject = useHeaderStore((state) => state.currentProject);
  const currentProjectId = currentProject?.id;

  useEffect(() => {
    if (!currentProjectId) {
      return;
    }

    const autoSave = () => {
      if (
        lastSavedRef.current &&
        Date.now() - lastSavedRef.current.getTime() < AUTO_SAVE_INTERVAL / 2
      ) {
        return;
      }
      const projectId = useEditorStore.getState().projectId;
      if (projectId !== currentProjectId) {
        return;
      }
      saveContent(currentProjectId);
    };

    const intervalId = setInterval(autoSave, AUTO_SAVE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [currentProjectId]);

  const timerId = useRef<NodeJS.Timeout | null>(null);
  const saveContent = async (currentProjectId: string) => {
    setSaveStatus('pending');

    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveStatus('saving');
      await handleSave(currentProjectId);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLastSaved(new Date());
      setSaveStatus('done');

      timerId.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('idle');
    }
  };

  return (
    <button
      title="Automatically save every 10 seconds"
      className="btn btn-sm text-sm h-10 shadow-md bg-base-200/40 !border-base-200/40"
      onClick={() => currentProjectId && saveContent(currentProjectId)}
    >
      <div className="flex items-center gap-2">
        {saveStatus === 'idle' && (
          <>
            <CloudUpload size={18} />
            <span>
              {lastSaved
                ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                : 'Saved'}
            </span>
          </>
        )}
        {saveStatus === 'pending' && (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            <span>Preparing to save...</span>
          </>
        )}
        {saveStatus === 'saving' && (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            <span>Saving...</span>
          </>
        )}
        {saveStatus === 'done' && (
          <>
            <Check size={18} />
            <span>Save successful</span>
          </>
        )}
      </div>
    </button>
  );
};

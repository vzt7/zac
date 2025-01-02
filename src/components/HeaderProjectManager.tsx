import getRandomId from '@/utils/getRandomId';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { Box, Check, Edit, Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { getCacheKey } from './editor.handler';
import { Project, useHeaderStore } from './header.store';

export const HeaderProjectManager = () => {
  const currentProject = useHeaderStore((state) => state.currentProject);
  const projects = useHeaderStore((state) => state.projects);
  const disabledProjectManager = useHeaderStore(
    (state) => state.disabledProjectManager,
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const modalRef = useRef<HTMLDialogElement>(null);
  const handleOpenModal = () => {
    modalRef.current?.showModal();
  };

  const handleCreateProject = () => {
    const { createProject } = useHeaderStore.getState();
    createProject({
      id: getRandomId(),
      name: 'Untitled Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStartEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (project: Project) => {
    if (editName.trim()) {
      const { changeProject } = useHeaderStore.getState();
      changeProject({
        ...project,
        name: editName,
      });
    }
    setEditingId(null);
  };

  const handleDelete = (project: Project) => {
    if (confirm('Permanently delete this project?')) {
      const newProjects = projects.filter((p) => p.id !== project.id);
      useHeaderStore.setState({ projects: newProjects });

      if (currentProject?.id === project.id) {
        useHeaderStore.getState().selectProject(null);
      }

      localStorage.removeItem(getCacheKey(project.id));
    }
  };

  const navigate = useNavigate();
  const handleSelectProject = (project: Project) => {
    modalRef.current?.close();
    navigate({
      to: '/$projectId',
      params: {
        projectId: project.id,
      },
    });
  };

  const isMaxProjects = projects.length >= 1;

  useEffect(() => {
    if (projects.length <= 0) {
      handleOpenModal();
    }
  }, []);

  return (
    <div className="flex flex-row items-center gap-2">
      <button
        className={clsx(
          'btn btn-ghost btn-sm h-10 px-4 text-base',
          !currentProject && 'opacity-60',
        )}
        onClick={handleOpenModal}
        disabled={disabledProjectManager}
      >
        <Box size={16} />
        {currentProject ? (
          <>
            <span>{currentProject.name}</span>
            <span className="badge badge-accent">current</span>
          </>
        ) : (
          <span>Waiting for project</span>
        )}
      </button>
      <dialog className="modal" ref={modalRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">My projects</h3>
          <div className="py-4">
            <button
              className="btn btn-primary w-full gap-2 my-4"
              onClick={handleCreateProject}
              disabled={isMaxProjects}
            >
              <Plus size={16} />
              {isMaxProjects ? 'Max projects reached' : 'Create Project'}
            </button>
            {projects.map((project) => (
              <div
                key={project.id}
                className={`flex flex-row items-center justify-between p-3 mb-2 rounded-lg border-2 border-base-300 hover:border-primary/80 cursor-pointer transition-all ${currentProject?.id === project.id ? 'bg-base-200 border-primary/60' : ''}`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex flex-col">
                  {editingId === project.id ? (
                    <input
                      type="text"
                      className="input input-bordered"
                      value={editName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        setEditName(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') handleSaveEdit(project);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={(e) => {
                        e.stopPropagation();
                        handleSaveEdit(project);
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="font-medium">
                        <span className="text-lg">{project.name}</span>
                        {currentProject?.id === project.id && (
                          <span className="badge badge-accent ml-2">
                            current
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-base-content/60">
                        Last saved:{' '}
                        {dayjs(project.updatedAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {editingId === project.id ? (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Check size={18} strokeWidth={2} />
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleStartEdit(project)}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(project)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

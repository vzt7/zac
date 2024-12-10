import dayjs from 'dayjs';
import { Box, Check, Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Project, useHeaderSettings } from './header.store';

export const HeaderProjectManager = () => {
  const currentProject = useHeaderSettings((state) => state.currentProject);
  const projects = useHeaderSettings((state) => state.projects);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const modalRef = useRef<HTMLDialogElement>(null);
  const handleOpenModal = () => {
    modalRef.current?.showModal();
  };

  const handleCreateProject = () => {
    const { createProject } = useHeaderSettings.getState();
    const newProject: Project = {
      id: uuidv4(),
      name: 'New Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createProject(newProject);
  };

  const handleStartEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (project: Project) => {
    if (editName.trim()) {
      const { changeProject } = useHeaderSettings.getState();
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
      useHeaderSettings.setState({ projects: newProjects });
      localStorage.setItem('projects', JSON.stringify(newProjects));

      if (currentProject?.id === project.id) {
        useHeaderSettings.getState().changeCurrentProject(null);
      }
    }
  };

  const handleSelectProject = (project: Project) => {
    useHeaderSettings.getState().changeCurrentProject(project);
    modalRef.current?.close();
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <button
        className="btn btn-ghost btn-sm h-10 px-4 text-base"
        onClick={handleOpenModal}
      >
        <Box size={16} />
        <span>{currentProject?.name || '新项目'}</span>
        <span className="badge badge-accent">current</span>
        <Edit2 size={16} />
      </button>
      <dialog className="modal" ref={modalRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">My projects</h3>
          <div className="py-4">
            <button
              className="btn btn-primary w-full gap-2 my-4"
              onClick={handleCreateProject}
            >
              <Plus size={16} />
              Create Project
            </button>
            {projects.map((project) => (
              <div
                key={project.id}
                className={`flex flex-row items-center justify-between p-3 mb-2 rounded-lg border-2 hover:border-primary/20 cursor-pointer transition-all ${currentProject?.id === project.id ? 'bg-base-200 border-primary/30' : ''}`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex flex-col">
                  {editingId === project.id ? (
                    <input
                      type="text"
                      className="input input-sm input-bordered"
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
                        <Box className="inline-block mr-2" size={14} />
                        {project.name}
                        {currentProject?.id === project.id && (
                          <span className="badge badge-accent ml-2">
                            current
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-base-content/60">
                        Last update:{' '}
                        {dayjs(project.updatedAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {editingId === project.id ? (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleSaveEdit(project)}
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

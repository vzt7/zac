import logoUrl from '@/assets/logo.png';
import { Languages, Moon, Plus, Projector, Sun } from 'lucide-react';
import { forwardRef } from 'react';

import { HeaderProjectManager } from './HeaderProjectManager';
import { Project, useHeaderSettings } from './header.store';

export const HEADER_HEIGHT = 66;

export const Header = forwardRef<HTMLDivElement, any>((props, ref) => {
  const toggleLang = useHeaderSettings((state) => state.toggleLang);
  const toggleTheme = useHeaderSettings((state) => state.toggleTheme);

  const projects = useHeaderSettings((state) => state.projects);
  const currentProject = useHeaderSettings((state) => state.currentProject);

  const handleAddProject = () => {
    const { createProject } = useHeaderSettings.getState();
    const newProject: Project = {
      id: '1',
      name: 'New Project',
      description: 'New Project Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createProject(newProject);
  };

  return (
    <header
      ref={ref}
      className="box-border border-b-2 border-base-300 shadow-lg"
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-row items-center gap-12">
            <a className="flex flex-row items-center text-[#7b41f3]" href="#">
              <span className="sr-only">Home</span>
              <img src={logoUrl} alt="logo" className="h-12" />
              <span className="text-2xl font-bold">Poster Master</span>
            </a>

            <HeaderProjectManager />
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <label className="swap text-9xl">
              {/* this hidden checkbox controls the state */}
              <input type="checkbox" onChange={toggleLang} />
              <div className="swap-on flex flex-row items-center gap-2">
                <Languages size={22} />
                <span className="text-lg tracking-wider">English</span>
              </div>
              <div className="swap-off flex flex-row items-center gap-2">
                <Languages size={22} />
                <span className="text-base">简体中文</span>
              </div>
            </label>

            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
              <input type="checkbox" onChange={toggleTheme} />
              <div className="swap-on flex flex-row items-center gap-2">
                <Sun size={22} />
              </div>
              <div className="swap-off flex flex-row items-center gap-2">
                <Moon size={22} />
              </div>
            </label>

            <div className="dropdown dropdown-end z-[999]">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

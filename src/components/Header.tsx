import logoUrl from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { Link, useMatch, useRouterState } from '@tanstack/react-router';
import i18n from 'i18next';
import {
  CircleUser,
  Gem,
  Languages,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { HeaderProfile } from './HeaderProfile';
import { HeaderProjectManager } from './HeaderProjectManager';
import { useHeaderStore } from './header.store';

export const HEADER_HEIGHT = 66;

export const HeaderLogo = () => {
  return (
    <a className="flex flex-row items-center text-[#7b41f3]" href="/">
      <span className="sr-only">Home</span>
      <img src={logoUrl} alt="logo" className="h-12" />
      <span className="text-2xl font-bold">
        {import.meta.env.VITE_APP_NAME}
      </span>
    </a>
  );
};

export const Header = forwardRef<
  HTMLDivElement,
  { className?: string; toolbar?: { language?: boolean; theme?: boolean } }
>(({ className, toolbar }, ref) => {
  const toggleLang = useHeaderStore((state) => state.toggleLang);
  const lang = useHeaderStore((state) => state.lang);
  const [isLangInitialized, setIsLangInitialized] = useState(false);
  useEffect(() => {
    i18n.on('initialized', () => {
      setIsLangInitialized(true);
    });
  }, []);
  useEffect(() => {
    if (lang && isLangInitialized) {
      i18n.changeLanguage(lang);
    }
  }, [lang, isLangInitialized]);

  const toggleTheme = useHeaderStore((state) => state.toggleTheme);
  const theme = useHeaderStore((state) => state.theme);
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { isAuthed, isAnonymous } = useAuth();
  const matched = useMatch({
    from: '/$projectId',
    shouldThrow: false,
  });
  const isProjectPage = matched?.id !== undefined;

  const profileRef = useRef<HTMLDivElement>(null);

  return (
    <header
      ref={ref}
      className={`sticky top-0 box-border border-b-2 border-gray-200 dark:border-gray-800 ${isScrolled ? 'shadow-lg' : ''} z-50 bg-base-100 transition-all ${className}`}
      style={{ height: HEADER_HEIGHT }}
    >
      <div className="flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center gap-12">
          <HeaderLogo />

          {isProjectPage && <HeaderProjectManager />}
        </div>

        {!isProjectPage && <HeaderNav />}

        <div className="flex items-center gap-10">
          <div className="md:flex hidden flex-row items-center gap-6">
            <label
              className="swap text-9xl !hidden"
              style={{
                visibility: toolbar?.language === false ? 'hidden' : 'visible',
              }}
            >
              {/* this hidden checkbox controls the state */}
              <input type="checkbox" onChange={toggleLang} />
              <div className="swap-on flex flex-row items-center gap-2">
                <Languages size={20} />
                {lang === 'en' ? (
                  <span className="text-base">English</span>
                ) : (
                  <span className="text-sm">简体中文</span>
                )}
              </div>
              <div className="swap-off flex flex-row items-center gap-2">
                <Languages size={20} />
                {lang === 'en' ? (
                  <span className="text-base">English</span>
                ) : (
                  <span className="text-sm">简体中文</span>
                )}
              </div>
            </label>

            <label
              className="swap swap-rotate"
              style={{
                visibility: toolbar?.theme === false ? 'hidden' : 'visible',
              }}
            >
              {/* this hidden checkbox controls the state */}
              <input type="checkbox" onChange={toggleTheme} />
              <div className="swap-on flex flex-row items-center gap-2">
                {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
              </div>
              <div className="swap-off flex flex-row items-center gap-2">
                {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
              </div>
            </label>
          </div>

          {isAuthed && !isAnonymous ? (
            <div className="dropdown dropdown-end z-50">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img alt="Avatar" src="/logo.png" />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-lg dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 border border-base/5 dark:border-gray-600 shadow-lg"
              >
                <li>
                  <a
                    className="flex flex-row items-center gap-3"
                    onClick={() => profileRef.current?.click()}
                  >
                    <User size={22} />
                    <span>Profile</span>
                  </a>
                </li>
                <li>
                  <a
                    className="flex flex-row items-center gap-3"
                    onClick={() => profileRef.current?.click()}
                  >
                    <Gem size={20} />
                    Upgrade
                  </a>
                </li>
                <li>
                  <a className="flex flex-row items-center gap-3 text-red-500">
                    <LogOut size={20} />
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex flex-row items-center gap-4">
                <button
                  className="btn btn-primary btn-sm h-10 px-6 font-medium shadow animate-none"
                  onClick={() => {}}
                  disabled={true}
                >
                  Login
                </button>

                <button
                  className="btn btn-outline btn-sm h-10 px-5 font-medium text-primary animate-none hover:bg-primary hover:border-primary/80"
                  onClick={() => {}}
                  disabled={true}
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <HeaderProfile ref={profileRef} />
    </header>
  );
});

const HeaderNav = () => {
  const { matches } = useRouterState();
  const isHome = matches.some((match) => match.pathname === '/home');
  const isPricing = matches.some((match) => match.pathname === '/pricing');
  const isAbout = matches.some((match) => match.pathname === '/about');

  return (
    <div className="hidden lg:block">
      <nav aria-label="Global">
        <ul className="flex items-center gap-12 text-lg -mr-36">
          <li>
            <Link
              className={`link link-primary transition no-underline outline-none ${
                isHome ? 'font-bold' : ''
              }`}
              href="/home"
            >
              {' '}
              Home{' '}
            </Link>
          </li>
          <li>
            <Link
              className={`link link-primary transition no-underline outline-none ${
                isPricing ? 'font-bold' : ''
              }`}
              href="/pricing"
            >
              {' '}
              Pricing{' '}
            </Link>
          </li>
          <li>
            <Link
              className={`link link-primary transition no-underline outline-none ${
                isAbout ? 'font-bold' : ''
              }`}
              href="/about"
            >
              {' '}
              About{' '}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

import { Mail } from 'lucide-react';

import { HeaderLogo } from './Header';

export const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={`bg-[#181c21] ${className}`}>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-center text-teal-600">
          <HeaderLogo />
        </div>

        <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500">
          Create stunning posters and images with ease. <br /> Poster Master is
          your go-to tool for all your design needs.
        </p>

        <ul className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
          <li>
            <a
              className="text-gray-600 transition hover:text-gray-600/75"
              href="/"
            >
              Home
            </a>
          </li>

          <li>
            <a
              className="text-gray-600 transition hover:text-gray-600/75"
              href="/product"
            >
              Product
            </a>
          </li>

          <li>
            <a
              className="text-gray-600 transition hover:text-gray-600/75"
              href="/pricing"
            >
              Pricing
            </a>
          </li>

          <li>
            <a
              className="text-gray-600 transition hover:text-gray-600/75"
              href="/about"
            >
              About
            </a>
          </li>
        </ul>

        <div className="mt-12 flex justify-center items-center gap-6 md:gap-8">
          <a
            href="/"
            rel="noreferrer"
            target="_blank"
            className="text-gray-600 transition hover:text-gray-600/75"
          >
            <span className="sr-only">Twitter</span>
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>

          <a
            href="mailto:support@postermaster.com"
            rel="noreferrer"
            className="text-gray-600 transition hover:text-gray-600/75"
          >
            <span className="sr-only">mailto:support@postermaster.com</span>
            <Mail size={22} />
          </a>
        </div>

        <div className="divider h-2"></div>

        <div className="text-gray-500 flex flex-row justify-center gap-12">
          <p>© 2024 PosterMaster, All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

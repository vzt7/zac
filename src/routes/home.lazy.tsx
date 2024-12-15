import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { HomeComments } from '@/components/HomeComments';
import { HomeDemoProjects } from '@/components/HomeDemoProjects';
import { HomeEffect } from '@/components/HomeEffect';
import { HomeFaqs } from '@/components/HomeFaqs';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Zap } from 'lucide-react';

export const Route = createLazyFileRoute('/home')({
  component: RouteComponent,
});

function RouteComponent() {
  const handleGetStarted = () => {
    // TODO: 跳转到登录页面
  };

  return (
    <div data-theme="dark">
      <Header
        className="backdrop-blur-md bg-opacity-50 border-gray-400/20"
        toolbar={{ language: false, theme: false }}
      />

      <HomeEffect />

      <div className="relative z-10 flex flex-col gap-12">
        <section className="mx-auto px-4 flex h-[66vh] lg:min-h-[800px] sm:min-h-[500px] items-center overflow-hidden">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
              Create Stunning
              <span className="block pb-2"> Posters and Images. </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg sm:text-xl text-gray-200">
              Unleash your creativity with our easy-to-use design tool. Perfect
              for marketers, social media managers, and design enthusiasts.
            </p>

            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <button
                className="btn w-full rounded-lg border border-blue-600 bg-blue-700 px-12 py-4 font-medium hover:bg-blue-600 hover:text-white text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto transition-all"
                onClick={handleGetStarted}
              >
                <Zap size={16} />
                <span className="font-bold">Get Started for Free</span>
              </button>
              <a
                className="link link-primary border-2 border-transparent hover:border-primary/40 px-4 py-2 rounded-lg no-underline transition-all font-bold"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({
                    top: document
                      .querySelector('#demos')!
                      .getBoundingClientRect().top,
                    behavior: 'smooth',
                  });
                }}
              >
                See Demos
              </a>
            </div>
          </div>
        </section>

        <div className="bg-base-300/60 backdrop-blur-md py-24 lg:py-0">
          <section className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
                <img
                  src="/logo.png"
                  width={500}
                  height={500}
                  className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-lg"
                />
              </div>

              <div className="lg:py-24">
                <h2 className="text-4xl font-bold text-gray-300">
                  Boost Your Creative Output
                </h2>

                <p className="mt-4 text-gray-400">
                  With Poster Master, you can create professional-looking
                  designs in minutes. Our intuitive interface and vast library
                  of templates make it easy for anyone to produce stunning
                  visuals.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="py-24" id="demos">
          <HomeDemoProjects />
        </div>

        <div className="bg-base-300/60 backdrop-blur-md py-24 lg:py-0">
          <section className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-first lg:h-full">
                <img
                  src="/logo.png"
                  width={500}
                  height={500}
                  className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-lg"
                />
              </div>

              <div className="lg:py-24">
                <h2 className="text-4xl font-bold text-gray-300">
                  Boost Your Creative Output
                </h2>

                <p className="mt-4 text-gray-400">
                  With Poster Master, you can create professional-looking
                  designs in minutes. Our intuitive interface and vast library
                  of templates make it easy for anyone to produce stunning
                  visuals.
                </p>

                <button
                  className="btn mt-8 inline-block rounded-lg bg-blue-700 px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
                  onClick={handleGetStarted}
                >
                  Get Started Right Now
                </button>
              </div>
            </div>
          </section>
        </div>

        <HomeComments />

        <div className="pb-32">
          <HomeFaqs />
        </div>

        <div className="relative backdrop-blur-md">
          <Footer className="!bg-base-300/90" />
        </div>
      </div>
    </div>
  );
}

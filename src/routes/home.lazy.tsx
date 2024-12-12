import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { createLazyFileRoute } from '@tanstack/react-router';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { ComponentProps, useEffect, useState } from 'react';
import { loadFull } from 'tsparticles';

export const Route = createLazyFileRoute('/home')({
  component: RouteComponent,
});

function RouteComponent() {
  const handleGetStarted = () => {
    // TODO: 跳转到登录页面
  };

  return (
    <div className="bg-base-200" data-theme="dark">
      <Header
        className="backdrop-blur-md bg-opacity-50 border-gray-400/20"
        toolbar={{ language: false, theme: false }}
      />

      <ParticlesComponent />

      <section className="relative mx-auto px-4 py-32 flex h-screen items-center overflow-hidden z-10">
        <div className="mx-auto max-w-3xl text-center relative z-[11]">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
            Create Stunning
            <span className="block pb-2"> Posters and Images. </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg sm:text-xl text-gray-200">
            Unleash your creativity with our easy-to-use design tool. Perfect
            for marketers, social media managers, and design enthusiasts.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              className="btn w-full rounded-lg border border-blue-600 bg-blue-700 px-12 py-4 font-medium hover:bg-blue-600 hover:text-white text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto transition-all"
              onClick={handleGetStarted}
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
            <img
              alt="Party"
              src="/placeholder.svg"
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
              With Poster Master, you can create professional-looking designs in
              minutes. Our intuitive interface and vast library of templates
              make it easy for anyone to produce stunning visuals.
            </p>

            <button
              className="btn mt-8 inline-block rounded-lg bg-blue-700 px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
              onClick={handleGetStarted}
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

const ParticlesComponent = () => {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      await loadFull(engine);
      // await loadSlim(engine);
      // await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      {init && (
        <Particles
          id="tsparticles"
          options={particlesJson}
          className="w-full h-[100vh]"
        />
      )}
    </div>
  );
};

const particlesJson: ComponentProps<typeof Particles>['options'] = {
  autoPlay: true,
  background: {
    color: {
      value: '#17163e',
    },
    image: '',
    position: '',
    repeat: '',
    size: '',
    opacity: 1,
  },
  backgroundMask: {
    composite: 'destination-out',
    cover: {
      opacity: 1,
      color: {
        value: '',
      },
    },
    enable: false,
  },
  clear: true,
  defaultThemes: {},
  delay: 0,
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
  detectRetina: true,
  duration: 0,
  fpsLimit: 120,
  interactivity: {
    detectsOn: 'window',
    events: {
      onClick: {
        enable: false,
        mode: [],
      },
      onDiv: {
        selectors: [],
        enable: false,
        mode: [],
        type: 'circle',
      },
      onHover: {
        enable: true,
        mode: 'light',
        parallax: {
          enable: false,
          force: 2,
          smooth: 10,
        },
      },
      resize: {
        delay: 0.5,
        enable: true,
      },
    },
    modes: {
      trail: {
        delay: 1,
        pauseOnStop: false,
        quantity: 1,
      },
      attract: {
        distance: 200,
        duration: 0.4,
        easing: 'ease-out-quad',
        factor: 1,
        maxSpeed: 50,
        speed: 1,
      },
      bounce: {
        distance: 200,
      },
      bubble: {
        distance: 200,
        duration: 0.4,
        mix: false,
        divs: {
          distance: 200,
          duration: 0.4,
          mix: false,
          selectors: [],
        },
      },
      connect: {
        distance: 80,
        links: {
          opacity: 0.5,
        },
        radius: 60,
      },
      grab: {
        distance: 100,
        links: {
          blink: false,
          consent: false,
          opacity: 1,
        },
      },
      push: {
        default: true,
        groups: [],
        quantity: 4,
      },
      remove: {
        quantity: 2,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
        factor: 100,
        speed: 1,
        maxSpeed: 50,
        easing: 'ease-out-quad',
        divs: {
          distance: 200,
          duration: 0.4,
          factor: 100,
          speed: 1,
          maxSpeed: 50,
          easing: 'ease-out-quad',
          selectors: [],
        },
      },
      slow: {
        factor: 3,
        radius: 200,
      },
      particle: {
        replaceCursor: false,
        pauseOnStop: false,
        stopDelay: 0,
      },
      light: {
        area: {
          gradient: {
            start: {
              value: '#3b5e98',
            },
            stop: {
              value: '#17163e',
            },
          },
          radius: 1000,
        },
        shadow: {
          color: {
            value: '#17163e',
          },
          length: 2000,
        },
      },
    },
  },
  manualParticles: [],
  particles: {
    bounce: {
      horizontal: {
        value: 1,
      },
      vertical: {
        value: 1,
      },
    },
    collisions: {
      absorb: {
        speed: 2,
      },
      bounce: {
        horizontal: {
          value: 1,
        },
        vertical: {
          value: 1,
        },
      },
      enable: false,
      maxSpeed: 50,
      mode: 'bounce',
      overlap: {
        enable: true,
        retries: 0,
      },
    },
    color: {
      value: '#ffff00',
      animation: {
        h: {
          count: 0,
          enable: true,
          speed: 20,
          decay: 0,
          delay: 0,
          sync: true,
          offset: 0,
        },
        s: {
          count: 0,
          enable: false,
          speed: 10,
          decay: 0,
          delay: 0,
          sync: true,
          offset: 0,
        },
        l: {
          count: 0,
          enable: false,
          speed: 10,
          decay: 0,
          delay: 0,
          sync: true,
          offset: 0,
        },
      },
    },
    effect: {
      close: true,
      fill: true,
      options: {},
      type: [],
    },
    groups: {},
    move: {
      angle: {
        offset: 0,
        value: 90,
      },
      attract: {
        distance: 200,
        enable: false,
        rotate: {
          x: 3000,
          y: 3000,
        },
      },
      center: {
        x: 50,
        y: 50,
        mode: 'percent',
        radius: 0,
      },
      decay: 0,
      distance: {},
      direction: 'none',
      drift: 0,
      enable: true,
      gravity: {
        acceleration: 9.81,
        enable: false,
        inverse: false,
        maxSpeed: 50,
      },
      path: {
        clamp: true,
        delay: {
          value: 0,
        },
        enable: false,
        options: {},
      },
      outModes: {
        default: 'out',
        bottom: 'out',
        left: 'out',
        right: 'out',
        top: 'out',
      },
      random: false,
      size: false,
      speed: 6,
      spin: {
        acceleration: 0,
        enable: false,
      },
      straight: false,
      trail: {
        enable: false,
        length: 10,
        fill: {},
      },
      vibrate: false,
      warp: false,
    },
    number: {
      density: {
        enable: true,
        width: 1920,
        height: 1080,
      },
      limit: {
        mode: 'delete',
        value: 0,
      },
      value: 30,
    },
    opacity: {
      value: 1,
      animation: {
        count: 0,
        enable: false,
        speed: 2,
        decay: 0,
        delay: 0,
        sync: false,
        mode: 'auto',
        startValue: 'random',
        destroy: 'none',
      },
    },
    reduceDuplicates: false,
    shadow: {
      blur: 0,
      color: {
        value: '#000',
      },
      enable: false,
      offset: {
        x: 0,
        y: 0,
      },
    },
    shape: {
      close: true,
      fill: true,
      options: {},
      type: ['circle', 'square'],
    },
    size: {
      value: {
        min: 15,
        max: 30,
      },
      animation: {
        count: 0,
        enable: false,
        speed: 5,
        decay: 0,
        delay: 0,
        sync: false,
        mode: 'auto',
        startValue: 'random',
        destroy: 'none',
      },
    },
    stroke: {
      width: 0,
    },
    zIndex: {
      value: 0,
      opacityRate: 1,
      sizeRate: 1,
      velocityRate: 1,
    },
    destroy: {
      bounds: {},
      mode: 'none',
      split: {
        count: 1,
        factor: {
          value: 3,
        },
        rate: {
          value: {
            min: 4,
            max: 9,
          },
        },
        sizeOffset: true,
        particles: {},
      },
    },
    roll: {
      darken: {
        enable: false,
        value: 0,
      },
      enable: false,
      enlighten: {
        enable: false,
        value: 0,
      },
      mode: 'vertical',
      speed: 25,
    },
    tilt: {
      value: 0,
      animation: {
        enable: false,
        speed: 0,
        decay: 0,
        sync: false,
      },
      direction: 'clockwise',
      enable: false,
    },
    twinkle: {
      lines: {
        enable: false,
        frequency: 0.05,
        opacity: 1,
      },
      particles: {
        enable: false,
        frequency: 0.05,
        opacity: 1,
      },
    },
    wobble: {
      distance: 5,
      enable: false,
      speed: {
        angle: 50,
        move: 10,
      },
    },
    life: {
      count: 0,
      delay: {
        value: 0,
        sync: false,
      },
      duration: {
        value: 0,
        sync: false,
      },
    },
    rotate: {
      value: 0,
      animation: {
        enable: true,
        speed: 5,
        decay: 0,
        sync: false,
      },
      direction: 'clockwise',
      path: false,
    },
    orbit: {
      animation: {
        count: 0,
        enable: false,
        speed: 1,
        decay: 0,
        delay: 0,
        sync: false,
      },
      enable: false,
      opacity: 1,
      rotation: {
        value: 45,
      },
      width: 1,
    },
    links: {
      blink: false,
      color: {
        value: '#fff',
      },
      consent: false,
      distance: 100,
      enable: false,
      frequency: 1,
      opacity: 1,
      shadow: {
        blur: 5,
        color: {
          value: '#000',
        },
        enable: false,
      },
      triangles: {
        enable: false,
        frequency: 1,
      },
      width: 1,
      warp: false,
    },
    repulse: {
      value: 0,
      enabled: false,
      distance: 1,
      duration: 1,
      factor: 1,
      speed: 1,
    },
  },
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  responsive: [],
  smooth: false,
  style: {},
  themes: [],
  zLayers: 100,
  emitters: [],
  motion: {
    disable: false,
    reduce: {
      factor: 4,
      value: true,
    },
  },
};

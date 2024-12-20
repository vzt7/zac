import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env,
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },
  plugins: [
    TanStackRouterVite(),
    react(),
    writeFontsIndex(),
    writeIconsIndex(),
    writeSvgsIndex(),
    writeSitemap(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          simpleIcons: ['simple-icons'],
        },
      },
    },
  },
});

function writeFontsIndex() {
  return {
    name: 'write-fonts-index',
    buildStart() {
      const rootDir = path.dirname(fileURLToPath(import.meta.url));
      const fontsDir = path.resolve(rootDir, 'public/fonts');
      const dirs = fs.readdirSync(fontsDir);
      const fonts = dirs
        .map((item) => {
          if (
            item.startsWith('.') ||
            item.startsWith('_') ||
            item.startsWith('index')
          )
            return;
          const files = fs.readdirSync(path.resolve(fontsDir, item));
          const fontFiles = files.filter(
            (file) => !file.startsWith('.') && !file.endsWith('.json'),
          );
          const fontUrls = fontFiles
            .filter((file) => !file.endsWith('.name'))
            .map((fontFile) => `/fonts/${item}/${fontFile}`);

          const config = JSON.parse(
            fs.readFileSync(
              path.resolve(fontsDir, item, 'config.json'),
              'utf-8',
            ),
          );
          return {
            name: config.name || item,
            preview: `/fonts/${item}/${config.preview}`,
            dir: item,
            files: fontFiles,
            urls: fontUrls,
          };
        })
        .filter(Boolean);

      // 将字体信息写入 fonts/index.json
      const targetPath = path.resolve(rootDir, 'src/assets/fonts.json');
      fs.writeFileSync(targetPath, JSON.stringify(fonts, null, 2), {
        flag: 'w',
      });
      console.log('[fonts] json file added:', targetPath);
    },
    watch: {
      // 监视 public/fonts 目录的变化
      include: 'public/fonts/**',
      handler: () => {
        // @ts-ignore
        this.buildStart();
      },
    },
  };
}

function writeIconsIndex() {
  return {
    name: 'write-icons-index',
    buildStart() {
      const rootDir = path.dirname(fileURLToPath(import.meta.url));
      const icons = [
        ...fs
          .readdirSync(path.resolve(rootDir, 'public/icons/filled'))
          .map((item) => {
            return {
              name: item,
              url: `/icons/filled/${item}`,
            };
          }),
        ...fs
          .readdirSync(path.resolve(rootDir, 'public/icons/outline/'))
          .map((item) => {
            return {
              name: item,
              url: `/icons/outline/${item}`,
            };
          }),
      ];
      // 将字体信息写入 icons/index.json
      const targetPath = path.resolve(rootDir, 'src/assets/icons.json');
      fs.writeFileSync(targetPath, JSON.stringify(icons, null, 2), {
        flag: 'w',
      });
      console.log('[icons] json file added:', targetPath);
    },
    watch: {
      // 监视 public/icons 目录的变化
      include: 'public/icons/**',
      handler: () => {
        // @ts-ignore
        this.buildStart();
      },
    },
  };
}

function writeSvgsIndex() {
  return {
    name: 'write-svgs-index',
    buildStart() {
      const rootDir = path.dirname(fileURLToPath(import.meta.url));
      const svgsDir = path.resolve(rootDir, 'public/svgs/');
      const dirs = fs.readdirSync(svgsDir);
      const svgs = dirs.map((item) => {
        return {
          name: item,
          url: `/svgs/${item}`,
        };
      });
      // 将字体信息写入 svgs/index.json
      const targetPath = path.resolve(rootDir, 'src/assets/svgs.json');
      fs.writeFileSync(targetPath, JSON.stringify(svgs, null, 2), {
        flag: 'w',
      });
      console.log('[svgs] json file added:', targetPath);
    },
    watch: {
      // 监视 public/svgs 目录的变化
      include: 'public/svgs/**',
      handler: () => {
        // @ts-ignore
        this.buildStart();
      },
    },
  };
}

const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://canvave.com</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://canvave.com"/>
    <xhtml:link rel="alternate" hreflang="zh" href="https://canvave.com"/>
    <lastmod>${dayjs().format('YYYY-MM-DD')}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
function writeSitemap() {
  return {
    name: 'write-sitemap',
    buildStart() {
      const rootDir = path.dirname(fileURLToPath(import.meta.url));
      const sitemapPath = path.resolve(rootDir, 'public/sitemap.xml');
      fs.writeFileSync(sitemapPath, sitemap, {
        flag: 'w',
      });
    },
  };
}

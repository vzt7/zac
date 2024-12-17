import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
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
  plugins: [TanStackRouterVite(), react(), writeFontsIndex(), writeSvgsIndex()],
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

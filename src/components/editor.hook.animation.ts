import { KonvaAnimation } from '@/utils/animation';
import { debug } from '@/utils/debug';
import { Progress } from '@/utils/progress';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

import { useEditorStore } from './editor.store';

// 添加导出功能
export const useExport = (options?: {
  onProgress?: (progress: number) => void;
}) => {
  const exportToAnimation = async (
    name: string,
    {
      pixelRatio = 1,
      fps = 30,
      format = 'gif',
    }: { pixelRatio?: number; fps?: number; format: 'gif' | 'mp4' } = {
      format: 'mp4',
    },
  ) => {
    const { safeArea, stageRef } = useEditorStore.getState();
    const stage = stageRef.current;
    if (!stage) {
      throw new Error('Stage is not ready');
    }

    const progress = new Progress(100);
    progress.onProgress((val) => options?.onProgress?.(val));

    // 创建动画时间轴
    const konvaAnimation = new KonvaAnimation();
    // 收集所有帧
    const frames: string[] = [];

    progress.setProgress(0);

    const timeline = konvaAnimation.createTimeline();
    const getFrame = () => {
      // 创建临时画布用于捕获每一帧
      const tempStage = stage.clone();
      tempStage.scale({ x: 1, y: 1 });
      tempStage.position({ x: 0, y: 0 });
      // 设置裁剪区域
      const adjustedSafeArea = {
        x: safeArea.x,
        y: safeArea.y,
        width: safeArea.width,
        height: safeArea.height,
      };
      tempStage.getLayers()[0].clip({
        x: adjustedSafeArea.x,
        y: adjustedSafeArea.y,
        width: adjustedSafeArea.width,
        height: adjustedSafeArea.height,
      });
      const frameDataUrl = tempStage.toDataURL({
        x: adjustedSafeArea.x,
        y: adjustedSafeArea.y,
        width: adjustedSafeArea.width,
        height: adjustedSafeArea.height,
        pixelRatio,
      });
      tempStage.destroy();
      frames.push(frameDataUrl);
      progress.setProgress(Math.round(60 * timeline.progress()));
    };
    await konvaAnimation.ready(timeline);
    timeline.play(0.001);
    timeline.pause();
    const len = Math.floor(timeline.duration() * fps);
    const frame = 1 / fps;
    for (let i = 0; i <= len; i += 1) {
      // why <= ? : 最后一帧也需要处理
      debug(i, '/', len, i * frame);
      timeline.seek(i * frame);
      stage.batchDraw();
      await new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
          try {
            getFrame();
            resolve(1);
          } catch (e) {
            reject(e);
          }
        });
      }).catch((e) => {
        console.error(`Get frame${i} error`, e);
        throw new Error(`Decode error on frame${i}`);
      });
    }
    konvaAnimation.stop(timeline);

    progress.setProgress(40);
    const clear = progress.tickBySetInterval({
      ms: 200,
      max: 50,
    });

    // MP4导出使用新版 FFmpeg
    const ffmpeg = new FFmpeg();
    const baseURL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm`;

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        'text/javascript',
      ),
    });

    // 添加日志输出以便调试
    ffmpeg.on('log', ({ message, type }) => {
      debug(type, message);
    });

    clear();
    progress.setProgress(50);

    for (let i = 0; i < frames.length; i++) {
      const data = frames[i].split(',')[1];
      await ffmpeg.writeFile(
        `frame${i}.png`,
        await fetchFile(`data:image/png;base64,${data}`),
      );
      progress.setProgress(50 + Math.round(20 * ((i + 1) / frames.length)));
    }

    progress.setProgress(70);

    // 创建一个包含所有帧文件的文本文件
    const fileList = frames
      .map((_, i) => [`file 'frame${i}.png'`, `duration ${1 / fps}`])
      .flat(10)
      .join('\n');

    await ffmpeg.writeFile('frames.txt', fileList);

    debug('frames', frames);

    // 添加进度回调
    ffmpeg.on('progress', (data) => {
      debug('FFmpeg Progress:', data);
      progress.setProgress(70 + Math.round(data.progress * 35));
    });

    progress.setProgress(95);
    const clear2 = progress.tickBySetInterval({
      ms: 200,
      max: 99,
    });

    const getData = async () => {
      // 根据格式导出
      if (format === 'gif') {
        // 使用 FFmpeg 的调色板生成器来优化 GIF 质量
        await ffmpeg.exec([
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          'frames.txt',
          '-vf',
          `fps=${fps},scale=trunc(iw/2)*2:trunc(ih/2)*2,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`, // 使用调色板优化
          '-loop',
          '0', // 无限循环
          '-y',
          'output.gif',
        ]);

        // 下载 GIF 文件
        const data = await ffmpeg.readFile('output.gif');
        await ffmpeg.deleteFile('output.gif');
        return data;
      } else {
        await ffmpeg.exec([
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          'frames.txt',
          // '-i',
          // 'frame%d.png',
          '-framerate',
          `${fps}`,
          '-c:v',
          'libx264',
          '-vf',
          'format=yuv420p',
          '-pix_fmt',
          'yuv420p',
          '-preset',
          'fast', // 更平衡的性能
          '-tune',
          'zerolatency', // 低延迟
          '-profile:v',
          'main', // 更高兼容性
          '-level',
          '4.0', // 适应更广设备
          '-movflags',
          '+faststart', // 快速启动优化
          // '-vsync',
          // 'vfr', // 使用可变帧率
          '-r',
          `${fps}`, // 输出帧率
          '-y', // 覆盖输出
          '-loglevel',
          import.meta.env.DEV ? 'debug' : 'error',
          '-threads',
          '1',
          'output.mp4',
        ]);

        const data = await ffmpeg.readFile('output.mp4');
        await ffmpeg.deleteFile('output.mp4');
        return data;
      }
    };
    const data = await getData();

    clear2();
    progress.setProgress(99);

    if (format === 'gif') {
      const url = URL.createObjectURL(new Blob([data], { type: 'image/gif' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'animation'}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // 下载视频文件
      const url = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || 'animation'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    // 清理临时文件
    await ffmpeg.deleteFile('frames.txt');
    for (let i = 0; i < frames.length; i++) {
      await ffmpeg.deleteFile(`frame${i}.png`);
    }

    progress.setProgress(100);
  };

  return {
    exportToAnimation,
  };
};

export class Progress {
  private _progress = 0;
  private _max = 100;

  constructor(max: number) {
    this._max = max;
  }

  get progress() {
    return this._progress;
  }

  private _onProgress?: (progress: number) => void;

  onProgress(callback: (progress: number) => void) {
    this._onProgress = callback;
  }

  setProgress(progress: number) {
    if (progress < 0) {
      this._progress = 0; // 确保进度不小于0
    } else if (progress > this._max) {
      this._progress = this._max; // 确保进度不超过最大值
    } else {
      this._progress = progress;
    }
    this._onProgress?.(this._progress);
  }

  setPercent(percent: number) {
    const nextProgress = Math.round(percent * this._max);
    this.setProgress(nextProgress);
  }

  tick({ max, onReachMax }: { max: number; onReachMax?: () => void }) {
    if (this._progress >= max) {
      onReachMax?.();
      return;
    }
    this.setProgress(this._progress + 1);
  }

  tickBySetInterval({
    ms,
    max,
    onReachMax,
  }: {
    ms: number;
    max: number;
    onReachMax?: () => void;
  }) {
    const id = setInterval(() => {
      this.tick({
        max,
        onReachMax: () => {
          clearInterval(id);
          onReachMax?.();
        },
      });
    }, ms);
    return () => clearInterval(id);
  }

  reset() {
    this.setProgress(0);
  }

  isDone() {
    return this._progress >= this._max;
  }
}

import { Home, List, Text } from 'lucide-react';
import { forwardRef } from 'react';

export const SIDEBAR_WIDTH = 101;

export const Sidebar = forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div
      ref={ref}
      className={`box-border flex-shrink-0 h-full bg-base-100 text-base-content border-r-2 border-base-300`}
      style={{
        width: SIDEBAR_WIDTH,
      }}
    >
      <div className="flex flex-col h-full">
        <button className="btn btn-ghost rounded-none">
          <Home />
        </button>
        <button className="btn btn-ghost rounded-none">
          <List />
        </button>
        <button className="btn btn-ghost rounded-none">
          <Text />
        </button>
      </div>
    </div>
  );
});

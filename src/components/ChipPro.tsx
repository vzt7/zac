import clsx from 'clsx';
import { PropsWithChildren } from 'react';

export const ChipPro = ({ className }: { className: string }) => (
  <CommonChip className={className}>
    <span>Pro</span>
  </CommonChip>
);

export const CommonChip = ({
  className,
  children,
}: PropsWithChildren<{ className: string }>) => {
  return (
    <div
      className={clsx(
        'absolute top-0 right-0 rounded-full bg-pink-600/80 text-black/80 text-sm font-semibold px-3 py-1',
        className,
      )}
    >
      {children}
    </div>
  );
};

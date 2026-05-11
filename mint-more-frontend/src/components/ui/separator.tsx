import { cn } from '@/lib/utils/cn';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = ({
  className,
  orientation = 'horizontal',
  decorative = true,
}: SeparatorProps) => (
  <div
    role={decorative ? 'none' : 'separator'}
    aria-orientation={decorative ? undefined : orientation}
    className={cn(
      'shrink-0 bg-slate-100',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
  />
);
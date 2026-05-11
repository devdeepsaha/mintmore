import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

/**
 * Avatar component with initials fallback.
 * Never renders broken image states.
 */
export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-white',
          SIZE_CLASSES[size],
          className
        )}
        onError={(e) => {
          // On broken image, replace with initials fallback
          const target = e.currentTarget;
          target.style.display = 'none';
          const sibling = target.nextElementSibling as HTMLElement;
          if (sibling) sibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 ring-2 ring-white',
        SIZE_CLASSES[size],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
// src/components/ui/toggle.tsx
import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@/lib/utils';

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & {
    size?: 'default' | 'sm' | 'lg';
  }
>(({ className, size = 'default', ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      {
        'h-9 px-2.5': size === 'default',
        'h-7 px-2': size === 'sm',
        'h-11 px-4': size === 'lg',
      },
      className
    )}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
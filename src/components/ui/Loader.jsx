import React from 'react';
import { cn } from '@/utils/Utils.js';

export function Loader({ size = 'default', className }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent border-primary',
          {
            'h-4 w-4 border-2': size === 'sm',
            'h-8 w-8 border-4': size === 'default',
            'h-12 w-12 border-4': size === 'lg',
          },
          className,
        )}
      />
    </div>
  );
}

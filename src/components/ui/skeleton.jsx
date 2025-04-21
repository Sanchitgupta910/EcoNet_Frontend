import { cn } from '@/utils/Utils';

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

export { Skeleton };

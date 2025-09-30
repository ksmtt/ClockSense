import { Skeleton } from './ui/skeleton';

interface LoadingSkeletonProps {
  type: 'dashboard' | 'chart' | 'widget' | 'list';
  count?: number;
}

export function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-64 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        );
      
      case 'widget':
        return (
          <div className="space-y-3 p-4 border rounded-sm">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return <div className="animate-pulse">{renderSkeleton()}</div>;
}
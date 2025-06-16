import React, { Suspense } from 'react';
import { AutoSkeleton } from './skeletons';

interface LazyPageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonType?: 'auto' | 'card' | 'row' | 'accordion' | 'list' | 'stats' | 'table' | 'form';
}

export const LazyPageWrapper: React.FC<LazyPageWrapperProps> = ({ 
  children, 
  fallback,
  skeletonType = 'auto'
}) => {
  const defaultFallback = (
    <div className="min-h-screen p-space-6" data-skeleton-context="page">
      <div className="space-y-space-6">
        {/* Page header skeleton */}
        <div className="space-y-space-2">
          <div className="h-8 bg-neutral-200 rounded-radius-md animate-pulse w-1/3" />
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
        </div>
        
        {/* Stats skeleton */}
        <AutoSkeleton type="stats" count={4} />
        
        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-6" data-skeleton-context="grid">
          <AutoSkeleton type={skeletonType} count={2} />
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};
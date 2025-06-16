import React from 'react';

interface SkeletonListProps {
  items?: number;
  variant?: 'simple' | 'detailed' | 'media';
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  variant = 'simple',
  className = ''
}) => {
  const renderSimpleItem = (index: number) => (
    <div key={index} className="flex items-center space-x-space-3 p-space-3">
      <div className="w-2 h-2 bg-neutral-200 rounded-full animate-pulse" />
      <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse flex-1" />
      <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-16" />
    </div>
  );

  const renderDetailedItem = (index: number) => (
    <div key={index} className="flex items-start space-x-space-4 p-space-4 border-b border-neutral-100">
      <div className="w-8 h-8 bg-neutral-200 rounded-radius-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-space-2">
        <div className="h-5 bg-neutral-200 rounded-radius-md animate-pulse w-3/4" />
        <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-full" />
        <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
        <div className="flex items-center space-x-space-4 mt-space-2">
          <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-12" />
          <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-16" />
        </div>
      </div>
    </div>
  );

  const renderMediaItem = (index: number) => (
    <div key={index} className="flex items-center space-x-space-4 p-space-4 border-b border-neutral-100">
      <div className="w-16 h-16 bg-neutral-200 rounded-radius-lg animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-space-2">
        <div className="h-5 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
        <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
        <div className="flex items-center space-x-space-3">
          <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-12" />
          <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-16" />
          <div className="h-6 bg-neutral-200 rounded-radius-full animate-pulse w-14" />
        </div>
      </div>
      <div className="w-8 h-8 bg-neutral-200 rounded-radius-md animate-pulse" />
    </div>
  );

  const renderItem = (index: number) => {
    switch (variant) {
      case 'detailed':
        return renderDetailedItem(index);
      case 'media':
        return renderMediaItem(index);
      default:
        return renderSimpleItem(index);
    }
  };

  return (
    <div className={`space-y-space-1 ${className}`} role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, index) => renderItem(index))}
    </div>
  );
};
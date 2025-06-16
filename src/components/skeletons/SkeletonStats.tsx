import React from 'react';

interface SkeletonStatsProps {
  columns?: number;
  showIcons?: boolean;
  className?: string;
}

export const SkeletonStats: React.FC<SkeletonStatsProps> = ({
  columns = 4,
  showIcons = true,
  className = ''
}) => {
  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-space-6 ${className}`}
      role="status" 
      aria-label="Loading statistics"
    >
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="stats-card">
          <div className="flex items-center justify-between">
            <div className="space-y-space-2 flex-1">
              <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
              <div className="h-8 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
            </div>
            {showIcons && (
              <div className="w-12 h-12 bg-neutral-200 rounded-radius-lg animate-pulse" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
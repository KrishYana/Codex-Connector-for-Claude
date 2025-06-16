import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  showActions = true,
  className = ''
}) => {
  return (
    <div className={`overflow-hidden border border-neutral-200 rounded-radius-lg ${className}`} role="status" aria-label="Loading table">
      {/* Table Header */}
      {showHeader && (
        <div className="bg-neutral-50 border-b border-neutral-200 p-space-4">
          <div className={`grid gap-space-4 ${showActions ? 'grid-cols-5' : `grid-cols-${columns}`}`}>
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-3/4" />
            ))}
            {showActions && (
              <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
            )}
          </div>
        </div>
      )}
      
      {/* Table Rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-space-4">
            <div className={`grid gap-space-4 items-center ${showActions ? 'grid-cols-5' : `grid-cols-${columns}`}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="space-y-space-1">
                  <div className={`h-4 bg-neutral-200 rounded-radius-md animate-pulse ${
                    colIndex === 0 ? 'w-full' : 
                    colIndex === 1 ? 'w-3/4' : 'w-1/2'
                  }`} />
                  {colIndex === 0 && (
                    <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
                  )}
                </div>
              ))}
              {showActions && (
                <div className="flex items-center space-x-space-2">
                  <div className="w-8 h-8 bg-neutral-200 rounded-radius-md animate-pulse" />
                  <div className="w-8 h-8 bg-neutral-200 rounded-radius-md animate-pulse" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
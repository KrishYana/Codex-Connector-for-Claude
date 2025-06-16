import React from 'react';

interface SkeletonRowProps {
  columns?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
  columns = 4,
  showAvatar = false,
  showActions = true,
  showStatus = false,
  className = ''
}) => {
  return (
    <div 
      className={`flex items-center space-x-space-4 p-space-4 border-b border-neutral-100 ${className}`}
      role="status" 
      aria-label="Loading row"
    >
      {/* Avatar/Icon */}
      {showAvatar && (
        <div className="w-10 h-10 bg-neutral-200 rounded-full animate-pulse flex-shrink-0" />
      )}
      
      {/* Main content columns */}
      <div className="flex-1 grid gap-space-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="space-y-space-2">
            <div className={`h-4 bg-neutral-200 rounded-radius-md animate-pulse ${
              index === 0 ? 'w-full' : 
              index === 1 ? 'w-3/4' : 
              index === 2 ? 'w-1/2' : 'w-2/3'
            }`} />
            {index === 0 && (
              <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
            )}
          </div>
        ))}
      </div>
      
      {/* Status badge */}
      {showStatus && (
        <div className="h-6 bg-neutral-200 rounded-radius-full animate-pulse w-16 flex-shrink-0" />
      )}
      
      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-space-2 flex-shrink-0">
          <div className="w-8 h-8 bg-neutral-200 rounded-radius-md animate-pulse" />
          <div className="w-8 h-8 bg-neutral-200 rounded-radius-md animate-pulse" />
        </div>
      )}
    </div>
  );
};
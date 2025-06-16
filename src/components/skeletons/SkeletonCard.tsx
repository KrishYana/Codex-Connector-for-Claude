import React from 'react';

interface SkeletonCardProps {
  showImage?: boolean;
  showMetadata?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  showMetadata = true,
  showProgress = false,
  className = ''
}) => {
  return (
    <div className={`card overflow-hidden ${className}`} role="status" aria-label="Loading content">
      {showImage && (
        <div className="h-48 bg-neutral-200 animate-pulse" />
      )}
      
      <div className="card-body space-y-space-4">
        {/* Title */}
        <div className="space-y-space-2">
          <div className="h-6 bg-neutral-200 rounded-radius-md animate-pulse w-3/4" />
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/2" />
        </div>
        
        {/* Description */}
        <div className="space-y-space-2">
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-full" />
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-5/6" />
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
        </div>
        
        {/* Metadata */}
        {showMetadata && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-space-4">
              <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-16" />
              <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-20" />
            </div>
            <div className="h-6 bg-neutral-200 rounded-radius-full animate-pulse w-16" />
          </div>
        )}
        
        {/* Progress bar */}
        {showProgress && (
          <div className="space-y-space-2">
            <div className="flex justify-between">
              <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-16" />
              <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-10" />
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div className="bg-neutral-300 h-2 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
        
        {/* Action button */}
        <div className="h-10 bg-neutral-200 rounded-radius-md animate-pulse w-full" />
      </div>
    </div>
  );
};
import React from 'react';

interface SkeletonFormProps {
  fields?: number;
  showButtons?: boolean;
  showTextarea?: boolean;
  className?: string;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 4,
  showButtons = true,
  showTextarea = false,
  className = ''
}) => {
  return (
    <div className={`space-y-space-6 ${className}`} role="status" aria-label="Loading form">
      {/* Form fields */}
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-space-2">
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/4" />
          <div className="h-10 bg-neutral-200 rounded-radius-md animate-pulse w-full" />
          {index === 1 && (
            <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-1/3" />
          )}
        </div>
      ))}
      
      {/* Textarea */}
      {showTextarea && (
        <div className="space-y-space-2">
          <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-1/3" />
          <div className="h-24 bg-neutral-200 rounded-radius-md animate-pulse w-full" />
        </div>
      )}
      
      {/* Form buttons */}
      {showButtons && (
        <div className="flex items-center space-x-space-3 pt-space-4">
          <div className="h-10 bg-neutral-200 rounded-radius-md animate-pulse w-24" />
          <div className="h-10 bg-neutral-200 rounded-radius-md animate-pulse w-20" />
        </div>
      )}
    </div>
  );
};
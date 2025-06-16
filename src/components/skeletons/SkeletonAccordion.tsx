import React from 'react';

interface SkeletonAccordionProps {
  items?: number;
  showSubItems?: boolean;
  className?: string;
}

export const SkeletonAccordion: React.FC<SkeletonAccordionProps> = ({
  items = 3,
  showSubItems = true,
  className = ''
}) => {
  return (
    <div className={`space-y-space-2 ${className}`} role="status" aria-label="Loading accordion">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="border border-neutral-200 rounded-radius-lg overflow-hidden">
          {/* Accordion header */}
          <div className="flex items-center justify-between p-space-4 bg-neutral-50">
            <div className="flex items-center space-x-space-3 flex-1">
              <div className="w-5 h-5 bg-neutral-200 rounded-radius-sm animate-pulse" />
              <div className="space-y-space-2 flex-1">
                <div className="h-5 bg-neutral-200 rounded-radius-md animate-pulse w-2/3" />
                <div className="h-3 bg-neutral-200 rounded-radius-md animate-pulse w-1/3" />
              </div>
            </div>
            <div className="w-5 h-5 bg-neutral-200 rounded-radius-sm animate-pulse" />
          </div>
          
          {/* Accordion content (expanded state) */}
          {showSubItems && index === 0 && (
            <div className="p-space-4 border-t border-neutral-200 space-y-space-3">
              <div className="space-y-space-2">
                <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-full" />
                <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-4/5" />
                <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse w-3/5" />
              </div>
              
              {/* Sub-items */}
              <div className="space-y-space-2 ml-space-4">
                {Array.from({ length: 3 }).map((_, subIndex) => (
                  <div key={subIndex} className="flex items-center space-x-space-3">
                    <div className="w-4 h-4 bg-neutral-200 rounded-radius-sm animate-pulse" />
                    <div className="h-4 bg-neutral-200 rounded-radius-md animate-pulse flex-1" />
                    <div className="h-6 bg-neutral-200 rounded-radius-full animate-pulse w-12" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-scale-sm',
    md: 'text-scale-base',
    lg: 'text-scale-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-space-3 ${className}`}>
      <div className="animate-spin">
        <Loader2 className={`${sizeClasses[size]} text-primary-500`} />
      </div>
      {message && (
        <p className={`${textSizeClasses[size]} text-neutral-600 font-weight-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};
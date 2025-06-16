import React from 'react';
import { Bug } from 'lucide-react';

interface ErrorTestButtonProps {
  className?: string;
}

export const ErrorTestButton: React.FC<ErrorTestButtonProps> = ({ className = '' }) => {
  const triggerError = () => {
    // Only trigger error if explicitly confirmed by user
    const confirmed = window.confirm(
      'This will trigger a test error to verify the error boundary is working. Continue?'
    );
    
    if (confirmed) {
      // Simulate a render error
      throw new Error('Test error triggered by user - this is intentional for testing the error boundary');
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <button
      onClick={triggerError}
      className={`btn-outline flex items-center space-x-space-2 text-scale-sm ${className}`}
      title="Test Error Boundary (Development Only) - Click to confirm before triggering"
    >
      <Bug className="w-4 h-4" />
      <span>Test Error</span>
    </button>
  );
};
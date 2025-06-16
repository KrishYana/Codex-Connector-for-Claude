import React from 'react';
import { Search, Command } from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

interface SearchTriggerProps {
  variant?: 'button' | 'input';
  className?: string;
  placeholder?: string;
}

export const SearchTrigger: React.FC<SearchTriggerProps> = ({
  variant = 'input',
  className = '',
  placeholder = 'Search...'
}) => {
  const { openSearch } = useGlobalSearch();

  if (variant === 'button') {
    return (
      <button
        onClick={openSearch}
        className={`flex items-center space-x-space-2 p-space-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-radius-md hover:bg-neutral-100 ${className}`}
        aria-label="Open search"
        title="Search (Ctrl+K)"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={openSearch}
      className={`flex items-center space-x-space-3 w-full max-w-md px-space-3 py-space-2 bg-neutral-100 hover:bg-neutral-200 rounded-radius-md transition-colors text-left ${className}`}
      aria-label="Open search"
    >
      <Search className="w-4 h-4 text-neutral-400" />
      <span className="flex-1 text-scale-sm text-neutral-500">{placeholder}</span>
      <div className="flex items-center space-x-space-1 text-scale-xs text-neutral-400">
        <div className="flex items-center space-x-space-1 px-space-2 py-space-1 bg-neutral-0 rounded-radius-sm border border-neutral-300">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>
    </button>
  );
};
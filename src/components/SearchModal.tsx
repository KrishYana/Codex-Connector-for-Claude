import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Users, 
  Clock,
  ArrowRight,
  Command,
  HelpCircle,
  X
} from 'lucide-react';
import { useGlobalSearch, SearchResult } from '../hooks/useGlobalSearch';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

const getTypeIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'course':
      return <BookOpen className="w-4 h-4" />;
    case 'module':
      return <FileText className="w-4 h-4" />;
    case 'discussion':
      return <MessageSquare className="w-4 h-4" />;
    case 'assignment':
      return <FileText className="w-4 h-4" />;
    case 'student':
      return <Users className="w-4 h-4" />;
    default:
      return <Search className="w-4 h-4" />;
  }
};

const getTypeColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'course':
      return 'text-primary-600 bg-primary-100';
    case 'module':
      return 'text-secondary-600 bg-secondary-100';
    case 'discussion':
      return 'text-accent-600 bg-accent-100';
    case 'assignment':
      return 'text-warning-600 bg-warning-100';
    case 'student':
      return 'text-neutral-600 bg-neutral-100';
    default:
      return 'text-neutral-600 bg-neutral-100';
  }
};

const SearchResultItem: React.FC<{
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}> = ({ result, isSelected, onClick, onMouseEnter }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center space-x-space-3 p-space-3 rounded-radius-lg cursor-pointer transition-colors
        ${isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-neutral-50'}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className={`w-8 h-8 rounded-radius-md flex items-center justify-center ${getTypeColor(result.type)}`}>
        {getTypeIcon(result.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-space-2">
          <h3 className="text-scale-sm font-weight-medium text-neutral-900 truncate">
            {result.title}
          </h3>
          <span className="text-scale-xs text-neutral-500 capitalize px-space-2 py-space-1 bg-neutral-100 rounded-radius-sm">
            {result.type}
          </span>
        </div>
        <p className="text-scale-xs text-neutral-600 truncate mt-space-1">
          {result.description}
        </p>
        {result.metadata && (
          <div className="flex items-center space-x-space-3 mt-space-1 text-scale-xs text-neutral-500">
            {result.metadata.course && (
              <span className="flex items-center space-x-space-1">
                <BookOpen className="w-3 h-3" />
                <span>{result.metadata.course}</span>
              </span>
            )}
            {result.metadata.instructor && (
              <span className="flex items-center space-x-space-1">
                <Users className="w-3 h-3" />
                <span>{result.metadata.instructor}</span>
              </span>
            )}
            {result.metadata.lastActivity && (
              <span className="flex items-center space-x-space-1">
                <Clock className="w-3 h-3" />
                <span>{result.metadata.lastActivity}</span>
              </span>
            )}
            {result.metadata.status && (
              <span className={`px-space-2 py-space-1 rounded-radius-sm text-scale-xs ${
                result.metadata.status === 'active' ? 'bg-success-100 text-success-700' :
                result.metadata.status === 'submitted' ? 'bg-primary-100 text-primary-700' :
                'bg-warning-100 text-warning-700'
              }`}>
                {result.metadata.status}
              </span>
            )}
          </div>
        )}
      </div>
      
      {isSelected && (
        <div className="flex items-center text-neutral-400">
          <ArrowRight className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};

export const SearchModal: React.FC = () => {
  const {
    isOpen,
    query,
    results,
    selectedIndex,
    isLoading,
    closeSearch,
    setQuery,
    selectResult,
    setSelectedIndex
  } = useGlobalSearch();

  const { isInSequence, sequenceKey } = useKeyboardShortcuts();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current && !showShortcuts) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showShortcuts]);

  // Listen for show shortcuts event
  useEffect(() => {
    const handleShowShortcuts = () => {
      if (isOpen) {
        setShowShortcuts(true);
      }
    };

    document.addEventListener('show-shortcuts', handleShowShortcuts);
    return () => document.removeEventListener('show-shortcuts', handleShowShortcuts);
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, results]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeSearch();
      setShowShortcuts(false);
    }
  };

  const handleClose = () => {
    closeSearch();
    setShowShortcuts(false);
  };

  const toggleShortcuts = () => {
    setShowShortcuts(!showShortcuts);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />

        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`relative bg-neutral-0 rounded-radius-xl shadow-xl border border-neutral-200 w-full mx-space-4 overflow-hidden ${
            showShortcuts ? 'max-w-4xl' : 'max-w-2xl'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-space-4 border-b border-neutral-200">
            <div className="flex items-center space-x-space-3 flex-1">
              <Search className="w-5 h-5 text-neutral-400" />
              {!showShortcuts ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search courses, modules, discussions..."
                  className="flex-1 text-scale-lg bg-transparent border-none outline-none placeholder-neutral-400"
                  autoComplete="off"
                  spellCheck="false"
                />
              ) : (
                <h2 className="text-scale-lg font-weight-medium text-neutral-900">
                  Keyboard Shortcuts
                </h2>
              )}
              {isLoading && !showShortcuts && (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            
            <div className="flex items-center space-x-space-2">
              <button
                onClick={toggleShortcuts}
                className="p-space-2 text-neutral-400 hover:text-neutral-600 rounded-radius-md hover:bg-neutral-100 transition-colors"
                title={showShortcuts ? 'Back to search' : 'Show keyboard shortcuts'}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-space-2 text-neutral-400 hover:text-neutral-600 rounded-radius-md hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {showShortcuts ? (
              <div className="p-space-6">
                <KeyboardShortcutsHelp />
              </div>
            ) : query.trim() === '' ? (
              <div className="p-space-6 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-space-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-scale-lg font-weight-medium text-neutral-900 mb-space-2">
                  Search everything
                </h3>
                <p className="text-scale-sm text-neutral-600 mb-space-4">
                  Find courses, modules, discussions, assignments, and more
                </p>
                <div className="flex items-center justify-center space-x-space-4 text-scale-sm text-neutral-500">
                  <div className="flex items-center space-x-space-1">
                    <div className="flex items-center space-x-space-1 px-space-2 py-space-1 bg-neutral-100 rounded-radius-sm">
                      <Command className="w-3 h-3" />
                      <span>K</span>
                    </div>
                    <span>to search</span>
                  </div>
                  <div className="flex items-center space-x-space-1">
                    <kbd className="px-space-2 py-space-1 bg-neutral-100 rounded-radius-sm">?</kbd>
                    <span>for shortcuts</span>
                  </div>
                </div>
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="p-space-6 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-space-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-scale-lg font-weight-medium text-neutral-900 mb-space-2">
                  No results found
                </h3>
                <p className="text-scale-sm text-neutral-600">
                  Try adjusting your search terms or browse available content
                </p>
              </div>
            ) : (
              <div ref={resultsRef} className="p-space-3 space-y-space-1">
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => selectResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-space-3 border-t border-neutral-200 bg-neutral-50 text-scale-xs text-neutral-500">
            {!showShortcuts ? (
              <>
                <div className="flex items-center space-x-space-4">
                  <div className="flex items-center space-x-space-1">
                    <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm">↑↓</kbd>
                    <span>navigate</span>
                  </div>
                  <div className="flex items-center space-x-space-1">
                    <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm">↵</kbd>
                    <span>select</span>
                  </div>
                  <div className="flex items-center space-x-space-1">
                    <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm">esc</kbd>
                    <span>close</span>
                  </div>
                  <div className="flex items-center space-x-space-1">
                    <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm">?</kbd>
                    <span>shortcuts</span>
                  </div>
                </div>
                {results.length > 0 && (
                  <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-space-4">
                <div className="flex items-center space-x-space-1">
                  <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm">esc</kbd>
                  <span>back to search</span>
                </div>
                {isInSequence && (
                  <div className="flex items-center space-x-space-1 text-primary-600">
                    <span>Waiting for:</span>
                    <kbd className="px-space-2 py-space-1 bg-primary-100 rounded-radius-sm">
                      {sequenceKey.toUpperCase()}
                    </kbd>
                    <span>+ key</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
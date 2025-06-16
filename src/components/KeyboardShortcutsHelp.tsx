import React from 'react';
import { Keyboard, Navigation, Zap, Globe } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAuth } from '../contexts/AuthContext';

interface KeyboardShortcutsHelpProps {
  className?: string;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ 
  className = '' 
}) => {
  const { shortcuts } = useKeyboardShortcuts();
  const { user } = useAuth();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return <Navigation className="w-4 h-4" />;
      case 'actions':
        return <Zap className="w-4 h-4" />;
      case 'global':
        return <Globe className="w-4 h-4" />;
      default:
        return <Keyboard className="w-4 h-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'Navigation';
      case 'actions':
        return 'Actions';
      case 'global':
        return 'Global';
      default:
        return 'Other';
    }
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const formatShortcutKey = (key: string) => {
    return key.split(' ').map((k, index) => (
      <React.Fragment key={k}>
        {index > 0 && <span className="text-neutral-400 mx-space-1">then</span>}
        <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm text-scale-xs font-mono">
          {k.toUpperCase()}
        </kbd>
      </React.Fragment>
    ));
  };

  return (
    <div className={`space-y-space-4 ${className}`}>
      <div className="flex items-center space-x-space-2 mb-space-4">
        <Keyboard className="w-5 h-5 text-primary-600" />
        <h3 className="text-scale-lg font-weight-bold text-neutral-900">
          Keyboard Shortcuts
        </h3>
        <span className="text-scale-sm text-neutral-500 capitalize">
          ({user?.role} mode)
        </span>
      </div>

      {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
        <div key={category} className="space-y-space-2">
          <div className="flex items-center space-x-space-2">
            <div className="text-primary-600">
              {getCategoryIcon(category)}
            </div>
            <h4 className="text-scale-sm font-weight-bold text-neutral-800">
              {getCategoryTitle(category)}
            </h4>
          </div>
          
          <div className="space-y-space-2 ml-space-6">
            {categoryShortcuts.map((shortcut) => (
              <div 
                key={shortcut.key}
                className="flex items-center justify-between py-space-2"
              >
                <span className="text-scale-sm text-neutral-700">
                  {shortcut.description}
                </span>
                <div className="flex items-center space-x-space-1">
                  {formatShortcutKey(shortcut.key)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Additional global shortcuts */}
      <div className="border-t border-neutral-200 pt-space-4 space-y-space-2">
        <div className="flex items-center space-x-space-2">
          <Globe className="w-4 h-4 text-primary-600" />
          <h4 className="text-scale-sm font-weight-bold text-neutral-800">
            Always Available
          </h4>
        </div>
        
        <div className="space-y-space-2 ml-space-6">
          <div className="flex items-center justify-between py-space-2">
            <span className="text-scale-sm text-neutral-700">Open search</span>
            <div className="flex items-center space-x-space-1">
              <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm text-scale-xs font-mono">
                CTRL
              </kbd>
              <span className="text-neutral-400">+</span>
              <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm text-scale-xs font-mono">
                K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-space-2">
            <span className="text-scale-sm text-neutral-700">Show this help</span>
            <kbd className="px-space-2 py-space-1 bg-neutral-200 rounded-radius-sm text-scale-xs font-mono">
              ?
            </kbd>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-radius-lg p-space-3 mt-space-4">
        <p className="text-scale-xs text-primary-700">
          <strong>Tip:</strong> Keyboard shortcuts are disabled when typing in form fields. 
          Press <kbd className="px-space-1 bg-primary-100 rounded text-scale-xs">Escape</kbd> or 
          click outside to enable shortcuts again.
        </p>
      </div>
    </div>
  );
};
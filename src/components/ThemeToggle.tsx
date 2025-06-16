import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Contrast, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'high-contrast', label: 'High Contrast', icon: Contrast },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (newTheme: typeof theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-space-2 p-space-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-radius-md hover:bg-neutral-100"
        aria-label="Change theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <currentTheme.icon className="w-4 h-4" />
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-space-2 w-48 bg-neutral-0 rounded-radius-lg shadow-lg border border-neutral-200 py-space-2 z-50">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <button
                key={themeOption.value}
                onClick={() => handleThemeSelect(themeOption.value)}
                className={`w-full flex items-center space-x-space-3 px-space-4 py-space-2 text-left hover:bg-neutral-50 transition-colors ${
                  isSelected ? 'bg-primary-50 text-primary-700' : 'text-neutral-700'
                }`}
                role="menuitem"
              >
                <Icon className="w-4 h-4" />
                <span className="text-scale-sm font-weight-medium">{themeOption.label}</span>
                {isSelected && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
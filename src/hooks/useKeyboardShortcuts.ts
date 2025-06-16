import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'global';
  roles?: ('student' | 'teacher')[];
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Track if we're in a sequence (like 'g' pressed, waiting for second key)
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInSequence, setIsInSequence] = useState(false);
  const [sequenceKey, setSequenceKey] = useState<string>('');

  const isInFormField = useCallback((): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;

    const tagName = activeElement.tagName.toLowerCase();
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    const isInput = ['input', 'textarea', 'select'].includes(tagName);
    
    return isInput || isContentEditable;
  }, []);

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts (g + key)
    {
      key: 'g d',
      description: 'Go to Dashboard',
      action: () => navigate(user?.role === 'teacher' ? '/teach/dashboard' : '/dashboard'),
      category: 'navigation'
    },
    {
      key: 'g c',
      description: 'Go to Courses',
      action: () => navigate(user?.role === 'teacher' ? '/teach/classes' : '/courses'),
      category: 'navigation'
    },
    {
      key: 'g s',
      description: 'Go to Schedule',
      action: () => navigate(user?.role === 'teacher' ? '/teach/schedule' : '/schedule'),
      category: 'navigation'
    },
    {
      key: 'g m',
      description: 'Go to Messages',
      action: () => navigate(user?.role === 'teacher' ? '/teach/messages' : '/messages'),
      category: 'navigation'
    },
    {
      key: 'g t',
      description: 'Go to Settings',
      action: () => navigate(user?.role === 'teacher' ? '/teach/settings' : '/settings'),
      category: 'navigation'
    },
    
    // Teacher-specific shortcuts
    {
      key: 'g u',
      description: 'Go to Students',
      action: () => navigate('/teach/students'),
      category: 'navigation',
      roles: ['teacher']
    },
    {
      key: 'g a',
      description: 'Go to Analytics',
      action: () => navigate('/teach/analytics'),
      category: 'navigation',
      roles: ['teacher']
    },
    {
      key: 'g g',
      description: 'Go to Assignments',
      action: () => navigate('/teach/assignments'),
      category: 'navigation',
      roles: ['teacher']
    },
    {
      key: 'g o',
      description: 'Go to Content',
      action: () => navigate('/teach/content'),
      category: 'navigation',
      roles: ['teacher']
    },
    
    // Student-specific shortcuts
    {
      key: 'g h',
      description: 'Go to Achievements',
      action: () => navigate('/achievements'),
      category: 'navigation',
      roles: ['student']
    },
    
    // Global shortcuts (single key)
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => {
        // This will be handled by the search modal
        const event = new CustomEvent('show-shortcuts');
        document.dispatchEvent(event);
      },
      category: 'global'
    }
  ];

  const getAvailableShortcuts = useCallback(() => {
    return shortcuts.filter(shortcut => {
      if (shortcut.roles) {
        return user?.role && shortcut.roles.includes(user.role);
      }
      return true;
    });
  }, [user?.role, shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if in form field
    if (isInFormField()) {
      return;
    }

    // Ignore if modifier keys are pressed (except for global shortcuts)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();

    // Handle sequence shortcuts (g + key)
    if (isInSequence && sequenceKey === 'g') {
      event.preventDefault();
      
      const shortcutKey = `g ${key}`;
      const shortcut = getAvailableShortcuts().find(s => s.key === shortcutKey);
      
      if (shortcut) {
        shortcut.action();
      }
      
      // Clear sequence
      setIsInSequence(false);
      setSequenceKey('');
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
      return;
    }

    // Start sequence with 'g'
    if (key === 'g' && !isInSequence) {
      event.preventDefault();
      setIsInSequence(true);
      setSequenceKey('g');
      
      // Clear sequence after 2 seconds if no second key is pressed
      sequenceTimeoutRef.current = setTimeout(() => {
        setIsInSequence(false);
        setSequenceKey('');
      }, 2000);
      return;
    }

    // Handle single-key shortcuts
    const shortcut = getAvailableShortcuts().find(s => s.key === key);
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [isInFormField, isInSequence, sequenceKey, getAvailableShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  // Clear sequence when location changes
  useEffect(() => {
    setIsInSequence(false);
    setSequenceKey('');
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }
  }, [location.pathname]);

  return {
    shortcuts: getAvailableShortcuts(),
    isInSequence,
    sequenceKey
  };
};
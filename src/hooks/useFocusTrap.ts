import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  restoreFocus?: boolean;
  initialFocus?: HTMLElement | null;
}

export const useFocusTrap = ({ 
  isActive, 
  restoreFocus = true, 
  initialFocus 
}: UseFocusTrapOptions) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'iframe',
      'object',
      'embed',
      'area[href]',
      'summary'
    ].join(',');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      // Check if element is visible and not hidden
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('hidden') &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Handle Escape key to close modal
    if (event.key === 'Escape') {
      const escapeEvent = new CustomEvent('focustrap:escape', {
        bubbles: true,
        cancelable: true
      });
      containerRef.current.dispatchEvent(escapeEvent);
    }
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Set initial focus
      const focusableElements = getFocusableElements(containerRef.current);
      const elementToFocus = initialFocus || focusableElements[0];
      
      if (elementToFocus) {
        // Use setTimeout to ensure the element is rendered
        setTimeout(() => {
          elementToFocus.focus();
        }, 0);
      }

      // Add event listener
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore focus to previously focused element
        if (restoreFocus && previousActiveElement.current) {
          setTimeout(() => {
            previousActiveElement.current?.focus();
          }, 0);
        }
      };
    }
  }, [isActive, handleKeyDown, getFocusableElements, initialFocus, restoreFocus]);

  return containerRef;
};
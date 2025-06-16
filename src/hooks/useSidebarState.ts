import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STATE_KEY = 'edulearn_sidebar_collapsed';

export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
      // If no saved state, default to expanded (false)
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
      // Default to expanded on error
      setIsCollapsed(false);
    }
  }, []);

  // Save state to localStorage whenever it changes
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      try {
        localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error);
      }
      return newState;
    });
  }, []);

  // Function to set specific state (useful for programmatic control)
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(collapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, []);

  return {
    isCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  };
};
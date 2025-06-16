import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'module' | 'discussion' | 'assignment' | 'student';
  url: string;
  metadata?: {
    instructor?: string;
    course?: string;
    lastActivity?: string;
    status?: string;
  };
}

// Mock search data - in a real app this would come from an API
const mockSearchData: SearchResult[] = [
  // Courses
  {
    id: 'course-1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, hooks, and state management',
    type: 'course',
    url: '/courses/react-fundamentals',
    metadata: { instructor: 'Dr. Jane Smith', status: 'active' }
  },
  {
    id: 'course-2',
    title: 'JavaScript Advanced',
    description: 'Advanced JavaScript concepts including async/await, closures, and prototypes',
    type: 'course',
    url: '/courses/javascript-advanced',
    metadata: { instructor: 'Prof. John Doe', status: 'active' }
  },
  {
    id: 'course-3',
    title: 'Web Design Basics',
    description: 'Introduction to HTML, CSS, and responsive design principles',
    type: 'course',
    url: '/courses/web-design-basics',
    metadata: { instructor: 'Dr. Sarah Wilson', status: 'active' }
  },
  {
    id: 'course-4',
    title: 'Database Systems',
    description: 'Relational databases, SQL, and database design fundamentals',
    type: 'course',
    url: '/courses/database-systems',
    metadata: { instructor: 'Prof. Mike Johnson', status: 'active' }
  },
  
  // Modules
  {
    id: 'module-1',
    title: 'React Hooks Deep Dive',
    description: 'Understanding useState, useEffect, and custom hooks',
    type: 'module',
    url: '/courses/react-fundamentals/modules/hooks',
    metadata: { course: 'React Fundamentals', lastActivity: '2 hours ago' }
  },
  {
    id: 'module-2',
    title: 'Component Lifecycle',
    description: 'Managing component mounting, updating, and unmounting',
    type: 'module',
    url: '/courses/react-fundamentals/modules/lifecycle',
    metadata: { course: 'React Fundamentals', lastActivity: '1 day ago' }
  },
  {
    id: 'module-3',
    title: 'Async JavaScript Patterns',
    description: 'Promises, async/await, and error handling',
    type: 'module',
    url: '/courses/javascript-advanced/modules/async',
    metadata: { course: 'JavaScript Advanced', lastActivity: '3 hours ago' }
  },
  {
    id: 'module-4',
    title: 'CSS Grid and Flexbox',
    description: 'Modern layout techniques for responsive design',
    type: 'module',
    url: '/courses/web-design-basics/modules/layout',
    metadata: { course: 'Web Design Basics', lastActivity: '5 hours ago' }
  },
  
  // Discussions
  {
    id: 'discussion-1',
    title: 'Best Practices for React State Management',
    description: 'Discussion about when to use local state vs global state',
    type: 'discussion',
    url: '/discussions/thread-1',
    metadata: { course: 'React Fundamentals', lastActivity: '30 minutes ago' }
  },
  {
    id: 'discussion-2',
    title: 'Debugging JavaScript Async Code',
    description: 'Tips and tricks for debugging promises and async functions',
    type: 'discussion',
    url: '/discussions/thread-2',
    metadata: { course: 'JavaScript Advanced', lastActivity: '1 hour ago' }
  },
  {
    id: 'discussion-3',
    title: 'Responsive Design Challenges',
    description: 'Common issues and solutions in responsive web design',
    type: 'discussion',
    url: '/discussions/thread-3',
    metadata: { course: 'Web Design Basics', lastActivity: '2 hours ago' }
  },
  {
    id: 'discussion-4',
    title: 'Understanding React Hooks - useEffect Dependencies',
    description: 'Help with useEffect dependency arrays and infinite re-renders',
    type: 'discussion',
    url: '/discussions/thread-1',
    metadata: { course: 'React Fundamentals', lastActivity: '4 hours ago' }
  },
  
  // Assignments
  {
    id: 'assignment-1',
    title: 'Build a Todo App with React',
    description: 'Create a fully functional todo application using React hooks',
    type: 'assignment',
    url: '/courses/react-fundamentals/assignments/todo-app',
    metadata: { course: 'React Fundamentals', status: 'due in 3 days' }
  },
  {
    id: 'assignment-2',
    title: 'JavaScript Algorithm Challenge',
    description: 'Solve complex algorithms using advanced JavaScript concepts',
    type: 'assignment',
    url: '/courses/javascript-advanced/assignments/algorithms',
    metadata: { course: 'JavaScript Advanced', status: 'submitted' }
  },
  
  // Students (for teachers)
  {
    id: 'student-1',
    title: 'Alex Johnson',
    description: 'Student in React Fundamentals and JavaScript Advanced',
    type: 'student',
    url: '/teach/students/alex-johnson',
    metadata: { lastActivity: '1 hour ago', status: 'active' }
  },
  {
    id: 'student-2',
    title: 'Sarah Chen',
    description: 'Student in Web Design Basics',
    type: 'student',
    url: '/teach/students/sarah-chen',
    metadata: { lastActivity: '2 days ago', status: 'active' }
  }
];

// Simple fuzzy search implementation
const fuzzySearch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return 100;
  }
  
  // Character-by-character fuzzy matching
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  // Return percentage of query characters found
  return queryIndex === queryLower.length ? (score / queryLower.length) * 80 : 0;
};

const searchResults = async (query: string): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
  
  if (!query.trim()) {
    return [];
  }
  
  const results = mockSearchData
    .map(item => {
      const titleScore = fuzzySearch(query, item.title);
      const descriptionScore = fuzzySearch(query, item.description) * 0.7;
      const metadataScore = item.metadata?.course ? fuzzySearch(query, item.metadata.course) * 0.5 : 0;
      
      return {
        ...item,
        score: Math.max(titleScore, descriptionScore, metadataScore)
      };
    })
    .filter(item => item.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  return results;
};

export const useGlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await searchResults(query);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);

  const selectResult = useCallback((result: SearchResult) => {
    navigate(result.url);
    closeSearch();
  }, [navigate, closeSearch]);

  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          selectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeSearch();
        break;
    }
  }, [isOpen, results, selectedIndex, selectResult, closeSearch]);

  // Add keyboard navigation listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  return {
    isOpen,
    query,
    results,
    selectedIndex,
    isLoading,
    openSearch,
    closeSearch,
    setQuery,
    selectResult,
    setSelectedIndex
  };
};
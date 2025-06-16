import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

interface RouteMetadata {
  breadcrumb?: {
    label: string;
    dynamic?: boolean;
    parent?: string;
  };
}

// Route metadata configuration
const routeMetadata: Record<string, RouteMetadata> = {
  // Student Routes
  '/dashboard': {
    breadcrumb: { label: 'Dashboard' }
  },
  '/courses': {
    breadcrumb: { label: 'My Courses' }
  },
  '/courses/:courseId': {
    breadcrumb: { label: 'Course Details', dynamic: true, parent: '/courses' }
  },
  '/courses/:courseId/discussions': {
    breadcrumb: { label: 'Discussions', parent: '/courses/:courseId' }
  },
  '/courses/:courseId/discussions/:threadId': {
    breadcrumb: { label: 'Discussion Thread', dynamic: true, parent: '/courses/:courseId/discussions' }
  },
  '/schedule': {
    breadcrumb: { label: 'Schedule' }
  },
  '/messages': {
    breadcrumb: { label: 'Messages' }
  },
  '/achievements': {
    breadcrumb: { label: 'Achievements' }
  },
  '/settings': {
    breadcrumb: { label: 'Settings' }
  },
  '/discussions': {
    breadcrumb: { label: 'Discussions' }
  },
  '/discussions/:threadId': {
    breadcrumb: { label: 'Discussion Thread', dynamic: true, parent: '/discussions' }
  },

  // Teacher Routes
  '/teach/dashboard': {
    breadcrumb: { label: 'Dashboard' }
  },
  '/teach/classes': {
    breadcrumb: { label: 'My Classes' }
  },
  '/teach/classes/:classId': {
    breadcrumb: { label: 'Class Details', dynamic: true, parent: '/teach/classes' }
  },
  '/teach/students': {
    breadcrumb: { label: 'Students' }
  },
  '/teach/students/:studentId': {
    breadcrumb: { label: 'Student Profile', dynamic: true, parent: '/teach/students' }
  },
  '/teach/content': {
    breadcrumb: { label: 'Course Content' }
  },
  '/teach/schedule': {
    breadcrumb: { label: 'Schedule' }
  },
  '/teach/analytics': {
    breadcrumb: { label: 'Analytics' }
  },
  '/teach/assignments': {
    breadcrumb: { label: 'Assignments' }
  },
  '/teach/assignments/:assignmentId': {
    breadcrumb: { label: 'Assignment Details', dynamic: true, parent: '/teach/assignments' }
  },
  '/teach/messages': {
    breadcrumb: { label: 'Messages' }
  },
  '/teach/settings': {
    breadcrumb: { label: 'Settings' }
  },
  '/teach/discussions': {
    breadcrumb: { label: 'Discussions' }
  },
  '/teach/discussions/:threadId': {
    breadcrumb: { label: 'Discussion Thread', dynamic: true, parent: '/teach/discussions' }
  },
  '/teach/courses/:courseId/discussions': {
    breadcrumb: { label: 'Discussions', parent: '/teach/courses/:courseId' }
  },
  '/teach/courses/:courseId/discussions/:threadId': {
    breadcrumb: { label: 'Discussion Thread', dynamic: true, parent: '/teach/courses/:courseId/discussions' }
  },
};

// Mock data for dynamic labels - in real app this would come from API/context
const dynamicLabels: Record<string, Record<string, string>> = {
  courseId: {
    'course-1': 'React Fundamentals',
    'course-2': 'JavaScript Advanced',
    'course-3': 'Web Design Basics',
    'course-4': 'Database Systems',
  },
  threadId: {
    'thread-1': 'Understanding React Hooks',
    'thread-2': 'Debugging Async Code',
    'thread-3': 'Responsive Design Tips',
  },
  studentId: {
    'student-1': 'Alex Johnson',
    'student-2': 'Sarah Chen',
    'student-3': 'Mike Wilson',
  },
  assignmentId: {
    'assignment-1': 'React Todo App',
    'assignment-2': 'JavaScript Algorithms',
    'assignment-3': 'CSS Grid Layout',
  },
  classId: {
    'class-1': 'Advanced React',
    'class-2': 'JavaScript Fundamentals',
    'class-3': 'Web Design Principles',
  },
};

const matchRoute = (pathname: string, routePattern: string): boolean => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const patternSegments = routePattern.split('/').filter(Boolean);

  if (pathSegments.length !== patternSegments.length) {
    return false;
  }

  return patternSegments.every((segment, index) => {
    if (segment.startsWith(':')) {
      return true; // Dynamic segment matches any value
    }
    return segment === pathSegments[index];
  });
};

const extractParams = (pathname: string, routePattern: string): Record<string, string> => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const patternSegments = routePattern.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  patternSegments.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      params[paramName] = pathSegments[index];
    }
  });

  return params;
};

const getDynamicLabel = (routePattern: string, params: Record<string, string>, metadata: RouteMetadata): string => {
  if (!metadata.breadcrumb?.dynamic) {
    return metadata.breadcrumb?.label || '';
  }

  // Try to get dynamic label from params
  for (const [paramName, paramValue] of Object.entries(params)) {
    if (dynamicLabels[paramName]?.[paramValue]) {
      return dynamicLabels[paramName][paramValue];
    }
  }

  // Fallback to static label
  return metadata.breadcrumb.label;
};

const buildBreadcrumbChain = (currentRoute: string, currentMetadata: RouteMetadata, allParams: Record<string, string>): BreadcrumbItem[] => {
  const chain: BreadcrumbItem[] = [];
  
  let route = currentRoute;
  let metadata = currentMetadata;
  
  // Build chain by following parent relationships
  while (metadata.breadcrumb) {
    const label = getDynamicLabel(route, allParams, metadata);
    const path = Object.entries(allParams).reduce((acc, [key, value]) => {
      return acc.replace(`:${key}`, value);
    }, route);

    chain.unshift({
      label,
      path,
      isActive: route === currentRoute
    });

    // Move to parent
    if (metadata.breadcrumb.parent) {
      route = metadata.breadcrumb.parent;
      metadata = routeMetadata[route] || { breadcrumb: undefined };
    } else {
      break;
    }
  }

  return chain;
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();

  // Find matching route pattern
  const matchedRoute = Object.keys(routeMetadata).find(pattern => 
    matchRoute(location.pathname, pattern)
  );

  if (!matchedRoute) {
    return null; // No breadcrumb metadata for this route
  }

  const metadata = routeMetadata[matchedRoute];
  if (!metadata.breadcrumb) {
    return null;
  }

  // Extract all params from the current route
  const allParams = extractParams(location.pathname, matchedRoute);

  // Build breadcrumb chain
  const breadcrumbItems = buildBreadcrumbChain(matchedRoute, metadata, allParams);

  // Add home/dashboard as root if not already present
  const dashboardPath = user?.role === 'teacher' ? '/teach/dashboard' : '/dashboard';
  const hasDashboard = breadcrumbItems.some(item => item.path === dashboardPath);
  
  if (!hasDashboard && breadcrumbItems.length > 0) {
    breadcrumbItems.unshift({
      label: 'Dashboard',
      path: dashboardPath,
      isActive: false
    });
  }

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single items
  }

  return (
    <nav 
      className="flex items-center space-x-space-2 text-scale-sm text-neutral-500 mb-space-6"
      aria-label="Breadcrumb"
    >
      <Home className="w-4 h-4" />
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          
          {item.isActive ? (
            <span 
              className="text-neutral-700 font-weight-medium truncate max-w-xs"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.path}
              className="hover:text-neutral-700 transition-colors truncate max-w-xs"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher';
  requiresCourseRole?: 'teacher' | 'co-teacher' | 'assistant';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiresCourseRole
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />;
  }

  if (requiresCourseRole && user?.role === 'teacher') {
    const allowedCourseRoles = ['teacher', 'co-teacher', 'assistant'];
    const hasRequiredCourseRole = requiresCourseRole === 'assistant' 
      ? allowedCourseRoles.includes(user?.course_role || '')
      : requiresCourseRole === 'co-teacher'
      ? ['teacher', 'co-teacher'].includes(user?.course_role || '')
      : user?.course_role === 'teacher';

    if (!hasRequiredCourseRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};
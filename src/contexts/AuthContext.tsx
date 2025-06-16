import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, JWTPayload } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid JWT token:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken && !isTokenExpired(savedToken)) {
      const payload = decodeJWT(savedToken);
      if (payload) {
        setToken(savedToken);
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          course_role: payload.course_role,
        });
      }
    } else {
      localStorage.removeItem('auth_token');
    }
  }, []);

  const login = (authToken: string) => {
    if (isTokenExpired(authToken)) {
      throw new Error('Token is expired');
    }

    const payload = decodeJWT(authToken);
    if (!payload) {
      throw new Error('Invalid token');
    }

    setToken(authToken);
    setUser({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      course_role: payload.course_role,
    });
    localStorage.setItem('auth_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  // Authorization helpers
  const canCreateCourses = user?.role === 'teacher' && 
    (user?.course_role === 'teacher' || user?.course_role === 'co-teacher');
  
  const canManageGrades = user?.role === 'teacher' && 
    ['teacher', 'co-teacher', 'assistant'].includes(user?.course_role || '');
  
  const canCreateAssignments = user?.role === 'teacher' && 
    (user?.course_role === 'teacher' || user?.course_role === 'co-teacher');

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    canCreateCourses,
    canManageGrades,
    canCreateAssignments,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
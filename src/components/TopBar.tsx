import React from 'react';
import { Bell, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { SearchTrigger } from './SearchTrigger';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeColor = (courseRole?: string) => {
    switch (courseRole) {
      case 'teacher':
        return 'badge-secondary';
      case 'co-teacher':
        return 'badge-accent';
      case 'assistant':
        return 'badge-primary';
      default:
        return 'badge bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <header className="topbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-space-4">
          <h1 className="heading-2 mb-0">
            {user?.role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
          </h1>
          {user?.course_role && user?.role === 'teacher' && (
            <span className={`badge ${getRoleBadgeColor(user.course_role)}`}>
              <Shield className="w-3 h-3 mr-space-1" />
              {user.course_role.replace('-', ' ')}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-space-4">
          {/* Global Search */}
          <div className="hidden md:block">
            <SearchTrigger 
              variant="input" 
              placeholder="Search courses, modules, discussions..."
              className="w-80"
            />
          </div>
          
          {/* Mobile Search Button */}
          <div className="md:hidden">
            <SearchTrigger variant="button" />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-space-2 text-neutral-400 hover:text-neutral-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-error-500 text-neutral-0 text-scale-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-space-3">
            <div className="hidden sm:block text-right">
              <p className="text-scale-sm font-weight-medium text-neutral-900">{user?.name}</p>
              <p className="text-scale-xs text-neutral-500 capitalize">
                {user?.role}
                {user?.course_role && user?.role === 'teacher' && (
                  <span className="text-neutral-400"> • {user.course_role}</span>
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-neutral-0" />
            </div>
            <button
              onClick={handleLogout}
              className="p-space-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
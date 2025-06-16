import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, MessageSquare, Trophy, Settings, Home, ChevronLeft, Menu } from 'lucide-react';
import { useSidebarState } from '../hooks/useSidebarState';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Courses', href: '/courses', icon: BookOpen },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const SidebarStudent: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebarState();

  return (
    <aside className={`sidebar-student transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`p-space-6 ${isCollapsed ? 'px-space-3' : ''}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-space-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-neutral-0 rounded-radius-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            {!isCollapsed && (
              <h2 className="text-scale-xl font-weight-bold">EduLearn</h2>
            )}
          </div>
          
          <button
            onClick={toggleSidebar}
            className={`p-space-2 text-primary-100 hover:text-neutral-0 hover:bg-primary-500 rounded-radius-md transition-colors ${
              isCollapsed ? 'ml-0' : ''
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <nav className={`px-space-4 pb-space-4 ${isCollapsed ? 'px-space-2' : ''}`}>
        <ul className="space-y-space-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive text-primary-100'} ${
                    isCollapsed ? 'justify-center px-space-3' : ''
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-weight-medium">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
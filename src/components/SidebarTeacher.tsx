import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Settings,
  GraduationCap,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useSidebarState } from '../hooks/useSidebarState';

const navigation = [
  { name: 'Dashboard', href: '/teach/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/teach/classes', icon: GraduationCap },
  { name: 'Students', href: '/teach/students', icon: Users },
  { name: 'Course Content', href: '/teach/content', icon: BookOpen },
  { name: 'Schedule', href: '/teach/schedule', icon: Calendar },
  { name: 'Analytics', href: '/teach/analytics', icon: BarChart3 },
  { name: 'Assignments', href: '/teach/assignments', icon: FileText },
  { name: 'Messages', href: '/teach/messages', icon: MessageSquare },
  { name: 'Settings', href: '/teach/settings', icon: Settings },
];

export const SidebarTeacher: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebarState();

  return (
    <aside className={`sidebar-teacher transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className={`p-space-6 ${isCollapsed ? 'px-space-3' : ''}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-space-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-neutral-0 rounded-radius-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-secondary-600" />
            </div>
            {!isCollapsed && (
              <h2 className="text-scale-xl font-weight-bold">EduTeach</h2>
            )}
          </div>
          
          <button
            onClick={toggleSidebar}
            className={`p-space-2 text-secondary-100 hover:text-neutral-0 hover:bg-secondary-500 rounded-radius-md transition-colors ${
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
                  `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive text-secondary-100'} ${
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
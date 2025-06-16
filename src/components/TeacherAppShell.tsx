import React, { useEffect } from 'react';
import { TopBar } from './TopBar';
import { SidebarTeacher } from './SidebarTeacher';
import { Breadcrumbs } from './Breadcrumbs';
import { OfflineBanner } from './OfflineBanner';
import { useWebSocket } from '../hooks/useWebSocket';

interface TeacherAppShellProps {
  children: React.ReactNode;
}

export const TeacherAppShell: React.FC<TeacherAppShellProps> = ({ children }) => {
  // Initialize WebSocket connection for real-time notifications
  useWebSocket();

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <SidebarTeacher />
      <div className="flex-1 flex flex-col">
        <OfflineBanner />
        <TopBar />
        <main 
          id="main-content"
          className="main-content"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
};
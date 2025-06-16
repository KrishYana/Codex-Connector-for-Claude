import React, { useEffect } from 'react';
import { TopBar } from './TopBar';
import { SidebarStudent } from './SidebarStudent';
import { Breadcrumbs } from './Breadcrumbs';
import { OfflineBanner } from './OfflineBanner';
import { useWebSocket } from '../hooks/useWebSocket';

interface StudentAppShellProps {
  children: React.ReactNode;
}

export const StudentAppShell: React.FC<StudentAppShellProps> = ({ children }) => {
  // Initialize WebSocket connection for real-time notifications
  useWebSocket();

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <SidebarStudent />
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
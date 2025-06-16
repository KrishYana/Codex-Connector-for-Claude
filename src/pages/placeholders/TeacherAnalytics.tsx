import React from 'react';
import { BarChart3 } from 'lucide-react';

const TeacherAnalytics: React.FC = () => {
  return (
    <div className="p-space-8 text-center">
      <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-space-4">
        <BarChart3 className="w-8 h-8 text-accent-600" />
      </div>
      <h1 className="heading-2 text-neutral-900 mb-space-2">Analytics</h1>
      <p className="body-text">Analytics dashboard coming soon...</p>
    </div>
  );
};

export default TeacherAnalytics;
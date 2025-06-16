import React from 'react';
import { Settings } from 'lucide-react';

const TeacherSettings: React.FC = () => {
  return (
    <div className="p-space-8 text-center">
      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-space-4">
        <Settings className="w-8 h-8 text-secondary-600" />
      </div>
      <h1 className="heading-2 text-neutral-900 mb-space-2">Settings</h1>
      <p className="body-text">Teacher settings coming soon...</p>
    </div>
  );
};

export default TeacherSettings;
import React from 'react';
import { Trophy } from 'lucide-react';

const StudentAchievements: React.FC = () => {
  return (
    <div className="p-space-8 text-center">
      <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-space-4">
        <Trophy className="w-8 h-8 text-warning-600" />
      </div>
      <h1 className="heading-2 text-neutral-900 mb-space-2">Achievements</h1>
      <p className="body-text">Student achievements coming soon...</p>
    </div>
  );
};

export default StudentAchievements;
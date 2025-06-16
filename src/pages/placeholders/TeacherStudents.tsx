import React from 'react';
import { Users } from 'lucide-react';

const TeacherStudents: React.FC = () => {
  return (
    <div className="p-space-8 text-center">
      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-space-4">
        <Users className="w-8 h-8 text-secondary-600" />
      </div>
      <h1 className="heading-2 text-neutral-900 mb-space-2">Students</h1>
      <p className="body-text">Student management coming soon...</p>
    </div>
  );
};

export default TeacherStudents;
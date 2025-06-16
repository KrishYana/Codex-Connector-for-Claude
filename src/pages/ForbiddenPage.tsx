import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    const defaultRoute = user?.role === 'teacher' ? '/teach/dashboard' : '/dashboard';
    navigate(defaultRoute, { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-space-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-space-6">
          <ShieldX className="w-12 h-12 text-error-500" />
        </div>
        
        <h1 className="text-scale-4xl font-weight-bold text-neutral-900 mb-space-4">403</h1>
        <h2 className="heading-2">Access Forbidden</h2>
        
        <p className="body-text mb-space-8 max-w-md mx-auto">
          You don't have permission to access this page. This area is restricted to 
          {user?.role === 'student' ? ' teachers' : ' students'} only.
        </p>

        <button
          onClick={handleGoBack}
          className="btn-primary inline-flex items-center space-x-space-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to {user?.role === 'teacher' ? 'Teacher' : 'Student'} Dashboard</span>
        </button>
      </div>
    </div>
  );
};
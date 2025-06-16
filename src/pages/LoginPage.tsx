import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Mock JWT tokens with course_role claims
const MOCK_TOKENS = {
  teacher: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRyLiBKYW5lIFNtaXRoIiwiZW1haWwiOiJqYW5lLnNtaXRoQGV4YW1wbGUuY29tIiwicm9sZSI6InRlYWNoZXIiLCJjb3Vyc2Vfcm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3MzQ3MDU2MDAsImV4cCI6MjA1MDA2NTYwMH0.8vQzF2mNxK7pL9wYzB3cU2vRsLqFxQoMn5-tFPJhBqN',
  student: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTg3NjU0MzIxIiwibmFtZSI6IkFsZXggSm9obnNvbiIsImVtYWlsIjoiYWxleC5qb2huc29uQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzQ3MDU2MDAsImV4cCI6MjA1MDA2NTYwMH0.YZ8pCQoMn5-tFPJhBqNtOgKzB3wYzF7cU2vRsLqFxQ',
  co_teacher: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTU1NTU1NTU1IiwibmFtZSI6IlByb2YuIE1pa2UgSm9obnNvbiIsImVtYWlsIjoibWlrZS5qb2huc29uQGV4YW1wbGUuY29tIiwicm9sZSI6InRlYWNoZXIiLCJjb3Vyc2Vfcm9sZSI6ImNvLXRlYWNoZXIiLCJpYXQiOjE3MzQ3MDU2MDAsImV4cCI6MjA1MDA2NTYwMH0.3mKxF7nPqL2wYzB8cU9vRsLqFxQoMn5-tFPJhBqNtO'
};

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | 'co_teacher'>('student');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (selectedRole === 'student' ? '/dashboard' : '/teach/dashboard');

  const handleLogin = async (role: 'teacher' | 'student' | 'co_teacher') => {
    try {
      const token = MOCK_TOKENS[role];
      login(token);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-space-4">
      <div className="bg-neutral-0 rounded-radius-2xl shadow-xl p-space-8 w-full max-w-md">
        <div className="text-center mb-space-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-radius-2xl mx-auto mb-space-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-neutral-0" />
          </div>
          <h1 className="heading-1 mb-space-2">EduLearn</h1>
          <p className="body-text">Choose your role to continue</p>
        </div>

        <div className="space-y-space-4 mb-space-6">
          <button
            onClick={() => setSelectedRole('student')}
            className={`w-full p-space-4 rounded-radius-xl border-2 transition-all duration-200 flex items-center space-x-space-4 ${
              selectedRole === 'student'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-radius-lg flex items-center justify-center ${
              selectedRole === 'student' ? 'bg-primary-500' : 'bg-neutral-100'
            }`}>
              <BookOpen className={`w-6 h-6 ${
                selectedRole === 'student' ? 'text-neutral-0' : 'text-neutral-600'
              }`} />
            </div>
            <div className="text-left">
              <h3 className="font-weight-bold">Student</h3>
              <p className="caption-text">Access courses and assignments</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('teacher')}
            className={`w-full p-space-4 rounded-radius-xl border-2 transition-all duration-200 flex items-center space-x-space-4 ${
              selectedRole === 'teacher'
                ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-radius-lg flex items-center justify-center ${
              selectedRole === 'teacher' ? 'bg-secondary-500' : 'bg-neutral-100'
            }`}>
              <GraduationCap className={`w-6 h-6 ${
                selectedRole === 'teacher' ? 'text-neutral-0' : 'text-neutral-600'
              }`} />
            </div>
            <div className="text-left">
              <h3 className="font-weight-bold">Teacher</h3>
              <p className="caption-text">Full course management access</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('co_teacher')}
            className={`w-full p-space-4 rounded-radius-xl border-2 transition-all duration-200 flex items-center space-x-space-4 ${
              selectedRole === 'co_teacher'
                ? 'border-accent-500 bg-accent-50 text-accent-700'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-radius-lg flex items-center justify-center ${
              selectedRole === 'co_teacher' ? 'bg-accent-500' : 'bg-neutral-100'
            }`}>
              <GraduationCap className={`w-6 h-6 ${
                selectedRole === 'co_teacher' ? 'text-neutral-0' : 'text-neutral-600'
              }`} />
            </div>
            <div className="text-left">
              <h3 className="font-weight-bold">Co-Teacher</h3>
              <p className="caption-text">Collaborative teaching access</p>
            </div>
          </button>
        </div>

        <button
          onClick={() => handleLogin(selectedRole)}
          className={`w-full py-space-3 px-space-4 rounded-radius-xl font-weight-bold text-neutral-0 transition-all duration-200 ${
            selectedRole === 'teacher'
              ? 'btn-secondary'
              : selectedRole === 'co_teacher'
              ? 'btn-accent'
              : 'btn-primary'
          }`}
        >
          Continue as {selectedRole === 'teacher' ? 'Teacher' : selectedRole === 'co_teacher' ? 'Co-Teacher' : 'Student'}
        </button>

        <div className="mt-space-6 text-center caption-text">
          <p>Demo Mode - No real authentication required</p>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';
import { ErrorTestButton } from '../components/ErrorTestButton';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const StudentDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleTestModal = () => {
    setIsModalOpen(true);
  };

  const handleTestConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    console.log('Action confirmed!');
  };

  return (
    <div className="space-y-space-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Welcome back, Alex!</h1>
          <p className="body-text">Continue your learning journey</p>
        </div>
        <div className="flex space-x-space-3">
          <ErrorTestButton />
          <button
            onClick={handleTestModal}
            className="btn-primary"
          >
            Test Modal
          </button>
          <button
            onClick={handleTestConfirm}
            className="btn-outline"
          >
            Test Confirm
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Active Courses</p>
              <p className="stats-value">4</p>
            </div>
            <div className="stats-icon stats-icon-primary">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Hours Studied</p>
              <p className="stats-value">24</p>
            </div>
            <div className="stats-icon stats-icon-secondary">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Achievements</p>
              <p className="stats-value">12</p>
            </div>
            <div className="stats-icon stats-icon-warning">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Progress</p>
              <p className="stats-value">78%</p>
            </div>
            <div className="stats-icon stats-icon-accent">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="heading-3 mb-0">Recent Activity</h2>
        </div>
        <div className="card-body">
          <div className="space-y-space-4">
            <div className="flex items-center space-x-space-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <p className="body-text">Completed lesson: Introduction to React Hooks</p>
              <span className="caption-text">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-space-4">
              <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
              <p className="body-text">Submitted assignment: JavaScript Fundamentals</p>
              <span className="caption-text">1 day ago</span>
            </div>
            <div className="flex items-center space-x-space-4">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              <p className="body-text">Earned badge: Quick Learner</p>
              <span className="caption-text">2 days ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Test Modal with Focus Trap"
        size="md"
      >
        <div className="space-y-space-4">
          <p className="body-text">
            This modal demonstrates the focus trap functionality. Try pressing Tab to navigate 
            through the focusable elements, and notice how focus stays within the modal.
          </p>
          
          <div className="space-y-space-3">
            <input
              type="text"
              placeholder="First input"
              className="form-input"
            />
            <input
              type="text"
              placeholder="Second input"
              className="form-input"
            />
            <button className="btn-primary">
              Focusable Button
            </button>
            <button className="btn-outline">
              Another Button
            </button>
          </div>
          
          <p className="caption-text">
            Press Escape or click the X button to close this modal and return focus 
            to the element that opened it.
          </p>
        </div>
      </Modal>

      {/* Test Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This is a test of the confirm dialog with focus trapping."
        confirmText="Yes, Continue"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Plus, 
  Send, 
  FileText, 
  ClipboardList, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  BookOpen,
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  X,
  Clock,
  GraduationCap,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastActions } from '../hooks/useToastActions';
import { courseApi } from '../services/api';
import { Course } from '../types/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

interface CourseStats {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageGrade: number;
  pendingAssignments: number;
  unreadMessages: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  disabled?: boolean;
}

// Mock course data - in real app this would come from API
const mockCourse: Course = {
  id: 'course-1',
  title: 'Advanced React Development',
  description: 'Master advanced React patterns, hooks, state management, and performance optimization techniques for building scalable web applications.',
  instructor: 'Dr. Jane Smith',
  students: 24,
  duration: '8 weeks',
  created_at: '2024-01-10T09:00:00Z',
  updated_at: '2024-01-15T14:30:00Z',
  is_published: true,
  category: 'Technology',
  level: 'advanced',
  enrollment_limit: 30
};

const mockStats: CourseStats = {
  totalStudents: 24,
  activeStudents: 22,
  completionRate: 78,
  averageGrade: 85,
  pendingAssignments: 8,
  unreadMessages: 3
};

export const TeacherCourseLanding: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, canCreateAssignments, canCreateCourses } = useAuth();
  const { showSuccess, showError, showInfo } = useToastActions();

  const [course, setCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    enrollment_limit: 30,
    is_published: false
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    sendEmail: true
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // In real app, this would fetch from API
        // const courseData = await courseApi.getCourse(courseId);
        
        // Using mock data for demo
        setCourse(mockCourse);
        setStats(mockStats);
        
        // Initialize edit form with course data
        setEditForm({
          title: mockCourse.title,
          description: mockCourse.description,
          category: mockCourse.category || '',
          level: mockCourse.level || 'beginner',
          duration: mockCourse.duration,
          enrollment_limit: mockCourse.enrollment_limit || 30,
          is_published: mockCourse.is_published || false
        });
      } catch (error) {
        console.error('Failed to fetch course:', error);
        showError('Failed to Load Course', 'Unable to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, showError]);

  const handleEditCourse = async () => {
    if (!course || !canCreateCourses) {
      showError('Permission Denied', 'You do not have permission to edit this course.');
      return;
    }

    try {
      const updatedCourse = await courseApi.updateCourse(course.id, editForm);
      setCourse(updatedCourse);
      setIsEditPanelOpen(false);
      showSuccess('Course Updated', 'Course information has been saved successfully.');
    } catch (error) {
      console.error('Failed to update course:', error);
      showError('Update Failed', 'Unable to save course changes.');
    }
  };

  const handleSendAnnouncement = async () => {
    if (!course) return;

    try {
      // In real app, this would call announcement API
      // await announcementApi.create({
      //   courseId: course.id,
      //   ...announcementForm
      // });

      showSuccess('Announcement Sent', `Announcement "${announcementForm.title}" has been sent to all students.`);
      setIsAnnouncementModalOpen(false);
      setAnnouncementForm({
        title: '',
        message: '',
        priority: 'normal',
        sendEmail: true
      });
    } catch (error) {
      console.error('Failed to send announcement:', error);
      showError('Send Failed', 'Unable to send announcement.');
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'edit-course',
      title: 'Edit Course',
      description: 'Update course information and settings',
      icon: Edit3,
      color: 'primary',
      action: () => setIsEditPanelOpen(true),
      disabled: !canCreateCourses
    },
    {
      id: 'add-module',
      title: 'Add Module',
      description: 'Create new learning module',
      icon: Plus,
      color: 'secondary',
      action: () => navigate(`/teach/course/${courseId}/modules`),
      disabled: !canCreateAssignments
    },
    {
      id: 'send-announcement',
      title: 'Send Announcement',
      description: 'Notify all students',
      icon: Send,
      color: 'accent',
      action: () => setIsAnnouncementModalOpen(true)
    },
    {
      id: 'create-assignment',
      title: 'Create Assignment',
      description: 'Add new assignment or project',
      icon: FileText,
      color: 'warning',
      action: () => navigate(`/teach/course/${courseId}/assignments`),
      disabled: !canCreateAssignments
    },
    {
      id: 'create-test',
      title: 'Create Test',
      description: 'Design quiz or examination',
      icon: ClipboardList,
      color: 'error',
      action: () => navigate(`/teach/course/${courseId}/quizzes`),
      disabled: !canCreateAssignments
    }
  ];

  const getActionButtonClass = (color: string, disabled?: boolean) => {
    const baseClass = 'flex flex-col items-center p-space-6 rounded-radius-xl border-2 transition-all duration-200 hover:shadow-md';
    
    if (disabled) {
      return `${baseClass} border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed`;
    }

    const colorClasses = {
      primary: 'border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700 hover:border-primary-300',
      secondary: 'border-secondary-200 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 hover:border-secondary-300',
      accent: 'border-accent-200 bg-accent-50 hover:bg-accent-100 text-accent-700 hover:border-accent-300',
      warning: 'border-warning-200 bg-warning-50 hover:bg-warning-100 text-warning-700 hover:border-warning-300',
      error: 'border-error-200 bg-error-50 hover:bg-error-100 text-error-700 hover:border-error-300'
    };

    return `${baseClass} ${colorClasses[color as keyof typeof colorClasses]} cursor-pointer`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" message="Loading course..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-space-12">
        <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-space-4" />
        <h2 className="heading-2">Course Not Found</h2>
        <p className="body-text">The course you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-space-8">
      {/* Course Banner */}
      <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 rounded-radius-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative p-space-8 text-neutral-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-space-3 mb-space-4">
                <h1 className="heading-1 text-neutral-0 mb-0">{course.title}</h1>
                <div className="flex items-center space-x-space-2">
                  {course.is_published ? (
                    <div className="flex items-center space-x-space-1 bg-success-500 px-space-3 py-space-1 rounded-full">
                      <Eye className="w-4 h-4" />
                      <span className="text-scale-sm font-weight-medium">Published</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-space-1 bg-warning-500 px-space-3 py-space-1 rounded-full">
                      <EyeOff className="w-4 h-4" />
                      <span className="text-scale-sm font-weight-medium">Draft</span>
                    </div>
                  )}
                  <span className="badge bg-neutral-0 bg-opacity-20 text-neutral-0 border border-neutral-0 border-opacity-30">
                    {course.level}
                  </span>
                </div>
              </div>
              
              <p className="text-scale-lg text-neutral-100 mb-space-6 max-w-3xl">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-space-8 text-neutral-200">
                <div className="flex items-center space-x-space-2">
                  <Users className="w-5 h-5" />
                  <span>{course.students} / {course.enrollment_limit} students</span>
                </div>
                <div className="flex items-center space-x-space-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-space-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.category}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-scale-sm text-neutral-200 mb-space-1">Course ID</div>
              <div className="font-mono text-neutral-0">{course.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Active Students</p>
                <p className="stats-value">{stats.activeStudents}/{stats.totalStudents}</p>
              </div>
              <div className="stats-icon stats-icon-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Completion Rate</p>
                <p className="stats-value">{stats.completionRate}%</p>
              </div>
              <div className="stats-icon stats-icon-secondary">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Average Grade</p>
                <p className="stats-value">{stats.averageGrade}%</p>
              </div>
              <div className="stats-icon stats-icon-warning">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Pending Reviews</p>
                <p className="stats-value">{stats.pendingAssignments}</p>
              </div>
              <div className="stats-icon stats-icon-accent">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="heading-2 mb-space-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-space-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                disabled={action.disabled}
                className={getActionButtonClass(action.color, action.disabled)}
                title={action.disabled ? 'You do not have permission for this action' : action.description}
              >
                <Icon className="w-8 h-8 mb-space-3" />
                <h3 className="font-weight-bold text-scale-sm mb-space-1">{action.title}</h3>
                <p className="text-scale-xs text-center leading-tight">{action.description}</p>
                {action.disabled && (
                  <AlertCircle className="w-4 h-4 mt-space-2 opacity-50" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-6">
        <div 
          onClick={() => navigate(`/teach/course/${courseId}/modules`)}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-body">
            <div className="flex items-center space-x-space-3 mb-space-4">
              <div className="w-12 h-12 bg-primary-100 rounded-radius-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-weight-bold text-neutral-900">Course Modules</h3>
                <p className="text-scale-sm text-neutral-600">Manage learning content</p>
              </div>
            </div>
            <p className="text-scale-sm text-neutral-500">
              View and organize course modules, lessons, and learning materials.
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate(`/teach/course/${courseId}/assignments`)}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-body">
            <div className="flex items-center space-x-space-3 mb-space-4">
              <div className="w-12 h-12 bg-warning-100 rounded-radius-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="font-weight-bold text-neutral-900">Assignments</h3>
                <p className="text-scale-sm text-neutral-600">Create and manage assignments</p>
              </div>
            </div>
            <p className="text-scale-sm text-neutral-500">
              Create assignments, track submissions, and manage grading.
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate(`/teach/course/${courseId}/quizzes`)}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-body">
            <div className="flex items-center space-x-space-3 mb-space-4">
              <div className="w-12 h-12 bg-error-100 rounded-radius-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <h3 className="font-weight-bold text-neutral-900">Quizzes & Tests</h3>
                <p className="text-scale-sm text-neutral-600">Create and manage assessments</p>
              </div>
            </div>
            <p className="text-scale-sm text-neutral-500">
              Design quizzes, set time limits, and track student performance.
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate(`/teach/course/${courseId}/analytics`)}
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-body">
            <div className="flex items-center space-x-space-3 mb-space-4">
              <div className="w-12 h-12 bg-accent-100 rounded-radius-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-weight-bold text-neutral-900">Course Analytics</h3>
                <p className="text-scale-sm text-neutral-600">Performance insights</p>
              </div>
            </div>
            <p className="text-scale-sm text-neutral-500">
              Detailed analytics on student engagement and course effectiveness.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Course Side Panel */}
      {isEditPanelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setIsEditPanelOpen(false)}
          />
          <div className="w-96 bg-neutral-0 shadow-xl overflow-y-auto">
            <div className="p-space-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="heading-3 mb-0">Edit Course</h3>
                <button
                  onClick={() => setIsEditPanelOpen(false)}
                  className="p-space-2 text-neutral-400 hover:text-neutral-600 rounded-radius-md hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-space-6 space-y-space-4">
              <div>
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-space-3">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value as any }))}
                    className="form-input"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-space-3">
                <div>
                  <label className="form-label">Duration</label>
                  <select
                    value={editForm.duration}
                    onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="form-input"
                  >
                    <option value="4 weeks">4 weeks</option>
                    <option value="6 weeks">6 weeks</option>
                    <option value="8 weeks">8 weeks</option>
                    <option value="10 weeks">10 weeks</option>
                    <option value="12 weeks">12 weeks</option>
                    <option value="16 weeks">16 weeks</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Enrollment Limit</label>
                  <input
                    type="number"
                    value={editForm.enrollment_limit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, enrollment_limit: parseInt(e.target.value) || 30 }))}
                    min="1"
                    max="200"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-space-3">
                <input
                  type="checkbox"
                  id="is-published"
                  checked={editForm.is_published}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is-published" className="text-scale-sm font-weight-medium">
                  Published (visible to students)
                </label>
              </div>
            </div>
            
            <div className="p-space-6 border-t border-neutral-200">
              <div className="flex space-x-space-3">
                <button
                  onClick={() => setIsEditPanelOpen(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCourse}
                  className="btn-primary flex-1 flex items-center justify-center space-x-space-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Send Announcement"
        size="md"
      >
        <div className="space-y-space-4">
          <div>
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Important Update on Assignment Due Date"
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Message</label>
            <textarea
              value={announcementForm.message}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your announcement message..."
              className="form-input h-32 resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-space-4">
            <div>
              <label className="form-label">Priority</label>
              <select
                value={announcementForm.priority}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value as any }))}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-space-2 pt-space-6">
              <input
                type="checkbox"
                id="send-email"
                checked={announcementForm.sendEmail}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="send-email" className="text-scale-sm">
                Send email notification
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-space-4 border-t border-neutral-200">
            <button
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSendAnnouncement}
              disabled={!announcementForm.title.trim() || !announcementForm.message.trim()}
              className="btn-primary disabled:opacity-50 flex items-center space-x-space-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Announcement</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
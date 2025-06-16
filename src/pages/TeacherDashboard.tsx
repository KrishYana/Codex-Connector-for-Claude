import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  Plus, 
  AlertCircle,
  GraduationCap,
  FileText,
  CheckCircle,
  ArrowRight,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { useToastActions } from '../hooks/useToastActions';
import { courseApi, assignmentApi } from '../services/api';
import { Course, Assignment } from '../types/auth';
import { ErrorTestButton } from '../components/ErrorTestButton';
import { SkeletonStats, SkeletonList } from '../components/skeletons';
import { Modal } from '../components/Modal';
import { CourseWizard, AIQuickStart } from '../components/CourseWizard';

interface ClassProgress {
  id: string;
  title: string;
  students: number;
  completionRate: number;
  averageGrade: number;
  lastActivity: string;
  color: string;
}

interface PendingSubmission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  courseName: string;
  submittedAt: string;
  timeAgo: string;
}

interface StudentMessage {
  id: string;
  studentName: string;
  subject: string;
  preview: string;
  timestamp: string;
  isUnread: boolean;
  avatar?: string;
}

// Mock data for demo
const mockClasses: ClassProgress[] = [
  {
    id: 'class-1',
    title: 'Advanced React',
    students: 24,
    completionRate: 78,
    averageGrade: 85,
    lastActivity: '2 hours ago',
    color: 'primary'
  },
  {
    id: 'class-2',
    title: 'JavaScript Fundamentals',
    students: 32,
    completionRate: 92,
    averageGrade: 88,
    lastActivity: '1 hour ago',
    color: 'secondary'
  },
  {
    id: 'class-3',
    title: 'Web Design Principles',
    students: 18,
    completionRate: 65,
    averageGrade: 82,
    lastActivity: '4 hours ago',
    color: 'accent'
  },
  {
    id: 'class-4',
    title: 'Database Systems',
    students: 28,
    completionRate: 71,
    averageGrade: 79,
    lastActivity: '3 hours ago',
    color: 'warning'
  }
];

const mockPendingSubmissions: PendingSubmission[] = [
  {
    id: 'sub-1',
    studentName: 'Sarah Johnson',
    assignmentTitle: 'React Components Project',
    courseName: 'Advanced React',
    submittedAt: '2024-01-15T14:30:00Z',
    timeAgo: '15 minutes ago'
  },
  {
    id: 'sub-2',
    studentName: 'Mike Chen',
    assignmentTitle: 'JavaScript Quiz #3',
    courseName: 'JavaScript Fundamentals',
    submittedAt: '2024-01-15T13:45:00Z',
    timeAgo: '1 hour ago'
  },
  {
    id: 'sub-3',
    studentName: 'Emily Davis',
    assignmentTitle: 'CSS Grid Layout',
    courseName: 'Web Design Principles',
    submittedAt: '2024-01-15T12:20:00Z',
    timeAgo: '2 hours ago'
  },
  {
    id: 'sub-4',
    studentName: 'Alex Rodriguez',
    assignmentTitle: 'Database Design Project',
    courseName: 'Database Systems',
    submittedAt: '2024-01-15T11:15:00Z',
    timeAgo: '3 hours ago'
  }
];

const mockMessages: StudentMessage[] = [
  {
    id: 'msg-1',
    studentName: 'Jessica Wong',
    subject: 'Question about useEffect dependencies',
    preview: 'Hi Professor, I\'m having trouble understanding when to include dependencies...',
    timestamp: '2024-01-15T14:45:00Z',
    isUnread: true
  },
  {
    id: 'msg-2',
    studentName: 'David Kim',
    subject: 'Assignment extension request',
    preview: 'Could I please get an extension on the React project? I\'ve been...',
    timestamp: '2024-01-15T13:30:00Z',
    isUnread: true
  },
  {
    id: 'msg-3',
    studentName: 'Maria Garcia',
    subject: 'Office hours availability',
    preview: 'Are you available for office hours this Thursday? I need help with...',
    timestamp: '2024-01-15T12:15:00Z',
    isUnread: false
  }
];

// Progress Ring Component
const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
}> = ({ 
  progress, 
  size = 80, 
  strokeWidth = 8, 
  color = 'primary',
  showPercentage = true 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    warning: 'text-warning-500',
    success: 'text-success-500'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-neutral-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500 ease-in-out`}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-scale-sm font-weight-bold text-neutral-700">
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
};

// Student Messages Tray Component
const StudentMessagesTray: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(mockMessages);
  const [replyText, setReplyText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const unreadCount = messages.filter(msg => msg.isUnread).length;

  const handleReply = (messageId: string) => {
    if (replyText.trim()) {
      // In real app, this would send the reply
      console.log('Replying to message:', messageId, 'with:', replyText);
      setReplyText('');
      setSelectedMessage(null);
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isUnread: false } : msg
    ));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed bottom-space-4 right-space-4 w-80 bg-neutral-0 rounded-radius-lg shadow-xl border border-neutral-200 z-40">
      {/* Tray Header */}
      <div 
        className="flex items-center justify-between p-space-4 border-b border-neutral-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-space-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h3 className="font-weight-medium text-neutral-900">Student Messages</h3>
          {unreadCount > 0 && (
            <span className="bg-error-500 text-neutral-0 text-scale-xs px-space-2 py-space-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        )}
      </div>

      {/* Tray Content */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-space-6 text-center">
              <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto mb-space-2" />
              <p className="text-scale-sm text-neutral-500">No messages</p>
            </div>
          ) : (
            <div className="space-y-space-1">
              {messages.map((message) => (
                <div key={message.id} className="border-b border-neutral-100 last:border-b-0">
                  <div 
                    className={`p-space-4 hover:bg-neutral-50 cursor-pointer ${
                      message.isUnread ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => {
                      markAsRead(message.id);
                      setSelectedMessage(selectedMessage === message.id ? null : message.id);
                    }}
                  >
                    <div className="flex items-start justify-between mb-space-2">
                      <div className="flex items-center space-x-space-2">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <span className="text-scale-xs text-neutral-0 font-weight-medium">
                            {message.studentName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-weight-medium text-neutral-900 text-scale-sm">
                          {message.studentName}
                        </span>
                        {message.isUnread && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-scale-xs text-neutral-500">
                        {formatTimeAgo(message.timestamp)}
                      </span>
                    </div>
                    <h4 className="font-weight-medium text-neutral-800 text-scale-sm mb-space-1">
                      {message.subject}
                    </h4>
                    <p className="text-scale-xs text-neutral-600 line-clamp-2">
                      {message.preview}
                    </p>
                  </div>

                  {/* Quick Reply */}
                  {selectedMessage === message.id && (
                    <div className="p-space-4 bg-neutral-50 border-t border-neutral-200">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="form-input w-full h-20 resize-none text-scale-sm"
                      />
                      <div className="flex items-center justify-end space-x-space-2 mt-space-2">
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="text-scale-sm text-neutral-500 hover:text-neutral-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(message.id)}
                          disabled={!replyText.trim()}
                          className="btn-primary text-scale-sm py-space-1 px-space-3 disabled:opacity-50"
                        >
                          <Send className="w-3 h-3 mr-space-1" />
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TeacherDashboard: React.FC = () => {
  const { user, canCreateCourses, canCreateAssignments } = useAuth();
  const { showCourseCreated, showError, showGradingComplete, showSuccess } = useToastActions();
  const coursesApi = useApi<Course[]>();
  const assignmentsApi = useApi<Assignment[]>();
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAIQuickStartOpen, setIsAIQuickStartOpen] = useState(false);
  const [classes] = useState(mockClasses);
  const [pendingSubmissions] = useState(mockPendingSubmissions);

  useEffect(() => {
    // Load dashboard data
    coursesApi.execute(() => courseApi.getCourses());
    assignmentsApi.execute(() => assignmentApi.getAssignments());

    // Simulate loading states
    setTimeout(() => setIsStatsLoading(false), 1500);
    setTimeout(() => setIsActivityLoading(false), 2000);
  }, []);

  const handleCreateCourse = async (courseData: any) => {
    if (!canCreateCourses) {
      showError('Permission Denied', 'You do not have permission to create courses');
      return;
    }
    
    try {
      const newCourse = await courseApi.createCourse({
        title: courseData.title,
        description: courseData.description,
        instructor: user?.name || '',
        students: 0,
        duration: courseData.duration,
      });
      
      // Refresh courses list
      coursesApi.execute(() => courseApi.getCourses());
      
      if (courseData.isPublished) {
        showCourseCreated(newCourse.title);
        // Redirect to course page
        setTimeout(() => {
          window.location.href = `/teach/course/${newCourse.id}`;
        }, 2000);
      } else {
        showSuccess('Course Draft Created', `"${newCourse.title}" has been saved as a draft.`);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      showError('Failed to Create Course', 'An error occurred while creating the course');
    }
  };

  const handleAIQuickStart = async (courseData: any) => {
    if (!canCreateCourses) {
      showError('Permission Denied', 'You do not have permission to create courses');
      return;
    }
    
    try {
      const newCourse = await courseApi.createCourse({
        title: courseData.title,
        description: courseData.description,
        instructor: user?.name || '',
        students: 0,
        duration: courseData.duration,
      });
      
      // Refresh courses list
      coursesApi.execute(() => courseApi.getCourses());
      showSuccess('AI Draft Ready', `"${newCourse.title}" has been created as a draft with AI-generated content.`);
    } catch (error) {
      console.error('Failed to create AI course:', error);
      showError('Failed to Create Course', 'An error occurred while creating the AI-generated course');
    }
  };

  const handleBulkGrading = () => {
    // Simulate bulk grading completion
    setTimeout(() => {
      showGradingComplete('JavaScript Fundamentals Quiz', 24);
    }, 2000);
  };

  const handleClassClick = (classId: string) => {
    // Navigate to class details
    window.location.href = `/teach/course/${classId}`;
  };

  const handleGradeSubmission = (submissionId: string) => {
    // Navigate to grading interface
    window.location.href = `/teach/assignments/grade/${submissionId}`;
  };

  return (
    <div className="space-y-space-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Welcome back, {user?.name}!</h1>
          <p className="body-text">Here's what's happening with your classes today</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-space-3">
          <ErrorTestButton />
          {canCreateAssignments && (
            <button 
              onClick={handleBulkGrading}
              className="btn-outline inline-flex items-center"
            >
              <FileText className="w-4 h-4 mr-space-2" />
              Grade Assignments
            </button>
          )}
        </div>
      </div>

      {/* Permission Notice */}
      {user?.course_role && (
        <div className="status-info">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-primary-600 mr-space-2" />
            <div>
              <p className="text-scale-sm font-weight-medium text-primary-800">
                Course Role: {user.course_role.replace('-', ' ')}
              </p>
              <p className="text-scale-xs text-primary-600 mt-space-1">
                {canCreateCourses && 'Can create courses and assignments. '}
                {canCreateAssignments && !canCreateCourses && 'Can create assignments. '}
                {!canCreateCourses && !canCreateAssignments && 'Limited to grading and viewing. '}
                Contact administrator for role changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {isStatsLoading ? (
        <SkeletonStats columns={4} showIcons={true} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Total Students</p>
                <p className="stats-value">156</p>
              </div>
              <div className="stats-icon stats-icon-secondary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Active Courses</p>
                <p className="stats-value">{classes.length}</p>
              </div>
              <div className="stats-icon stats-icon-primary">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Classes Today</p>
                <p className="stats-value">3</p>
              </div>
              <div className="stats-icon stats-icon-accent">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Avg. Performance</p>
                <p className="stats-value">85%</p>
              </div>
              <div className="stats-icon stats-icon-warning">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-6">
        {/* My Classes with Progress Rings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="heading-3 mb-0 flex items-center">
                <GraduationCap className="w-5 h-5 mr-space-2" />
                My Classes
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
                {classes.map((classItem) => (
                  <div 
                    key={classItem.id}
                    onClick={() => handleClassClick(classItem.id)}
                    className="p-space-4 border border-neutral-200 rounded-radius-lg hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-space-4">
                      <div className="flex-1">
                        <h3 className="font-weight-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                          {classItem.title}
                        </h3>
                        <p className="text-scale-sm text-neutral-600 mt-space-1">
                          {classItem.students} students
                        </p>
                      </div>
                      <ProgressRing 
                        progress={classItem.completionRate}
                        size={60}
                        strokeWidth={6}
                        color={classItem.color}
                      />
                    </div>
                    
                    <div className="space-y-space-2">
                      <div className="flex items-center justify-between text-scale-sm">
                        <span className="text-neutral-600">Average Grade</span>
                        <span className="font-weight-medium text-neutral-900">
                          {classItem.averageGrade}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-scale-sm">
                        <span className="text-neutral-600">Last Activity</span>
                        <span className="text-neutral-500">{classItem.lastActivity}</span>
                      </div>
                    </div>
                    
                    <div className="mt-space-3 pt-space-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <span className="text-scale-sm text-neutral-600">View Details</span>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Needs Grading */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="heading-3 mb-0 flex items-center">
                <FileText className="w-5 h-5 mr-space-2" />
                Needs Grading
                <span className="ml-space-2 bg-error-100 text-error-800 text-scale-xs px-space-2 py-space-1 rounded-full">
                  {pendingSubmissions.length}
                </span>
              </h2>
            </div>
            <div className="card-body">
              {pendingSubmissions.length === 0 ? (
                <div className="text-center py-space-6">
                  <CheckCircle className="w-8 h-8 text-success-500 mx-auto mb-space-2" />
                  <p className="text-scale-sm text-neutral-600">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-space-3">
                  {pendingSubmissions.map((submission) => (
                    <div 
                      key={submission.id}
                      onClick={() => handleGradeSubmission(submission.id)}
                      className="p-space-3 border border-neutral-200 rounded-radius-lg hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-space-2">
                        <div className="flex-1">
                          <h4 className="font-weight-medium text-neutral-900 text-scale-sm group-hover:text-primary-600 transition-colors">
                            {submission.assignmentTitle}
                          </h4>
                          <p className="text-scale-xs text-neutral-600">
                            {submission.courseName}
                          </p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-scale-xs text-neutral-600">
                          {submission.studentName}
                        </span>
                        <span className="text-scale-xs text-neutral-500">
                          {submission.timeAgo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <div className="card-header">
          <h2 className="heading-3 mb-0 flex items-center">
            <Clock className="w-5 h-5 mr-space-2" />
            Today's Schedule
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-4">
            <div className="flex items-center justify-between p-space-4 bg-secondary-50 rounded-radius-lg border border-secondary-200">
              <div>
                <h3 className="font-weight-bold text-secondary-800">Advanced React</h3>
                <p className="text-scale-sm text-secondary-600">Room 204 • 24 students</p>
              </div>
              <span className="badge badge-secondary">
                9:00 AM
              </span>
            </div>
            
            <div className="flex items-center justify-between p-space-4 bg-primary-50 rounded-radius-lg border border-primary-200">
              <div>
                <h3 className="font-weight-bold text-primary-800">JavaScript Fundamentals</h3>
                <p className="text-scale-sm text-primary-600">Room 101 • 32 students</p>
              </div>
              <span className="badge badge-primary">
                2:00 PM
              </span>
            </div>

            <div className="flex items-center justify-between p-space-4 bg-accent-50 rounded-radius-lg border border-accent-200">
              <div>
                <h3 className="font-weight-bold text-accent-800">Office Hours</h3>
                <p className="text-scale-sm text-accent-600">Office 305 • Open consultation</p>
              </div>
              <span className="badge badge-accent">
                4:00 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      {canCreateCourses && (
        <div className="fixed bottom-space-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-space-3 z-30">
          {/* AI Quick-Start Button */}
          <button
            onClick={() => setIsAIQuickStartOpen(true)}
            className="bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-600 hover:to-primary-600 text-neutral-0 p-space-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-space-2"
            title="AI Quick-Start Course Creation"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-weight-medium text-scale-sm">AI Quick-Start</span>
          </button>

          {/* Regular Course Creation Button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="bg-primary-500 hover:bg-primary-600 text-neutral-0 p-space-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-space-2"
            title="Create New Course"
          >
            <Plus className="w-6 h-6" />
            <span className="font-weight-medium">New Class</span>
          </button>
        </div>
      )}

      {/* Course Creation Modals */}
      <CourseWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateCourse}
      />

      <AIQuickStart
        isOpen={isAIQuickStartOpen}
        onClose={() => setIsAIQuickStartOpen(false)}
        onComplete={handleAIQuickStart}
      />

      {/* Student Messages Tray */}
      <StudentMessagesTray />

      {/* API Status */}
      {(coursesApi.error || assignmentsApi.error) && (
        <div className="status-error">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-error-600 mr-space-2" />
            <div>
              <p className="text-scale-sm font-weight-medium text-error-800">API Connection Error</p>
              <p className="text-scale-xs text-error-600 mt-space-1">
                {coursesApi.error || assignmentsApi.error} - Using demo mode
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
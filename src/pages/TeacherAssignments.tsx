import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Target,
  Timer,
  Upload,
  Link as LinkIcon,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastActions } from '../hooks/useToastActions';
import { assignmentApi } from '../services/api';
import { Assignment } from '../types/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface ExtendedAssignment extends Assignment {
  status: 'draft' | 'published';
  submitted_count: number;
  graded_count: number;
  visibility_start?: string;
  visibility_end?: string;
  time_limit?: number;
  submission_type: 'file' | 'text' | 'link' | 'quiz';
  rubric?: {
    criteria: {
      id: string;
      name: string;
      description: string;
      points: number;
    }[];
    total_points: number;
  };
}

interface AssignmentFormData {
  title: string;
  description: string;
  due_date: string;
  visibility_start: string;
  visibility_end: string;
  time_limit: number | null;
  submission_type: 'file' | 'text' | 'link' | 'quiz';
  max_points: number;
  instructions: string;
  rubric: {
    criteria: {
      id: string;
      name: string;
      description: string;
      points: number;
    }[];
  };
  allow_late_submissions: boolean;
  late_penalty: number;
  status: 'draft' | 'published';
}

// Mock assignments data
const mockAssignments: ExtendedAssignment[] = [
  {
    id: 'assignment-1',
    course_id: 'course-1',
    title: 'React Components Project',
    description: 'Build a complex React application using modern patterns and hooks',
    due_date: '2024-02-15T23:59:00Z',
    max_points: 100,
    created_at: '2024-01-10T09:00:00Z',
    status: 'published',
    submitted_count: 18,
    graded_count: 12,
    visibility_start: '2024-01-10T09:00:00Z',
    visibility_end: '2024-02-15T23:59:00Z',
    time_limit: null,
    submission_type: 'file',
    rubric: {
      criteria: [
        { id: 'c1', name: 'Code Quality', description: 'Clean, readable, and well-structured code', points: 30 },
        { id: 'c2', name: 'Functionality', description: 'All requirements implemented correctly', points: 40 },
        { id: 'c3', name: 'Design', description: 'User interface and user experience', points: 20 },
        { id: 'c4', name: 'Documentation', description: 'README and code comments', points: 10 }
      ],
      total_points: 100
    }
  },
  {
    id: 'assignment-2',
    course_id: 'course-1',
    title: 'JavaScript Quiz #3',
    description: 'Test your knowledge of advanced JavaScript concepts including closures, prototypes, and async programming',
    due_date: '2024-02-08T15:30:00Z',
    max_points: 50,
    created_at: '2024-01-15T14:30:00Z',
    status: 'published',
    submitted_count: 24,
    graded_count: 24,
    visibility_start: '2024-02-05T09:00:00Z',
    visibility_end: '2024-02-08T15:30:00Z',
    time_limit: 60,
    submission_type: 'quiz',
    rubric: {
      criteria: [
        { id: 'c1', name: 'Correctness', description: 'Accuracy of answers', points: 50 }
      ],
      total_points: 50
    }
  },
  {
    id: 'assignment-3',
    course_id: 'course-1',
    title: 'State Management Essay',
    description: 'Write a comprehensive analysis of different state management approaches in React applications',
    due_date: '2024-02-20T23:59:00Z',
    max_points: 75,
    created_at: '2024-01-20T10:15:00Z',
    status: 'draft',
    submitted_count: 0,
    graded_count: 0,
    visibility_start: '2024-02-10T09:00:00Z',
    visibility_end: '2024-02-20T23:59:00Z',
    time_limit: null,
    submission_type: 'text'
  }
];

// Assignment Creation Wizard Component
const AssignmentWizard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (assignmentData: AssignmentFormData) => void;
  courseId: string;
}> = ({ isOpen, onClose, onComplete, courseId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    due_date: '',
    visibility_start: '',
    visibility_end: '',
    time_limit: null,
    submission_type: 'file',
    max_points: 100,
    instructions: '',
    rubric: {
      criteria: [
        { id: 'c1', name: 'Quality', description: 'Overall quality of work', points: 50 },
        { id: 'c2', name: 'Completeness', description: 'All requirements met', points: 50 }
      ]
    },
    allow_late_submissions: true,
    late_penalty: 10,
    status: 'draft'
  });

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Assignment details and description', icon: FileText },
    { number: 2, title: 'Schedule', description: 'Due dates and visibility window', icon: Calendar },
    { number: 3, title: 'Submission', description: 'Submission type and requirements', icon: Upload },
    { number: 4, title: 'Rubric', description: 'Grading criteria and points', icon: Target },
    { number: 5, title: 'Publish', description: 'Review and publish assignment', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    onClose();
    resetWizard();
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      due_date: '',
      visibility_start: '',
      visibility_end: '',
      time_limit: null,
      submission_type: 'file',
      max_points: 100,
      instructions: '',
      rubric: {
        criteria: [
          { id: 'c1', name: 'Quality', description: 'Overall quality of work', points: 50 },
          { id: 'c2', name: 'Completeness', description: 'All requirements met', points: 50 }
        ]
      },
      allow_late_submissions: true,
      late_penalty: 10,
      status: 'draft'
    });
  };

  const addRubricCriterion = () => {
    const newCriterion = {
      id: `c${Date.now()}`,
      name: '',
      description: '',
      points: 10
    };
    setFormData(prev => ({
      ...prev,
      rubric: {
        criteria: [...prev.rubric.criteria, newCriterion]
      }
    }));
  };

  const removeRubricCriterion = (criterionId: string) => {
    if (formData.rubric.criteria.length > 1) {
      setFormData(prev => ({
        ...prev,
        rubric: {
          criteria: prev.rubric.criteria.filter(c => c.id !== criterionId)
        }
      }));
    }
  };

  const updateRubricCriterion = (criterionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      rubric: {
        criteria: prev.rubric.criteria.map(c =>
          c.id === criterionId ? { ...c, [field]: value } : c
        )
      }
    }));
  };

  const getTotalRubricPoints = () => {
    return formData.rubric.criteria.reduce((sum, criterion) => sum + criterion.points, 0);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim();
      case 2:
        return formData.due_date && formData.visibility_start && formData.visibility_end;
      case 3:
        return formData.submission_type && formData.max_points > 0;
      case 4:
        return formData.rubric.criteria.every(c => c.name.trim() && c.points > 0) && getTotalRubricPoints() === formData.max_points;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-space-4">
            <div>
              <label className="form-label">Assignment Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="e.g., React Components Project"
              />
            </div>
            
            <div>
              <label className="form-label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-input h-24 resize-none"
                placeholder="Describe what students need to do for this assignment..."
              />
            </div>
            
            <div>
              <label className="form-label">Detailed Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                className="form-input h-32 resize-none"
                placeholder="Provide step-by-step instructions, requirements, and any additional details..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-space-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              <div>
                <label className="form-label">Visibility Start *</label>
                <input
                  type="datetime-local"
                  value={formData.visibility_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility_start: e.target.value }))}
                  className="form-input"
                />
                <p className="text-scale-sm text-neutral-500 mt-space-1">
                  When students can first see this assignment
                </p>
              </div>
              
              <div>
                <label className="form-label">Due Date *</label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="form-input"
                />
                <p className="text-scale-sm text-neutral-500 mt-space-1">
                  When the assignment is due
                </p>
              </div>
            </div>
            
            <div>
              <label className="form-label">Visibility End *</label>
              <input
                type="datetime-local"
                value={formData.visibility_end}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility_end: e.target.value }))}
                className="form-input"
              />
              <p className="text-scale-sm text-neutral-500 mt-space-1">
                When students can no longer access this assignment
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              <div className="flex items-center space-x-space-3">
                <input
                  type="checkbox"
                  id="allow-late"
                  checked={formData.allow_late_submissions}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_late_submissions: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="allow-late" className="text-scale-sm font-weight-medium">
                  Allow late submissions
                </label>
              </div>
              
              {formData.allow_late_submissions && (
                <div>
                  <label className="form-label">Late Penalty (%)</label>
                  <input
                    type="number"
                    value={formData.late_penalty}
                    onChange={(e) => setFormData(prev => ({ ...prev, late_penalty: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-space-4">
            <div>
              <label className="form-label">Submission Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-3">
                {[
                  { value: 'file', label: 'File Upload', icon: Upload, description: 'Students upload files' },
                  { value: 'text', label: 'Text Entry', icon: FileText, description: 'Students type their response' },
                  { value: 'link', label: 'URL Link', icon: LinkIcon, description: 'Students submit a link' },
                  { value: 'quiz', label: 'Online Quiz', icon: GraduationCap, description: 'Multiple choice/short answer' }
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, submission_type: type.value as any }))}
                      className={`p-space-4 border-2 rounded-radius-lg transition-all text-left ${
                        formData.submission_type === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center space-x-space-3 mb-space-2">
                        <Icon className="w-5 h-5 text-primary-600" />
                        <span className="font-weight-medium">{type.label}</span>
                      </div>
                      <p className="text-scale-sm text-neutral-600">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              <div>
                <label className="form-label">Maximum Points *</label>
                <input
                  type="number"
                  value={formData.max_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_points: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="1000"
                  className="form-input"
                />
              </div>
              
              {(formData.submission_type === 'quiz' || formData.submission_type === 'text') && (
                <div>
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={formData.time_limit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || null }))}
                    min="1"
                    max="480"
                    className="form-input"
                    placeholder="No time limit"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-space-4">
            <div className="flex items-center justify-between">
              <h3 className="text-scale-lg font-weight-bold">Grading Rubric</h3>
              <button
                type="button"
                onClick={addRubricCriterion}
                className="btn-outline flex items-center space-x-space-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Criterion</span>
              </button>
            </div>
            
            <div className="space-y-space-3">
              {formData.rubric.criteria.map((criterion, index) => (
                <div key={criterion.id} className="p-space-4 border border-neutral-200 rounded-radius-lg">
                  <div className="flex items-center justify-between mb-space-3">
                    <h4 className="font-weight-medium">Criterion {index + 1}</h4>
                    {formData.rubric.criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRubricCriterion(criterion.id)}
                        className="text-error-500 hover:text-error-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-3">
                    <input
                      type="text"
                      value={criterion.name}
                      onChange={(e) => updateRubricCriterion(criterion.id, 'name', e.target.value)}
                      placeholder="Criterion name"
                      className="form-input"
                    />
                    
                    <input
                      type="text"
                      value={criterion.description}
                      onChange={(e) => updateRubricCriterion(criterion.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="form-input"
                    />
                    
                    <input
                      type="number"
                      value={criterion.points}
                      onChange={(e) => updateRubricCriterion(criterion.id, 'points', parseInt(e.target.value) || 0)}
                      min="1"
                      placeholder="Points"
                      className="form-input"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-neutral-50 border border-neutral-200 rounded-radius-lg p-space-4">
              <div className="flex items-center justify-between">
                <span className="font-weight-medium">Total Points:</span>
                <span className={`font-weight-bold ${
                  getTotalRubricPoints() === formData.max_points ? 'text-success-600' : 'text-error-600'
                }`}>
                  {getTotalRubricPoints()} / {formData.max_points}
                </span>
              </div>
              {getTotalRubricPoints() !== formData.max_points && (
                <p className="text-scale-sm text-error-600 mt-space-2">
                  Rubric total must equal maximum points
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-space-6">
            <div className="bg-neutral-50 rounded-radius-lg p-space-6">
              <h3 className="font-weight-bold text-neutral-900 mb-space-4">Assignment Summary</h3>
              <div className="space-y-space-3 text-scale-sm">
                <div><strong>Title:</strong> {formData.title}</div>
                <div><strong>Submission Type:</strong> {formData.submission_type}</div>
                <div><strong>Maximum Points:</strong> {formData.max_points}</div>
                <div><strong>Due Date:</strong> {new Date(formData.due_date).toLocaleString()}</div>
                <div><strong>Rubric Criteria:</strong> {formData.rubric.criteria.length}</div>
                {formData.time_limit && (
                  <div><strong>Time Limit:</strong> {formData.time_limit} minutes</div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-space-3">
              <input
                type="checkbox"
                id="publish-assignment"
                checked={formData.status === 'published'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="publish-assignment" className="text-scale-sm font-weight-medium">
                Publish assignment immediately
              </label>
            </div>
            
            <div className="bg-primary-50 border border-primary-200 rounded-radius-lg p-space-4">
              <p className="text-scale-sm text-primary-700">
                {formData.status === 'published' 
                  ? 'Your assignment will be published and visible to students immediately.'
                  : 'Your assignment will be saved as a draft. You can publish it later.'
                }
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Assignment"
      size="xl"
    >
      <div className="space-y-space-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'border-primary-500 bg-primary-500 text-neutral-0'
                    : 'border-neutral-300 text-neutral-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-space-2 ${
                    currentStep > step.number ? 'bg-primary-500' : 'bg-neutral-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Info */}
        <div className="text-center">
          <h3 className="heading-3 mb-space-1">{steps[currentStep - 1].title}</h3>
          <p className="text-scale-sm text-neutral-600">{steps[currentStep - 1].description}</p>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-space-4 border-t border-neutral-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-space-2"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            <span>Previous</span>
          </button>
          
          <span className="text-scale-sm text-neutral-500">
            Step {currentStep} of {steps.length}
          </span>
          
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-space-2"
            >
              <span>Next</span>
              <ChevronUp className="w-4 h-4 rotate-90" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!isStepValid()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formData.status === 'published' ? 'Create & Publish' : 'Create Draft'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export const TeacherAssignments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, canCreateAssignments } = useAuth();
  const { showSuccess, showError } = useToastActions();

  const [assignments, setAssignments] = useState<ExtendedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ExtendedAssignment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // In real app, this would fetch from API
        // const data = await assignmentApi.getAssignments(courseId);
        
        // Using mock data for demo
        const filteredAssignments = mockAssignments.filter(a => a.course_id === courseId);
        setAssignments(filteredAssignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        showError('Failed to Load Assignments', 'Unable to load assignments for this course.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId, showError]);

  const handleCreateAssignment = async (assignmentData: AssignmentFormData) => {
    if (!canCreateAssignments) {
      showError('Permission Denied', 'You do not have permission to create assignments.');
      return;
    }

    try {
      const newAssignment: ExtendedAssignment = {
        id: `assignment-${Date.now()}`,
        course_id: courseId!,
        title: assignmentData.title,
        description: assignmentData.description,
        due_date: assignmentData.due_date,
        max_points: assignmentData.max_points,
        created_at: new Date().toISOString(),
        status: assignmentData.status,
        submitted_count: 0,
        graded_count: 0,
        visibility_start: assignmentData.visibility_start,
        visibility_end: assignmentData.visibility_end,
        time_limit: assignmentData.time_limit,
        submission_type: assignmentData.submission_type,
        rubric: {
          criteria: assignmentData.rubric.criteria,
          total_points: assignmentData.max_points
        }
      };

      // In real app, this would call API
      // await assignmentApi.createAssignment(newAssignment);
      
      setAssignments(prev => [...prev, newAssignment]);
      
      if (assignmentData.status === 'published') {
        showSuccess('Assignment Published', `"${assignmentData.title}" is now visible to students.`);
      } else {
        showSuccess('Assignment Created', `"${assignmentData.title}" has been saved as a draft.`);
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
      showError('Creation Failed', 'Unable to create assignment.');
    }
  };

  const handleToggleStatus = async (assignment: ExtendedAssignment) => {
    if (!canCreateAssignments) {
      showError('Permission Denied', 'You do not have permission to modify assignments.');
      return;
    }

    try {
      const newStatus = assignment.status === 'published' ? 'draft' : 'published';
      
      // In real app, this would call API
      // await assignmentApi.updateAssignment(assignment.id, { status: newStatus });
      
      setAssignments(prev => prev.map(a => 
        a.id === assignment.id ? { ...a, status: newStatus } : a
      ));
      
      if (newStatus === 'published') {
        showSuccess('Assignment Published', `"${assignment.title}" is now visible to students.`);
      } else {
        showSuccess('Assignment Unpublished', `"${assignment.title}" is now hidden from students.`);
      }
    } catch (error) {
      console.error('Failed to update assignment status:', error);
      showError('Update Failed', 'Unable to update assignment status.');
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment || !canCreateAssignments) return;

    try {
      // In real app, this would call API
      // await assignmentApi.deleteAssignment(selectedAssignment.id);
      
      setAssignments(prev => prev.filter(a => a.id !== selectedAssignment.id));
      showSuccess('Assignment Deleted', `"${selectedAssignment.title}" has been deleted.`);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      showError('Delete Failed', 'Unable to delete assignment.');
    }
  };

  const toggleRowExpansion = (assignmentId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: 'draft' | 'published') => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center px-space-2 py-space-1 rounded-full text-scale-xs font-weight-medium bg-success-100 text-success-800">
          <Eye className="w-3 h-3 mr-space-1" />
          Published
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-space-2 py-space-1 rounded-full text-scale-xs font-weight-medium bg-warning-100 text-warning-800">
          <EyeOff className="w-3 h-3 mr-space-1" />
          Draft
        </span>
      );
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return <Upload className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'quiz': return <GraduationCap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" message="Loading assignments..." />
      </div>
    );
  }

  return (
    <div className="space-y-space-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Course Assignments</h1>
          <p className="body-text">Manage assignments, track submissions, and monitor grading progress</p>
        </div>
        
        {canCreateAssignments && (
          <button
            onClick={() => setIsWizardOpen(true)}
            className="btn-primary flex items-center space-x-space-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignments Table */}
      <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-space-12">
            <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-space-4" />
            <h3 className="heading-3">No Assignments Yet</h3>
            <p className="body-text mb-space-6">Create your first assignment to get started.</p>
            {canCreateAssignments && (
              <button
                onClick={() => setIsWizardOpen(true)}
                className="btn-primary"
              >
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Assignment
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Status
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Due Date
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Submitted
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Graded
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {assignments.map((assignment) => (
                  <React.Fragment key={assignment.id}>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-3">
                          <button
                            onClick={() => toggleRowExpansion(assignment.id)}
                            className="p-space-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                          >
                            {expandedRows.has(assignment.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex items-center space-x-space-2">
                            {getSubmissionTypeIcon(assignment.submission_type)}
                            <div>
                              <h3 className="font-weight-medium text-neutral-900">{assignment.title}</h3>
                              <p className="text-scale-sm text-neutral-600 truncate max-w-xs">
                                {assignment.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        {getStatusBadge(assignment.status)}
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-1 text-scale-sm text-neutral-700">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(assignment.due_date)}</span>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-1 text-scale-sm">
                          <Users className="w-4 h-4 text-neutral-500" />
                          <span className="font-weight-medium">{assignment.submitted_count}</span>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-1 text-scale-sm">
                          <CheckCircle className="w-4 h-4 text-success-500" />
                          <span className="font-weight-medium">{assignment.graded_count}</span>
                          <span className="text-neutral-500">/ {assignment.submitted_count}</span>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-2">
                          {canCreateAssignments && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(assignment)}
                                className={`p-space-2 rounded-radius-md transition-colors ${
                                  assignment.status === 'published'
                                    ? 'text-warning-600 hover:bg-warning-100'
                                    : 'text-success-600 hover:bg-success-100'
                                }`}
                                title={assignment.status === 'published' ? 'Unpublish' : 'Publish'}
                              >
                                {assignment.status === 'published' ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => navigate(`/teach/assignments/${assignment.id}/edit`)}
                                className="p-space-2 text-primary-600 hover:bg-primary-100 rounded-radius-md transition-colors"
                                title="Edit assignment"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-space-2 text-error-600 hover:bg-error-100 rounded-radius-md transition-colors"
                                title="Delete assignment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/teach/assignments/${assignment.id}/submissions`)}
                            className="p-space-2 text-neutral-600 hover:bg-neutral-100 rounded-radius-md transition-colors"
                            title="View submissions"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row Details */}
                    {expandedRows.has(assignment.id) && (
                      <tr>
                        <td colSpan={6} className="px-space-6 py-space-4 bg-neutral-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-4">
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Details</h4>
                              <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                <div>Max Points: {assignment.max_points}</div>
                                <div>Type: {assignment.submission_type}</div>
                                {assignment.time_limit && (
                                  <div>Time Limit: {assignment.time_limit} min</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Schedule</h4>
                              <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                <div>Visible: {formatDate(assignment.visibility_start || assignment.created_at)}</div>
                                <div>Due: {formatDate(assignment.due_date)}</div>
                                <div>Ends: {formatDate(assignment.visibility_end || assignment.due_date)}</div>
                              </div>
                            </div>
                            
                            {assignment.rubric && (
                              <div>
                                <h4 className="font-weight-medium text-neutral-900 mb-space-2">Rubric</h4>
                                <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                  <div>{assignment.rubric.criteria.length} criteria</div>
                                  <div>Total: {assignment.rubric.total_points} points</div>
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Progress</h4>
                              <div className="space-y-space-2">
                                <div className="flex justify-between text-scale-sm">
                                  <span>Submitted</span>
                                  <span>{assignment.submitted_count}</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary-500 h-2 rounded-full"
                                    style={{ width: `${(assignment.submitted_count / 30) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Creation Wizard */}
      <AssignmentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateAssignment}
        courseId={courseId!}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${selectedAssignment?.title}"? This action cannot be undone and will remove all associated submissions and grades.`}
        confirmText="Delete Assignment"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
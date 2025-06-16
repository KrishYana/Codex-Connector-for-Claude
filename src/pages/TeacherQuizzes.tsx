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
  Settings,
  Filter,
  Search,
  Play,
  Pause,
  Square,
  BarChart3,
  HelpCircle,
  Tag,
  Shuffle,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToastActions } from '../hooks/useToastActions';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string;
  instructions: string;
  start_date: string;
  end_date: string;
  duration: number; // in minutes
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_results: 'immediately' | 'after_due' | 'manual' | 'never';
  show_correct_answers: boolean;
  allow_review: boolean;
  status: 'draft' | 'active' | 'closed';
  question_count: number;
  submitted_count: number;
  graded_count: number;
  average_score: number;
  created_at: string;
  updated_at: string;
  question_pools: QuestionPool[];
}

interface QuestionPool {
  id: string;
  name: string;
  tags: string[];
  question_count: number;
  points_per_question: number;
  questions_to_select: number; // how many questions to randomly select from this pool
}

interface QuizFormData {
  title: string;
  description: string;
  instructions: string;
  start_date: string;
  end_date: string;
  duration: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_results: 'immediately' | 'after_due' | 'manual' | 'never';
  show_correct_answers: boolean;
  allow_review: boolean;
  question_pools: QuestionPool[];
  status: 'draft' | 'active';
}

// Mock quiz data
const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    course_id: 'course-1',
    title: 'React Fundamentals Quiz',
    description: 'Test your understanding of React basics including components, props, and state',
    instructions: 'Answer all questions to the best of your ability. You have 45 minutes to complete this quiz.',
    start_date: '2024-02-01T09:00:00Z',
    end_date: '2024-02-07T23:59:00Z',
    duration: 45,
    max_attempts: 2,
    shuffle_questions: true,
    shuffle_answers: true,
    show_results: 'immediately',
    show_correct_answers: true,
    allow_review: true,
    status: 'active',
    question_count: 15,
    submitted_count: 18,
    graded_count: 18,
    average_score: 82,
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
    question_pools: [
      {
        id: 'pool-1',
        name: 'React Basics',
        tags: ['react', 'components', 'props'],
        question_count: 20,
        points_per_question: 5,
        questions_to_select: 10
      },
      {
        id: 'pool-2',
        name: 'State Management',
        tags: ['state', 'hooks', 'useState'],
        question_count: 15,
        points_per_question: 10,
        questions_to_select: 5
      }
    ]
  },
  {
    id: 'quiz-2',
    course_id: 'course-1',
    title: 'JavaScript Advanced Concepts',
    description: 'Advanced JavaScript topics including closures, prototypes, and async programming',
    instructions: 'This is a comprehensive test covering advanced JavaScript concepts.',
    start_date: '2024-02-10T14:00:00Z',
    end_date: '2024-02-15T23:59:00Z',
    duration: 60,
    max_attempts: 1,
    shuffle_questions: false,
    shuffle_answers: true,
    show_results: 'after_due',
    show_correct_answers: false,
    allow_review: false,
    status: 'draft',
    question_count: 20,
    submitted_count: 0,
    graded_count: 0,
    average_score: 0,
    created_at: '2024-01-28T15:30:00Z',
    updated_at: '2024-01-28T15:30:00Z',
    question_pools: [
      {
        id: 'pool-3',
        name: 'Advanced Concepts',
        tags: ['closures', 'prototypes', 'async'],
        question_count: 25,
        points_per_question: 5,
        questions_to_select: 20
      }
    ]
  },
  {
    id: 'quiz-3',
    course_id: 'course-1',
    title: 'Midterm Examination',
    description: 'Comprehensive midterm covering all topics from weeks 1-4',
    instructions: 'This is your midterm examination. Read all questions carefully.',
    start_date: '2024-01-20T09:00:00Z',
    end_date: '2024-01-20T12:00:00Z',
    duration: 120,
    max_attempts: 1,
    shuffle_questions: true,
    shuffle_answers: true,
    show_results: 'manual',
    show_correct_answers: false,
    allow_review: false,
    status: 'closed',
    question_count: 30,
    submitted_count: 24,
    graded_count: 24,
    average_score: 78,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-20T12:00:00Z',
    question_pools: [
      {
        id: 'pool-4',
        name: 'Comprehensive Review',
        tags: ['all-topics', 'midterm'],
        question_count: 50,
        points_per_question: 3,
        questions_to_select: 30
      }
    ]
  }
];

// Mock question pools for selection
const mockQuestionPools: QuestionPool[] = [
  {
    id: 'pool-1',
    name: 'React Basics',
    tags: ['react', 'components', 'props'],
    question_count: 20,
    points_per_question: 5,
    questions_to_select: 10
  },
  {
    id: 'pool-2',
    name: 'State Management',
    tags: ['state', 'hooks', 'useState'],
    question_count: 15,
    points_per_question: 10,
    questions_to_select: 5
  },
  {
    id: 'pool-3',
    name: 'Advanced Concepts',
    tags: ['closures', 'prototypes', 'async'],
    question_count: 25,
    points_per_question: 5,
    questions_to_select: 20
  },
  {
    id: 'pool-4',
    name: 'Comprehensive Review',
    tags: ['all-topics', 'midterm'],
    question_count: 50,
    points_per_question: 3,
    questions_to_select: 30
  },
  {
    id: 'pool-5',
    name: 'CSS Fundamentals',
    tags: ['css', 'styling', 'layout'],
    question_count: 18,
    points_per_question: 4,
    questions_to_select: 12
  }
];

// Create Test Wizard Component
const CreateTestWizard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (quizData: QuizFormData) => void;
  courseId: string;
}> = ({ isOpen, onClose, onComplete, courseId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    instructions: '',
    start_date: '',
    end_date: '',
    duration: 60,
    max_attempts: 1,
    shuffle_questions: true,
    shuffle_answers: true,
    show_results: 'immediately',
    show_correct_answers: true,
    allow_review: true,
    question_pools: [],
    status: 'draft'
  });

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Quiz title and description', icon: FileText },
    { number: 2, title: 'Schedule', description: 'Start window and duration', icon: Calendar },
    { number: 3, title: 'Question Pools', description: 'Select question pools and tags', icon: Target },
    { number: 4, title: 'Settings', description: 'Quiz behavior and result visibility', icon: Settings },
    { number: 5, title: 'Review', description: 'Review and publish quiz', icon: CheckCircle }
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
      instructions: '',
      start_date: '',
      end_date: '',
      duration: 60,
      max_attempts: 1,
      shuffle_questions: true,
      shuffle_answers: true,
      show_results: 'immediately',
      show_correct_answers: true,
      allow_review: true,
      question_pools: [],
      status: 'draft'
    });
  };

  const addQuestionPool = (pool: QuestionPool) => {
    if (!formData.question_pools.find(p => p.id === pool.id)) {
      setFormData(prev => ({
        ...prev,
        question_pools: [...prev.question_pools, { ...pool }]
      }));
    }
  };

  const removeQuestionPool = (poolId: string) => {
    setFormData(prev => ({
      ...prev,
      question_pools: prev.question_pools.filter(p => p.id !== poolId)
    }));
  };

  const updateQuestionPool = (poolId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      question_pools: prev.question_pools.map(p =>
        p.id === poolId ? { ...p, [field]: value } : p
      )
    }));
  };

  const getTotalQuestions = () => {
    return formData.question_pools.reduce((sum, pool) => sum + pool.questions_to_select, 0);
  };

  const getTotalPoints = () => {
    return formData.question_pools.reduce((sum, pool) => sum + (pool.questions_to_select * pool.points_per_question), 0);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim();
      case 2:
        return formData.start_date && formData.end_date && formData.duration > 0;
      case 3:
        return formData.question_pools.length > 0;
      case 4:
        return true;
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
              <label className="form-label">Quiz Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="e.g., React Fundamentals Quiz"
              />
            </div>
            
            <div>
              <label className="form-label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-input h-24 resize-none"
                placeholder="Brief description of what this quiz covers..."
              />
            </div>
            
            <div>
              <label className="form-label">Instructions for Students</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                className="form-input h-32 resize-none"
                placeholder="Detailed instructions for students taking this quiz..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-space-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              <div>
                <label className="form-label">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="form-input"
                />
                <p className="text-scale-sm text-neutral-500 mt-space-1">
                  When students can start taking the quiz
                </p>
              </div>
              
              <div>
                <label className="form-label">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="form-input"
                />
                <p className="text-scale-sm text-neutral-500 mt-space-1">
                  Last chance to start the quiz
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
              <div>
                <label className="form-label">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="480"
                  className="form-input"
                />
                <p className="text-scale-sm text-neutral-500 mt-space-1">
                  Time limit for completing the quiz
                </p>
              </div>
              
              <div>
                <label className="form-label">Maximum Attempts</label>
                <select
                  value={formData.max_attempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) }))}
                  className="form-input"
                >
                  <option value={1}>1 attempt</option>
                  <option value={2}>2 attempts</option>
                  <option value={3}>3 attempts</option>
                  <option value={-1}>Unlimited</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-space-4">
            <div className="flex items-center justify-between">
              <h3 className="text-scale-lg font-weight-bold">Question Pools</h3>
              <div className="text-scale-sm text-neutral-600">
                Total: {getTotalQuestions()} questions, {getTotalPoints()} points
              </div>
            </div>
            
            {/* Available Pools */}
            <div>
              <h4 className="font-weight-medium mb-space-3">Available Question Pools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-3">
                {mockQuestionPools.map((pool) => (
                  <div 
                    key={pool.id}
                    className={`p-space-4 border-2 rounded-radius-lg transition-all cursor-pointer ${
                      formData.question_pools.find(p => p.id === pool.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => addQuestionPool(pool)}
                  >
                    <div className="flex items-center justify-between mb-space-2">
                      <h5 className="font-weight-medium">{pool.name}</h5>
                      <span className="text-scale-sm text-neutral-600">
                        {pool.question_count} questions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-space-1 mb-space-2">
                      {pool.tags.map((tag) => (
                        <span key={tag} className="badge badge-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-scale-sm text-neutral-600">
                      {pool.points_per_question} points per question
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected Pools */}
            {formData.question_pools.length > 0 && (
              <div>
                <h4 className="font-weight-medium mb-space-3">Selected Question Pools</h4>
                <div className="space-y-space-3">
                  {formData.question_pools.map((pool) => (
                    <div key={pool.id} className="p-space-4 border border-primary-200 bg-primary-50 rounded-radius-lg">
                      <div className="flex items-center justify-between mb-space-3">
                        <h5 className="font-weight-medium text-primary-800">{pool.name}</h5>
                        <button
                          type="button"
                          onClick={() => removeQuestionPool(pool.id)}
                          className="text-error-500 hover:text-error-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-3">
                        <div>
                          <label className="form-label">Questions to Select</label>
                          <input
                            type="number"
                            value={pool.questions_to_select}
                            onChange={(e) => updateQuestionPool(pool.id, 'questions_to_select', parseInt(e.target.value) || 0)}
                            min="1"
                            max={pool.question_count}
                            className="form-input"
                          />
                          <p className="text-scale-xs text-neutral-500 mt-space-1">
                            Max: {pool.question_count}
                          </p>
                        </div>
                        
                        <div>
                          <label className="form-label">Points per Question</label>
                          <input
                            type="number"
                            value={pool.points_per_question}
                            onChange={(e) => updateQuestionPool(pool.id, 'points_per_question', parseInt(e.target.value) || 0)}
                            min="1"
                            className="form-input"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <div className="text-scale-sm text-neutral-600">
                            <div>Total: {pool.questions_to_select * pool.points_per_question} points</div>
                            <div className="flex flex-wrap gap-space-1 mt-space-1">
                              {pool.tags.map((tag) => (
                                <span key={tag} className="badge badge-primary text-scale-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-space-6">
            <div>
              <h3 className="text-scale-lg font-weight-bold mb-space-4">Quiz Behavior</h3>
              <div className="space-y-space-4">
                <div className="flex items-center space-x-space-3">
                  <input
                    type="checkbox"
                    id="shuffle-questions"
                    checked={formData.shuffle_questions}
                    onChange={(e) => setFormData(prev => ({ ...prev, shuffle_questions: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="shuffle-questions" className="text-scale-sm font-weight-medium">
                    Shuffle question order for each student
                  </label>
                </div>
                
                <div className="flex items-center space-x-space-3">
                  <input
                    type="checkbox"
                    id="shuffle-answers"
                    checked={formData.shuffle_answers}
                    onChange={(e) => setFormData(prev => ({ ...prev, shuffle_answers: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="shuffle-answers" className="text-scale-sm font-weight-medium">
                    Shuffle answer choices for multiple choice questions
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-scale-lg font-weight-bold mb-space-4">Result Visibility</h3>
              <div className="space-y-space-3">
                <div>
                  <label className="form-label">When to show results</label>
                  <select
                    value={formData.show_results}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_results: e.target.value as any }))}
                    className="form-input"
                  >
                    <option value="immediately">Immediately after submission</option>
                    <option value="after_due">After due date</option>
                    <option value="manual">Manual release by instructor</option>
                    <option value="never">Never show results</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-space-3">
                  <input
                    type="checkbox"
                    id="show-correct-answers"
                    checked={formData.show_correct_answers}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_correct_answers: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="show-correct-answers" className="text-scale-sm font-weight-medium">
                    Show correct answers to students
                  </label>
                </div>
                
                <div className="flex items-center space-x-space-3">
                  <input
                    type="checkbox"
                    id="allow-review"
                    checked={formData.allow_review}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_review: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="allow-review" className="text-scale-sm font-weight-medium">
                    Allow students to review their answers
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-space-6">
            <div className="bg-neutral-50 rounded-radius-lg p-space-6">
              <h3 className="font-weight-bold text-neutral-900 mb-space-4">Quiz Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4 text-scale-sm">
                <div className="space-y-space-2">
                  <div><strong>Title:</strong> {formData.title}</div>
                  <div><strong>Duration:</strong> {formData.duration} minutes</div>
                  <div><strong>Max Attempts:</strong> {formData.max_attempts === -1 ? 'Unlimited' : formData.max_attempts}</div>
                  <div><strong>Total Questions:</strong> {getTotalQuestions()}</div>
                  <div><strong>Total Points:</strong> {getTotalPoints()}</div>
                </div>
                <div className="space-y-space-2">
                  <div><strong>Start:</strong> {new Date(formData.start_date).toLocaleString()}</div>
                  <div><strong>End:</strong> {new Date(formData.end_date).toLocaleString()}</div>
                  <div><strong>Question Pools:</strong> {formData.question_pools.length}</div>
                  <div><strong>Show Results:</strong> {formData.show_results.replace('_', ' ')}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-space-3">
              <input
                type="checkbox"
                id="publish-quiz"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'draft' }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="publish-quiz" className="text-scale-sm font-weight-medium">
                Publish quiz immediately (make available to students)
              </label>
            </div>
            
            <div className="bg-primary-50 border border-primary-200 rounded-radius-lg p-space-4">
              <p className="text-scale-sm text-primary-700">
                {formData.status === 'active' 
                  ? 'Your quiz will be published and available to students according to the schedule.'
                  : 'Your quiz will be saved as a draft. You can publish it later.'
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
      title="Create Test"
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
              {formData.status === 'active' ? 'Create & Publish' : 'Create Draft'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export const TeacherQuizzes: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, canCreateAssignments } = useAuth();
  const { showSuccess, showError } = useToastActions();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // In real app, this would fetch from API
        const filteredQuizzes = mockQuizzes.filter(q => q.course_id === courseId);
        setQuizzes(filteredQuizzes);
        setFilteredQuizzes(filteredQuizzes);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        showError('Failed to Load Quizzes', 'Unable to load quizzes for this course.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId, showError]);

  // Filter quizzes based on status and search
  useEffect(() => {
    let filtered = quizzes;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query)
      );
    }

    setFilteredQuizzes(filtered);
  }, [quizzes, activeFilter, searchQuery]);

  const handleCreateQuiz = async (quizData: QuizFormData) => {
    if (!canCreateAssignments) {
      showError('Permission Denied', 'You do not have permission to create quizzes.');
      return;
    }

    try {
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        course_id: courseId!,
        title: quizData.title,
        description: quizData.description,
        instructions: quizData.instructions,
        start_date: quizData.start_date,
        end_date: quizData.end_date,
        duration: quizData.duration,
        max_attempts: quizData.max_attempts,
        shuffle_questions: quizData.shuffle_questions,
        shuffle_answers: quizData.shuffle_answers,
        show_results: quizData.show_results,
        show_correct_answers: quizData.show_correct_answers,
        allow_review: quizData.allow_review,
        status: quizData.status,
        question_count: quizData.question_pools.reduce((sum, pool) => sum + pool.questions_to_select, 0),
        submitted_count: 0,
        graded_count: 0,
        average_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        question_pools: quizData.question_pools
      };

      setQuizzes(prev => [...prev, newQuiz]);
      
      if (quizData.status === 'active') {
        showSuccess('Quiz Published', `"${quizData.title}" is now available to students.`);
      } else {
        showSuccess('Quiz Created', `"${quizData.title}" has been saved as a draft.`);
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
      showError('Creation Failed', 'Unable to create quiz.');
    }
  };

  const handleToggleStatus = async (quiz: Quiz) => {
    if (!canCreateAssignments) {
      showError('Permission Denied', 'You do not have permission to modify quizzes.');
      return;
    }

    try {
      let newStatus: Quiz['status'];
      if (quiz.status === 'draft') {
        newStatus = 'active';
      } else if (quiz.status === 'active') {
        newStatus = 'closed';
      } else {
        newStatus = 'active'; // reopen closed quiz
      }
      
      setQuizzes(prev => prev.map(q => 
        q.id === quiz.id ? { ...q, status: newStatus } : q
      ));
      
      if (newStatus === 'active') {
        showSuccess('Quiz Published', `"${quiz.title}" is now available to students.`);
      } else if (newStatus === 'closed') {
        showSuccess('Quiz Closed', `"${quiz.title}" is no longer available to students.`);
      }
    } catch (error) {
      console.error('Failed to update quiz status:', error);
      showError('Update Failed', 'Unable to update quiz status.');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz || !canCreateAssignments) return;

    try {
      setQuizzes(prev => prev.filter(q => q.id !== selectedQuiz.id));
      showSuccess('Quiz Deleted', `"${selectedQuiz.title}" has been deleted.`);
      setSelectedQuiz(null);
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      showError('Delete Failed', 'Unable to delete quiz.');
    }
  };

  const toggleRowExpansion = (quizId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
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

  const getStatusBadge = (status: Quiz['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-space-2 py-space-1 rounded-full text-scale-xs font-weight-medium bg-success-100 text-success-800">
            <Play className="w-3 h-3 mr-space-1" />
            Active
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-space-2 py-space-1 rounded-full text-scale-xs font-weight-medium bg-error-100 text-error-800">
            <Square className="w-3 h-3 mr-space-1" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-space-2 py-space-1 rounded-full text-scale-xs font-weight-medium bg-warning-100 text-warning-800">
            <Pause className="w-3 h-3 mr-space-1" />
            Draft
          </span>
        );
    }
  };

  const getStatusIcon = (status: Quiz['status']) => {
    switch (status) {
      case 'active':
        return <Unlock className="w-4 h-4 text-success-600" />;
      case 'closed':
        return <Lock className="w-4 h-4 text-error-600" />;
      default:
        return <EyeOff className="w-4 h-4 text-warning-600" />;
    }
  };

  const filterCounts = {
    all: quizzes.length,
    draft: quizzes.filter(q => q.status === 'draft').length,
    active: quizzes.filter(q => q.status === 'active').length,
    closed: quizzes.filter(q => q.status === 'closed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" message="Loading quizzes..." />
      </div>
    );
  }

  return (
    <div className="space-y-space-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Course Quizzes</h1>
          <p className="body-text">Create and manage quizzes, track student progress, and analyze results</p>
        </div>
        
        {canCreateAssignments && (
          <button
            onClick={() => setIsWizardOpen(true)}
            className="btn-primary flex items-center space-x-space-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-space-2">
          {(['all', 'draft', 'active', 'closed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-space-3 py-space-2 rounded-radius-md text-scale-sm font-weight-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-primary-500 text-neutral-0'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-space-1 text-scale-xs opacity-75">
                ({filterCounts[filter]})
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-space-3">
          <div className="relative">
            <Search className="absolute left-space-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quizzes..."
              className="form-input pl-space-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-neutral-0 rounded-radius-lg border border-neutral-200 overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-space-12">
            <GraduationCap className="w-16 h-16 text-neutral-400 mx-auto mb-space-4" />
            <h3 className="heading-3">
              {searchQuery ? 'No quizzes found' : activeFilter === 'all' ? 'No Quizzes Yet' : `No ${activeFilter} quizzes`}
            </h3>
            <p className="body-text mb-space-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : activeFilter === 'all' 
                ? 'Create your first quiz to get started.'
                : `No quizzes with ${activeFilter} status found.`
              }
            </p>
            {canCreateAssignments && !searchQuery && activeFilter === 'all' && (
              <button
                onClick={() => setIsWizardOpen(true)}
                className="btn-primary"
              >
                Create Test
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Quiz
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Status
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Schedule
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Submitted
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Average
                  </th>
                  <th className="px-space-6 py-space-4 text-left text-scale-sm font-weight-medium text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredQuizzes.map((quiz) => (
                  <React.Fragment key={quiz.id}>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-3">
                          <button
                            onClick={() => toggleRowExpansion(quiz.id)}
                            className="p-space-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                          >
                            {expandedRows.has(quiz.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex items-center space-x-space-2">
                            <GraduationCap className="w-4 h-4 text-primary-600" />
                            <div>
                              <h3 className="font-weight-medium text-neutral-900">{quiz.title}</h3>
                              <p className="text-scale-sm text-neutral-600 truncate max-w-xs">
                                {quiz.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        {getStatusBadge(quiz.status)}
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="text-scale-sm text-neutral-700">
                          <div className="flex items-center space-x-space-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(quiz.start_date)}</span>
                          </div>
                          <div className="flex items-center space-x-space-1 mt-space-1">
                            <Timer className="w-4 h-4" />
                            <span>{quiz.duration} min</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-1 text-scale-sm">
                          <Users className="w-4 h-4 text-neutral-500" />
                          <span className="font-weight-medium">{quiz.submitted_count}</span>
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="text-scale-sm font-weight-medium text-neutral-900">
                          {quiz.submitted_count > 0 ? `${quiz.average_score}%` : '-'}
                        </div>
                      </td>
                      <td className="px-space-6 py-space-4">
                        <div className="flex items-center space-x-space-2">
                          {canCreateAssignments && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(quiz)}
                                className="p-space-2 rounded-radius-md transition-colors"
                                title={
                                  quiz.status === 'draft' ? 'Publish quiz' :
                                  quiz.status === 'active' ? 'Close quiz' : 'Reopen quiz'
                                }
                              >
                                {getStatusIcon(quiz.status)}
                              </button>
                              <button
                                onClick={() => navigate(`/teach/quizzes/${quiz.id}/edit`)}
                                className="p-space-2 text-primary-600 hover:bg-primary-100 rounded-radius-md transition-colors"
                                title="Edit quiz"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedQuiz(quiz);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="p-space-2 text-error-600 hover:bg-error-100 rounded-radius-md transition-colors"
                                title="Delete quiz"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/teach/quizzes/${quiz.id}/results`)}
                            className="p-space-2 text-neutral-600 hover:bg-neutral-100 rounded-radius-md transition-colors"
                            title="View results"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row Details */}
                    {expandedRows.has(quiz.id) && (
                      <tr>
                        <td colSpan={6} className="px-space-6 py-space-4 bg-neutral-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-4">
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Quiz Details</h4>
                              <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                <div>Questions: {quiz.question_count}</div>
                                <div>Max Attempts: {quiz.max_attempts === -1 ? 'Unlimited' : quiz.max_attempts}</div>
                                <div>Duration: {quiz.duration} minutes</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Schedule</h4>
                              <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                <div>Opens: {formatDate(quiz.start_date)}</div>
                                <div>Closes: {formatDate(quiz.end_date)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Settings</h4>
                              <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                <div>Shuffle: {quiz.shuffle_questions ? 'Yes' : 'No'}</div>
                                <div>Show Results: {quiz.show_results.replace('_', ' ')}</div>
                                <div>Show Answers: {quiz.show_correct_answers ? 'Yes' : 'No'}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-weight-medium text-neutral-900 mb-space-2">Question Pools</h4>
                              <div className="space-y-space-1 text-scale-sm text-neutral-600">
                                {quiz.question_pools.map((pool) => (
                                  <div key={pool.id} className="flex items-center justify-between">
                                    <span>{pool.name}</span>
                                    <span>{pool.questions_to_select} questions</span>
                                  </div>
                                ))}
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

      {/* Create Test Wizard */}
      <CreateTestWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleCreateQuiz}
        courseId={courseId!}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteQuiz}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${selectedQuiz?.title}"? This action cannot be undone and will remove all associated submissions and results.`}
        confirmText="Delete Quiz"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
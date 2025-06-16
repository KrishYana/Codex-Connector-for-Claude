import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Sparkles,
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  FileText,
  Settings
} from 'lucide-react';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { useToastActions } from '../hooks/useToastActions';

interface CourseData {
  // Step 1: Basic Info
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  
  // Step 2: Sections
  sections: {
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
  }[];
  
  // Step 3: AI Generated Content
  aiGenerated: {
    modules: {
      id: string;
      title: string;
      description: string;
      content: string;
      estimatedTime: number;
    }[];
    suggestedReadings: string[];
    practiceExercises: string[];
  };
  
  // Step 4: Grading Schema
  gradingSchema: {
    assignments: number;
    quizzes: number;
    participation: number;
    finalProject: number;
  };
  gradingScale: {
    aPlus: number;
    a: number;
    aMinus: number;
    bPlus: number;
    b: number;
    bMinus: number;
    cPlus: number;
    c: number;
    cMinus: number;
    d: number;
    f: number;
  };
  
  // Step 5: Publishing
  isPublished: boolean;
  enrollmentLimit: number;
  prerequisites: string[];
  tags: string[];
}

interface CourseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (courseData: CourseData) => void;
}

interface AIQuickStartProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (courseData: CourseData) => void;
}

// AI Quick-Start Modal Component
const AIQuickStart: React.FC<AIQuickStartProps> = ({ isOpen, onClose, onComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showSuccess, showError } = useToastActions();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      // Simulate AI API call
      const response = await fetch('/ai/course-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      let aiData;
      if (response.ok) {
        aiData = await response.json();
      } else {
        // Fallback mock data for demo
        aiData = {
          title: `${prompt.split(' ').slice(0, 3).join(' ')} Course`,
          description: `A comprehensive course covering ${prompt.toLowerCase()}. This course is designed to provide students with practical knowledge and hands-on experience.`,
          category: 'Technology',
          level: 'intermediate',
          duration: '8 weeks',
          sections: [
            {
              id: 'section-1',
              title: 'Introduction and Fundamentals',
              description: 'Basic concepts and foundational knowledge',
              estimatedHours: 4
            },
            {
              id: 'section-2',
              title: 'Core Concepts',
              description: 'Deep dive into main topics',
              estimatedHours: 6
            },
            {
              id: 'section-3',
              title: 'Advanced Topics',
              description: 'Complex scenarios and best practices',
              estimatedHours: 8
            },
            {
              id: 'section-4',
              title: 'Practical Application',
              description: 'Hands-on projects and real-world examples',
              estimatedHours: 6
            }
          ],
          modules: [
            {
              id: 'module-1',
              title: 'Getting Started',
              description: 'Introduction to the subject matter',
              content: 'Comprehensive overview of the topic...',
              estimatedTime: 2
            },
            {
              id: 'module-2',
              title: 'Core Principles',
              description: 'Understanding the fundamental concepts',
              content: 'Deep dive into core principles...',
              estimatedTime: 3
            }
          ],
          gradingSchema: {
            assignments: 40,
            quizzes: 25,
            participation: 15,
            finalProject: 20
          }
        };
      }

      const courseData: CourseData = {
        title: aiData.title,
        description: aiData.description,
        category: aiData.category,
        level: aiData.level,
        duration: aiData.duration,
        sections: aiData.sections,
        aiGenerated: {
          modules: aiData.modules,
          suggestedReadings: aiData.suggestedReadings || [
            'Recommended textbook chapters',
            'Online documentation',
            'Industry best practices guide'
          ],
          practiceExercises: aiData.practiceExercises || [
            'Hands-on coding exercises',
            'Case study analysis',
            'Group discussion topics'
          ]
        },
        gradingSchema: aiData.gradingSchema,
        gradingScale: {
          aPlus: 97,
          a: 93,
          aMinus: 90,
          bPlus: 87,
          b: 83,
          bMinus: 80,
          cPlus: 77,
          c: 73,
          cMinus: 70,
          d: 60,
          f: 0
        },
        isPublished: false,
        enrollmentLimit: 30,
        prerequisites: [],
        tags: []
      };

      onComplete(courseData);
      showSuccess('AI Draft Ready', 'Your course draft has been generated and saved as unpublished.');
      onClose();
      setPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
      showError('Generation Failed', 'Unable to generate course content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Quick-Start Course Creation"
      size="md"
    >
      <div className="space-y-space-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-space-4">
            <Sparkles className="w-8 h-8 text-neutral-0" />
          </div>
          <h3 className="heading-3 mb-space-2">Create with AI</h3>
          <p className="body-text">
            Describe your course idea and let AI generate a complete course structure, 
            modules, and grading schema for you.
          </p>
        </div>

        <div>
          <label className="form-label">Course Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'A comprehensive React development course covering hooks, state management, and modern patterns for building scalable web applications'"
            className="form-input h-32 resize-none"
            disabled={isGenerating}
          />
          <p className="text-scale-sm text-neutral-500 mt-space-2">
            Be specific about the topic, target audience, and learning objectives for best results.
          </p>
        </div>

        <div className="flex items-center justify-between pt-space-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="btn-outline disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="btn-primary disabled:opacity-50 flex items-center space-x-space-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Course</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Main Course Wizard Component
export const CourseWizard: React.FC<CourseWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: '8 weeks',
    sections: [{ id: 'section-1', title: '', description: '', estimatedHours: 2 }],
    aiGenerated: {
      modules: [],
      suggestedReadings: [],
      practiceExercises: []
    },
    gradingSchema: {
      assignments: 40,
      quizzes: 25,
      participation: 15,
      finalProject: 20
    },
    gradingScale: {
      aPlus: 97,
      a: 93,
      aMinus: 90,
      bPlus: 87,
      b: 83,
      bMinus: 80,
      cPlus: 77,
      c: 73,
      cMinus: 70,
      d: 60,
      f: 0
    },
    isPublished: false,
    enrollmentLimit: 30,
    prerequisites: [],
    tags: []
  });

  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const { showSuccess } = useToastActions();

  const steps = [
    { 
      number: 1, 
      title: 'Course Info', 
      description: 'Basic course information',
      icon: BookOpen
    },
    { 
      number: 2, 
      title: 'Sections', 
      description: 'Course structure and sections',
      icon: FileText
    },
    { 
      number: 3, 
      title: 'AI Quick-Start', 
      description: 'Generate content with AI',
      icon: Sparkles
    },
    { 
      number: 4, 
      title: 'Grading Schema', 
      description: 'Assessment and grading',
      icon: GraduationCap
    },
    { 
      number: 5, 
      title: 'Publish', 
      description: 'Review and publish course',
      icon: Settings
    }
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
    onComplete(courseData);
    onClose();
    resetWizard();
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setCourseData({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      duration: '8 weeks',
      sections: [{ id: 'section-1', title: '', description: '', estimatedHours: 2 }],
      aiGenerated: {
        modules: [],
        suggestedReadings: [],
        practiceExercises: []
      },
      gradingSchema: {
        assignments: 40,
        quizzes: 25,
        participation: 15,
        finalProject: 20
      },
      gradingScale: {
        aPlus: 97,
        a: 93,
        aMinus: 90,
        bPlus: 87,
        b: 83,
        bMinus: 80,
        cPlus: 77,
        c: 73,
        cMinus: 70,
        d: 60,
        f: 0
      },
      isPublished: false,
      enrollmentLimit: 30,
      prerequisites: [],
      tags: []
    });
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: '',
      description: '',
      estimatedHours: 2
    };
    setCourseData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    if (courseData.sections.length > 1) {
      setCourseData(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== sectionId)
      }));
    }
  };

  const updateSection = (sectionId: string, field: string, value: any) => {
    setCourseData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }));
  };

  const generateAIContent = async () => {
    setIsAIGenerating(true);
    
    try {
      // Simulate AI content generation based on course info and sections
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiModules = courseData.sections.flatMap((section, sectionIndex) => [
        {
          id: `module-${sectionIndex}-1`,
          title: `${section.title} - Introduction`,
          description: `Introduction to ${section.title.toLowerCase()}`,
          content: `Comprehensive overview of ${section.title.toLowerCase()} concepts and principles.`,
          estimatedTime: Math.floor(section.estimatedHours / 2)
        },
        {
          id: `module-${sectionIndex}-2`,
          title: `${section.title} - Deep Dive`,
          description: `Advanced concepts in ${section.title.toLowerCase()}`,
          content: `Detailed exploration of ${section.title.toLowerCase()} with practical examples.`,
          estimatedTime: Math.ceil(section.estimatedHours / 2)
        }
      ]);

      setCourseData(prev => ({
        ...prev,
        aiGenerated: {
          modules: aiModules,
          suggestedReadings: [
            `${courseData.title} - Essential Reading`,
            'Industry Best Practices Guide',
            'Supplementary Research Papers'
          ],
          practiceExercises: [
            'Hands-on Lab Exercises',
            'Case Study Analysis',
            'Peer Review Activities',
            'Self-Assessment Quizzes'
          ]
        }
      }));

      showSuccess('Content Generated', 'AI has generated course modules and materials based on your sections.');
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return courseData.title.trim() && courseData.description.trim() && courseData.category.trim();
      case 2:
        return courseData.sections.every(section => section.title.trim() && section.description.trim());
      case 3:
        return true; // AI step is optional
      case 4:
        return Object.values(courseData.gradingSchema).reduce((sum, val) => sum + val, 0) === 100;
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
              <label className="form-label">Course Title *</label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="e.g., Advanced React Development"
              />
            </div>
            
            <div>
              <label className="form-label">Description *</label>
              <textarea
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                className="form-input h-24 resize-none"
                placeholder="Describe what students will learn in this course..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-space-4">
              <div>
                <label className="form-label">Category *</label>
                <select
                  value={courseData.category}
                  onChange={(e) => setCourseData(prev => ({ ...prev, category: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Select category</option>
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
                  value={courseData.level}
                  onChange={(e) => setCourseData(prev => ({ ...prev, level: e.target.value as any }))}
                  className="form-input"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="form-label">Duration</label>
              <select
                value={courseData.duration}
                onChange={(e) => setCourseData(prev => ({ ...prev, duration: e.target.value }))}
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-space-4">
            <div className="flex items-center justify-between">
              <h3 className="text-scale-lg font-weight-bold">Course Sections</h3>
              <button
                type="button"
                onClick={addSection}
                className="btn-outline flex items-center space-x-space-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
            
            <div className="space-y-space-4">
              {courseData.sections.map((section, index) => (
                <div key={section.id} className="p-space-4 border border-neutral-200 rounded-radius-lg">
                  <div className="flex items-center justify-between mb-space-3">
                    <h4 className="font-weight-medium">Section {index + 1}</h4>
                    {courseData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="text-error-500 hover:text-error-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-space-3">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Section title"
                      className="form-input"
                    />
                    
                    <textarea
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Section description"
                      className="form-input h-20 resize-none"
                    />
                    
                    <div className="w-32">
                      <label className="form-label">Estimated Hours</label>
                      <input
                        type="number"
                        value={section.estimatedHours}
                        onChange={(e) => updateSection(section.id, 'estimatedHours', parseInt(e.target.value) || 0)}
                        min="1"
                        max="20"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-space-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-space-4">
                <Sparkles className="w-8 h-8 text-neutral-0" />
              </div>
              <h3 className="heading-3 mb-space-2">AI Content Generation</h3>
              <p className="body-text">
                Generate course modules, readings, and exercises based on your course structure.
              </p>
            </div>

            {courseData.aiGenerated.modules.length === 0 ? (
              <div className="text-center py-space-8">
                <button
                  onClick={generateAIContent}
                  disabled={isAIGenerating}
                  className="btn-primary flex items-center space-x-space-2 mx-auto"
                >
                  {isAIGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Generating Content...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Course Content</span>
                    </>
                  )}
                </button>
                <p className="text-scale-sm text-neutral-500 mt-space-3">
                  This will create modules, suggested readings, and practice exercises.
                </p>
              </div>
            ) : (
              <div className="space-y-space-4">
                <div className="bg-success-50 border border-success-200 rounded-radius-lg p-space-4">
                  <h4 className="font-weight-medium text-success-800 mb-space-2">
                    Content Generated Successfully!
                  </h4>
                  <p className="text-scale-sm text-success-700">
                    AI has generated {courseData.aiGenerated.modules.length} modules, 
                    {courseData.aiGenerated.suggestedReadings.length} reading materials, and 
                    {courseData.aiGenerated.practiceExercises.length} practice exercises.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-4">
                  <div className="p-space-4 bg-neutral-50 rounded-radius-lg">
                    <h5 className="font-weight-medium mb-space-2">Modules</h5>
                    <p className="text-scale-sm text-neutral-600">
                      {courseData.aiGenerated.modules.length} modules generated
                    </p>
                  </div>
                  
                  <div className="p-space-4 bg-neutral-50 rounded-radius-lg">
                    <h5 className="font-weight-medium mb-space-2">Readings</h5>
                    <p className="text-scale-sm text-neutral-600">
                      {courseData.aiGenerated.suggestedReadings.length} reading materials
                    </p>
                  </div>
                  
                  <div className="p-space-4 bg-neutral-50 rounded-radius-lg">
                    <h5 className="font-weight-medium mb-space-2">Exercises</h5>
                    <p className="text-scale-sm text-neutral-600">
                      {courseData.aiGenerated.practiceExercises.length} practice exercises
                    </p>
                  </div>
                </div>

                <button
                  onClick={generateAIContent}
                  disabled={isAIGenerating}
                  className="btn-outline flex items-center space-x-space-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate Content</span>
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-space-6">
            <div>
              <h3 className="text-scale-lg font-weight-bold mb-space-4">Grading Schema</h3>
              <div className="grid grid-cols-2 gap-space-4">
                <div>
                  <label className="form-label">Assignments (%)</label>
                  <input
                    type="number"
                    value={courseData.gradingSchema.assignments}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev,
                      gradingSchema: { ...prev.gradingSchema, assignments: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Quizzes (%)</label>
                  <input
                    type="number"
                    value={courseData.gradingSchema.quizzes}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev,
                      gradingSchema: { ...prev.gradingSchema, quizzes: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Participation (%)</label>
                  <input
                    type="number"
                    value={courseData.gradingSchema.participation}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev,
                      gradingSchema: { ...prev.gradingSchema, participation: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Final Project (%)</label>
                  <input
                    type="number"
                    value={courseData.gradingSchema.finalProject}
                    onChange={(e) => setCourseData(prev => ({
                      ...prev,
                      gradingSchema: { ...prev.gradingSchema, finalProject: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="mt-space-3">
                <p className="text-scale-sm text-neutral-600">
                  Total: {Object.values(courseData.gradingSchema).reduce((sum, val) => sum + val, 0)}%
                  {Object.values(courseData.gradingSchema).reduce((sum, val) => sum + val, 0) !== 100 && (
                    <span className="text-error-600 ml-space-2">Must equal 100%</span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-weight-medium mb-space-3">Grading Scale</h4>
              <div className="grid grid-cols-3 gap-space-3 text-scale-sm">
                {Object.entries(courseData.gradingScale).map(([grade, threshold]) => (
                  <div key={grade} className="flex items-center justify-between p-space-2 bg-neutral-50 rounded-radius-md">
                    <span className="font-weight-medium">{grade.toUpperCase().replace('PLUS', '+').replace('MINUS', '-')}</span>
                    <span>{threshold}%+</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-space-6">
            <div className="bg-neutral-50 rounded-radius-lg p-space-6">
              <h3 className="font-weight-bold text-neutral-900 mb-space-4">Course Summary</h3>
              <div className="space-y-space-3 text-scale-sm">
                <div><strong>Title:</strong> {courseData.title}</div>
                <div><strong>Category:</strong> {courseData.category}</div>
                <div><strong>Level:</strong> {courseData.level}</div>
                <div><strong>Duration:</strong> {courseData.duration}</div>
                <div><strong>Sections:</strong> {courseData.sections.length}</div>
                <div><strong>AI Modules:</strong> {courseData.aiGenerated.modules.length}</div>
              </div>
            </div>

            <div>
              <label className="form-label">Enrollment Limit</label>
              <input
                type="number"
                value={courseData.enrollmentLimit}
                onChange={(e) => setCourseData(prev => ({ ...prev, enrollmentLimit: parseInt(e.target.value) || 30 }))}
                min="1"
                max="200"
                className="form-input w-32"
              />
            </div>

            <div className="flex items-center space-x-space-3">
              <input
                type="checkbox"
                id="publish-course"
                checked={courseData.isPublished}
                onChange={(e) => setCourseData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="publish-course" className="text-scale-sm font-weight-medium">
                Publish course immediately
              </label>
            </div>
            
            <div className="bg-primary-50 border border-primary-200 rounded-radius-lg p-space-4">
              <p className="text-scale-sm text-primary-700">
                {courseData.isPublished 
                  ? 'Your course will be published and available to students immediately.'
                  : 'Your course will be saved as a draft. You can publish it later from the course management page.'
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
      title="Create New Course"
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
            <ChevronLeft className="w-4 h-4" />
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
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!isStepValid()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {courseData.isPublished ? 'Create & Publish' : 'Create Draft'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Export both components
export { AIQuickStart };
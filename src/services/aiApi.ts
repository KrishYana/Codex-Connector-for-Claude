import { ApiError } from './api';

interface AICourseRequest {
  prompt: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
}

interface AICourseResponse {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  sections: {
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
  }[];
  modules: {
    id: string;
    title: string;
    description: string;
    content: string;
    estimatedTime: number;
  }[];
  gradingSchema: {
    assignments: number;
    quizzes: number;
    participation: number;
    finalProject: number;
  };
  suggestedReadings?: string[];
  practiceExercises?: string[];
}

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001/ai';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(408, 'AI request timeout');
    }
    
    throw new ApiError(0, `AI service error: ${(error as Error).message}`);
  }
};

// AI Course Suggestion API
export const aiApi = {
  // POST /ai/course-suggest - Generate course structure and content
  suggestCourse: async (request: AICourseRequest): Promise<AICourseResponse> => {
    try {
      const response = await fetchWithTimeout(`${AI_API_BASE_URL}/course-suggest`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new ApiError(response.status, 'AI service unavailable');
      }
    } catch (error) {
      console.warn('AI service unavailable, using fallback generation:', (error as Error).message);
      
      // Fallback: Generate mock course structure based on prompt
      return generateFallbackCourse(request);
    }
  },

  // POST /ai/module-content - Generate detailed module content
  generateModuleContent: async (moduleTitle: string, courseContext: string): Promise<string> => {
    try {
      const response = await fetchWithTimeout(`${AI_API_BASE_URL}/module-content`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          moduleTitle, 
          courseContext 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content;
      } else {
        throw new ApiError(response.status, 'AI content generation failed');
      }
    } catch (error) {
      console.warn('AI content generation unavailable, using fallback:', (error as Error).message);
      
      // Fallback content generation
      return generateFallbackModuleContent(moduleTitle, courseContext);
    }
  },

  // POST /ai/assessment-suggest - Generate assessment questions
  suggestAssessments: async (moduleContent: string, assessmentType: 'quiz' | 'assignment'): Promise<any[]> => {
    try {
      const response = await fetchWithTimeout(`${AI_API_BASE_URL}/assessment-suggest`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          content: moduleContent, 
          type: assessmentType 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.assessments;
      } else {
        throw new ApiError(response.status, 'AI assessment generation failed');
      }
    } catch (error) {
      console.warn('AI assessment generation unavailable, using fallback:', (error as Error).message);
      
      // Fallback assessment generation
      return generateFallbackAssessments(moduleContent, assessmentType);
    }
  }
};

// Fallback course generation when AI service is unavailable
function generateFallbackCourse(request: AICourseRequest): AICourseResponse {
  const prompt = request.prompt.toLowerCase();
  
  // Extract key topics from prompt
  const topics = extractTopicsFromPrompt(prompt);
  const level = request.level || detectLevelFromPrompt(prompt);
  const duration = request.duration || '8 weeks';
  
  // Generate course structure
  const courseTitle = generateCourseTitle(topics, prompt);
  const category = detectCategoryFromPrompt(prompt);
  
  // Generate sections based on common course structure patterns
  const sections = generateCourseSections(topics, level);
  
  // Generate modules for each section
  const modules = sections.flatMap((section, sectionIndex) => 
    generateSectionModules(section, sectionIndex, level)
  );
  
  // Generate grading schema based on level and course type
  const gradingSchema = generateGradingSchema(level, category);
  
  return {
    title: courseTitle,
    description: generateCourseDescription(courseTitle, topics, level),
    category,
    level,
    duration,
    sections,
    modules,
    gradingSchema,
    suggestedReadings: generateSuggestedReadings(topics, level),
    practiceExercises: generatePracticeExercises(topics, level)
  };
}

function extractTopicsFromPrompt(prompt: string): string[] {
  // Simple keyword extraction - in real AI this would be more sophisticated
  const techKeywords = ['react', 'javascript', 'python', 'java', 'web', 'mobile', 'data', 'machine learning', 'ai'];
  const businessKeywords = ['marketing', 'management', 'finance', 'strategy', 'leadership'];
  const designKeywords = ['design', 'ui', 'ux', 'graphics', 'visual'];
  
  const allKeywords = [...techKeywords, ...businessKeywords, ...designKeywords];
  
  return allKeywords.filter(keyword => prompt.includes(keyword));
}

function detectLevelFromPrompt(prompt: string): 'beginner' | 'intermediate' | 'advanced' {
  if (prompt.includes('beginner') || prompt.includes('introduction') || prompt.includes('basics')) {
    return 'beginner';
  }
  if (prompt.includes('advanced') || prompt.includes('expert') || prompt.includes('master')) {
    return 'advanced';
  }
  return 'intermediate';
}

function detectCategoryFromPrompt(prompt: string): string {
  const categories = {
    'Technology': ['react', 'javascript', 'python', 'programming', 'web', 'software', 'coding'],
    'Business': ['business', 'marketing', 'management', 'finance', 'strategy'],
    'Design': ['design', 'ui', 'ux', 'graphics', 'visual', 'creative'],
    'Science': ['science', 'research', 'data', 'analysis', 'statistics'],
    'Mathematics': ['math', 'mathematics', 'calculus', 'algebra', 'statistics']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => prompt.includes(keyword))) {
      return category;
    }
  }
  
  return 'Technology'; // Default fallback
}

function generateCourseTitle(topics: string[], prompt: string): string {
  if (topics.length > 0) {
    const mainTopic = topics[0];
    return `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Development Course`;
  }
  
  // Extract first few words from prompt as title
  const words = prompt.split(' ').slice(0, 4);
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Course';
}

function generateCourseDescription(title: string, topics: string[], level: string): string {
  const levelDescriptions = {
    beginner: 'This introductory course is designed for students with little to no prior experience.',
    intermediate: 'This course builds upon foundational knowledge and explores more complex concepts.',
    advanced: 'This advanced course covers sophisticated topics and industry best practices.'
  };
  
  return `${levelDescriptions[level as keyof typeof levelDescriptions]} Students will learn ${topics.join(', ')} through hands-on projects and real-world examples. By the end of this course, you'll have the skills and confidence to apply these concepts in professional settings.`;
}

function generateCourseSections(topics: string[], level: string): AICourseResponse['sections'] {
  const baseSections = [
    {
      id: 'section-1',
      title: 'Fundamentals and Introduction',
      description: 'Core concepts and foundational knowledge',
      estimatedHours: level === 'beginner' ? 6 : 4
    },
    {
      id: 'section-2',
      title: 'Core Concepts and Principles',
      description: 'Deep dive into main topics and methodologies',
      estimatedHours: level === 'advanced' ? 8 : 6
    },
    {
      id: 'section-3',
      title: 'Practical Application',
      description: 'Hands-on projects and real-world implementation',
      estimatedHours: 8
    },
    {
      id: 'section-4',
      title: 'Advanced Topics and Best Practices',
      description: 'Industry standards and advanced techniques',
      estimatedHours: level === 'beginner' ? 4 : 6
    }
  ];
  
  return baseSections;
}

function generateSectionModules(section: AICourseResponse['sections'][0], sectionIndex: number, level: string): AICourseResponse['modules'] {
  const moduleCount = level === 'beginner' ? 2 : 3;
  const modules: AICourseResponse['modules'] = [];
  
  for (let i = 0; i < moduleCount; i++) {
    modules.push({
      id: `module-${sectionIndex}-${i + 1}`,
      title: `${section.title} - Part ${i + 1}`,
      description: `Detailed exploration of ${section.title.toLowerCase()} concepts`,
      content: generateFallbackModuleContent(`${section.title} - Part ${i + 1}`, section.description),
      estimatedTime: Math.ceil(section.estimatedHours / moduleCount)
    });
  }
  
  return modules;
}

function generateGradingSchema(level: string, category: string): AICourseResponse['gradingSchema'] {
  // Adjust grading schema based on course characteristics
  if (category === 'Technology') {
    return {
      assignments: 45,
      quizzes: 20,
      participation: 10,
      finalProject: 25
    };
  } else if (category === 'Business') {
    return {
      assignments: 35,
      quizzes: 25,
      participation: 20,
      finalProject: 20
    };
  } else {
    return {
      assignments: 40,
      quizzes: 25,
      participation: 15,
      finalProject: 20
    };
  }
}

function generateSuggestedReadings(topics: string[], level: string): string[] {
  const readings = [
    `Essential ${topics[0] || 'Course'} Handbook`,
    'Industry Best Practices Guide',
    'Current Research and Trends',
    'Case Studies and Real-World Applications'
  ];
  
  if (level === 'advanced') {
    readings.push('Advanced Theoretical Foundations', 'Cutting-Edge Research Papers');
  }
  
  return readings;
}

function generatePracticeExercises(topics: string[], level: string): string[] {
  const exercises = [
    'Hands-on Lab Exercises',
    'Interactive Problem Solving',
    'Peer Review Activities',
    'Self-Assessment Quizzes'
  ];
  
  if (level !== 'beginner') {
    exercises.push('Complex Case Study Analysis', 'Group Project Collaboration');
  }
  
  if (level === 'advanced') {
    exercises.push('Independent Research Project', 'Industry Simulation Exercise');
  }
  
  return exercises;
}

function generateFallbackModuleContent(moduleTitle: string, courseContext: string): string {
  return `
# ${moduleTitle}

## Overview
This module covers essential concepts related to ${moduleTitle.toLowerCase()}. Students will explore key principles and practical applications within the context of ${courseContext.toLowerCase()}.

## Learning Objectives
By the end of this module, students will be able to:
- Understand the fundamental concepts of ${moduleTitle.toLowerCase()}
- Apply theoretical knowledge to practical scenarios
- Analyze and evaluate different approaches and methodologies
- Demonstrate proficiency through hands-on exercises

## Key Topics
- Introduction to core concepts
- Theoretical foundations and principles
- Practical applications and use cases
- Best practices and industry standards
- Common challenges and solutions

## Activities
- Interactive demonstrations
- Guided practice exercises
- Group discussions and peer review
- Individual reflection and assessment

## Resources
- Required readings and materials
- Supplementary resources for deeper learning
- Online tools and interactive content
- Community forums and discussion boards

## Assessment
Students will be evaluated based on their participation in activities, completion of practice exercises, and demonstration of understanding through various assessment methods.
  `.trim();
}

function generateFallbackAssessments(moduleContent: string, assessmentType: 'quiz' | 'assignment'): any[] {
  if (assessmentType === 'quiz') {
    return [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which of the following best describes the main concept covered in this module?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'The principles discussed in this module can be applied to real-world scenarios.',
        correctAnswer: true
      },
      {
        id: 'q3',
        type: 'short-answer',
        question: 'Explain how you would apply the concepts from this module in a practical setting.',
        sampleAnswer: 'Students should demonstrate understanding by providing specific examples and explaining the application process.'
      }
    ];
  } else {
    return [
      {
        id: 'a1',
        title: 'Practical Application Project',
        description: 'Create a project that demonstrates your understanding of the module concepts.',
        requirements: [
          'Apply at least 3 key concepts from the module',
          'Provide detailed documentation',
          'Include reflection on learning outcomes'
        ],
        rubric: {
          'Concept Application': 40,
          'Documentation Quality': 30,
          'Reflection and Analysis': 30
        }
      }
    ];
  }
}

export { ApiError };
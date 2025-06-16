import { Course, Assignment, Grade, BulkGradeUpdate } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Enhanced fetch with timeout and better error handling for demo environments
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
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
    
    // Check if we're in a demo environment
    const isDemoEnvironment = window.location.hostname.includes('stackblitz') || 
                             window.location.hostname.includes('webcontainer') ||
                             window.location.hostname.includes('localhost');
    
    if (isDemoEnvironment && (error as Error).name === 'AbortError') {
      throw new ApiError(503, 'API server not available in demo environment');
    } else if ((error as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    throw new ApiError(0, `Network error: ${(error as Error).message}`);
  }
};

// Course Management APIs
export const courseApi = {
  // GET /courses - List all courses
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/courses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to fetch courses from API, using mock data:', (error as Error).message);
      // Return mock data for demo purposes
      return [
        {
          id: 'course-1',
          title: 'Advanced React Development',
          description: 'Learn advanced React patterns and best practices',
          instructor: 'Dr. Jane Smith',
          students: 24,
          duration: '8 weeks',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'course-2',
          title: 'JavaScript Fundamentals',
          description: 'Master the fundamentals of JavaScript programming',
          instructor: 'Dr. Jane Smith',
          students: 32,
          duration: '6 weeks',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }
  },

  // GET /courses/:id - Get single course
  getCourse: async (id: string): Promise<Course> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/courses/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to fetch course from API, using mock data:', (error as Error).message);
      // Return mock course for demo purposes
      return {
        id,
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
    }
  },

  // POST /courses - Create new course (requires teacher/co-teacher role)
  createCourse: async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to create course via API, returning mock response:', (error as Error).message);
      // Return mock created course
      return {
        id: `course-${Date.now()}`,
        ...courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  // PUT /courses/:id - Update course
  updateCourse: async (id: string, courseData: Partial<Course>): Promise<Course> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to update course via API, returning mock response:', (error as Error).message);
      // Return mock updated course
      const existingCourse = await courseApi.getCourse(id);
      return {
        ...existingCourse,
        ...courseData,
        updated_at: new Date().toISOString(),
      };
    }
  },

  // DELETE /courses/:id - Delete course
  deleteCourse: async (id: string): Promise<void> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to delete course');
      }
    } catch (error) {
      console.warn('Failed to delete course via API:', (error as Error).message);
      throw error;
    }
  },
};

// Assignment Management APIs
export const assignmentApi = {
  // GET /assignments - List assignments for a course
  getAssignments: async (courseId?: string): Promise<Assignment[]> => {
    const url = courseId 
      ? `${API_BASE_URL}/assignments?course_id=${courseId}`
      : `${API_BASE_URL}/assignments`;
    
    try {
      const response = await fetchWithTimeout(url, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to fetch assignments from API, using mock data:', (error as Error).message);
      // Return mock data for demo purposes
      return [
        {
          id: 'assignment-1',
          title: 'React Components Project',
          description: 'Build a complex React application using modern patterns',
          course_id: 'course-1',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 100,
          created_at: new Date().toISOString(),
        },
        {
          id: 'assignment-2',
          title: 'JavaScript Quiz #3',
          description: 'Test your knowledge of advanced JavaScript concepts',
          course_id: 'course-2',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          max_points: 50,
          created_at: new Date().toISOString(),
        },
      ];
    }
  },

  // POST /assignments - Create new assignment (requires teacher/co-teacher role)
  createAssignment: async (assignmentData: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to create assignment via API, returning mock response:', (error as Error).message);
      // Return mock created assignment
      return {
        id: `assignment-${Date.now()}`,
        ...assignmentData,
        created_at: new Date().toISOString(),
      };
    }
  },

  // PUT /assignments/:id - Update assignment
  updateAssignment: async (id: string, assignmentData: Partial<Assignment>): Promise<Assignment> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/assignments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to update assignment via API:', (error as Error).message);
      throw error;
    }
  },

  // DELETE /assignments/:id - Delete assignment
  deleteAssignment: async (id: string): Promise<void> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/assignments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to delete assignment');
      }
    } catch (error) {
      console.warn('Failed to delete assignment via API:', (error as Error).message);
      throw error;
    }
  },
};

// Grade Management APIs
export const gradeApi = {
  // GET /grades - Get grades for assignment or student
  getGrades: async (params?: { assignment_id?: string; student_id?: string }): Promise<Grade[]> => {
    const searchParams = new URLSearchParams();
    if (params?.assignment_id) searchParams.set('assignment_id', params.assignment_id);
    if (params?.student_id) searchParams.set('student_id', params.student_id);
    
    const url = `${API_BASE_URL}/grades${searchParams.toString() ? `?${searchParams}` : ''}`;
    
    try {
      const response = await fetchWithTimeout(url, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to fetch grades from API, using mock data:', (error as Error).message);
      return [];
    }
  },

  // POST /grades - Create single grade
  createGrade: async (gradeData: Omit<Grade, 'id' | 'graded_at'>): Promise<Grade> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/grades`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(gradeData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to create grade via API, returning mock response:', (error as Error).message);
      return {
        id: `grade-${Date.now()}`,
        ...gradeData,
        graded_at: new Date().toISOString(),
      };
    }
  },

  // PUT /grades/bulk - Bulk update grades (requires teacher/co-teacher/assistant role)
  bulkUpdateGrades: async (bulkData: BulkGradeUpdate): Promise<Grade[]> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/grades/bulk`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bulkData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to bulk update grades via API:', (error as Error).message);
      throw error;
    }
  },

  // PUT /grades/:id - Update single grade
  updateGrade: async (id: string, gradeData: Partial<Grade>): Promise<Grade> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/grades/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(gradeData),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to update grade via API:', (error as Error).message);
      throw error;
    }
  },
};

// Student Management APIs
export const studentApi = {
  // GET /students - List students in a course
  getStudents: async (courseId?: string): Promise<any[]> => {
    const url = courseId 
      ? `${API_BASE_URL}/students?course_id=${courseId}`
      : `${API_BASE_URL}/students`;
    
    try {
      const response = await fetchWithTimeout(url, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn('Failed to fetch students from API, using mock data:', (error as Error).message);
      return [];
    }
  },

  // POST /students/enroll - Enroll student in course
  enrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/students/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ course_id: courseId, student_id: studentId }),
      });
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to enroll student');
      }
    } catch (error) {
      console.warn('Failed to enroll student via API:', (error as Error).message);
      throw error;
    }
  },

  // DELETE /students/unenroll - Remove student from course
  unenrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/students/unenroll`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ course_id: courseId, student_id: studentId }),
      });
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to unenroll student');
      }
    } catch (error) {
      console.warn('Failed to unenroll student via API:', (error as Error).message);
      throw error;
    }
  },
};

export { ApiError };
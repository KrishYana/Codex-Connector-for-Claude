export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  course_role?: 'teacher' | 'co-teacher' | 'assistant';
  avatar?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  course_role?: 'teacher' | 'co-teacher' | 'assistant';
  exp: number;
  iat: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  canCreateCourses: boolean;
  canManageGrades: boolean;
  canCreateAssignments: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  duration: string;
  image?: string;
  created_at: string;
  updated_at: string;
  is_published?: boolean;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  enrollment_limit?: number;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  assignment_id: string;
  score: number;
  max_score: number;
  feedback?: string;
  graded_at: string;
}

export interface BulkGradeUpdate {
  assignment_id: string;
  grades: {
    student_id: string;
    score: number;
    feedback?: string;
  }[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  estimated_time: number;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  estimated_hours: number;
  modules: CourseModule[];
}
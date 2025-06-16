// Lazy-loaded pages
import { lazy } from 'react';

// Student Pages
export const StudentDashboard = lazy(() => import('../StudentDashboard').then(module => ({ default: module.StudentDashboard || module.default })));
export const StudentCourses = lazy(() => import('../StudentCourses').then(module => ({ default: module.StudentCourses || module.default })));

// Teacher Pages  
export const TeacherDashboard = lazy(() => import('../TeacherDashboard').then(module => ({ default: module.TeacherDashboard || module.default })));
export const TeacherCourseLanding = lazy(() => import('../TeacherCourseLanding').then(module => ({ default: module.TeacherCourseLanding || module.default })));
export const TeacherModules = lazy(() => import('../placeholders/TeacherModules').then(module => ({ default: module.TeacherModules || module.default })));
export const TeacherAssignments = lazy(() => import('../TeacherAssignments').then(module => ({ default: module.TeacherAssignments || module.default })));
export const TeacherQuizzes = lazy(() => import('../TeacherQuizzes').then(module => ({ default: module.TeacherQuizzes || module.default })));

// Auth Pages
export const LoginPage = lazy(() => import('../LoginPage').then(module => ({ default: module.LoginPage || module.default })));
export const ForbiddenPage = lazy(() => import('../ForbiddenPage').then(module => ({ default: module.ForbiddenPage || module.default })));

// Discussion Pages
export const DiscussionThread = lazy(() => import('../../components/DiscussionThread').then(module => ({ default: module.DiscussionThread || module.default })));

// Module Pages
export const ModulePage = lazy(() => import('../ModulePage').then(module => ({ default: module.ModulePage || module.default })));

// Placeholder pages for routes that don't have dedicated components yet
export const StudentSchedule = lazy(() => import('../placeholders/StudentSchedule').then(module => ({ default: module.StudentSchedule || module.default })));
export const StudentMessages = lazy(() => import('../placeholders/StudentMessages').then(module => ({ default: module.StudentMessages || module.default })));
export const StudentAchievements = lazy(() => import('../placeholders/StudentAchievements').then(module => ({ default: module.StudentAchievements || module.default })));
export const StudentSettings = lazy(() => import('../placeholders/StudentSettings').then(module => ({ default: module.StudentSettings || module.default })));

export const TeacherClasses = lazy(() => import('../placeholders/TeacherClasses').then(module => ({ default: module.TeacherClasses || module.default })));
export const TeacherStudents = lazy(() => import('../placeholders/TeacherStudents').then(module => ({ default: module.TeacherStudents || module.default })));
export const TeacherContent = lazy(() => import('../placeholders/TeacherContent').then(module => ({ default: module.TeacherContent || module.default })));
export const TeacherSchedule = lazy(() => import('../placeholders/TeacherSchedule').then(module => ({ default: module.TeacherSchedule || module.default })));
export const TeacherAnalytics = lazy(() => import('../placeholders/TeacherAnalytics').then(module => ({ default: module.TeacherAnalytics || module.default })));
export const TeacherMessages = lazy(() => import('../placeholders/TeacherMessages').then(module => ({ default: module.TeacherMessages || module.default })));
export const TeacherSettings = lazy(() => import('../placeholders/TeacherSettings').then(module => ({ default: module.TeacherSettings || module.default })));
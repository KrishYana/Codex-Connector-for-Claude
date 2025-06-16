import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastHub } from './components/ToastHub';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudentAppShell } from './components/StudentAppShell';
import { TeacherAppShell } from './components/TeacherAppShell';
import { PageTransition } from './components/PageTransition';
import { LazyPageWrapper } from './components/LazyPageWrapper';
import { SkipLink } from './components/SkipLink';
import { SearchModal } from './components/SearchModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Lazy-loaded pages
import {
  LoginPage,
  ForbiddenPage,
  StudentDashboard,
  StudentCourses,
  StudentSchedule,
  StudentMessages,
  StudentAchievements,
  StudentSettings,
  TeacherDashboard,
  TeacherCourseLanding,
  TeacherModules,
  TeacherAssignments,
  TeacherQuizzes,
  TeacherClasses,
  TeacherStudents,
  TeacherContent,
  TeacherSchedule,
  TeacherAnalytics,
  TeacherMessages,
  TeacherSettings,
  DiscussionThread,
  ModulePage,
} from './pages/lazy';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <LazyPageWrapper>
              <LoginPage />
            </LazyPageWrapper>
          } 
        />
        <Route 
          path="/403" 
          element={
            <LazyPageWrapper>
              <ForbiddenPage />
            </LazyPageWrapper>
          } 
        />
        
        {/* Global Discussion Routes */}
        <Route 
          path="/discussions/:threadId" 
          element={
            <ProtectedRoute>
              <StudentAppShell>
                <LazyPageWrapper>
                  <DiscussionThread />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Global Module Routes */}
        <Route 
          path="/modules/:moduleId" 
          element={
            <ProtectedRoute>
              <StudentAppShell>
                <LazyPageWrapper>
                  <ModulePage />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Student Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <StudentDashboard />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <StudentCourses />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Contextual Discussion Routes for Students */}
        <Route 
          path="/courses/:courseId/discussions/:threadId" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <DiscussionThread />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Contextual Module Routes for Students */}
        <Route 
          path="/courses/:courseId/modules/:moduleId" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <ModulePage />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/schedule" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <StudentSchedule />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <StudentMessages />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/achievements" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <StudentAchievements />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAppShell>
                <LazyPageWrapper>
                  <StudentSettings />
                </LazyPageWrapper>
              </StudentAppShell>
            </ProtectedRoute>
          } 
        />

        {/* Teacher Routes */}
        <Route 
          path="/teach/dashboard" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherDashboard />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Course Landing */}
        <Route 
          path="/teach/course/:courseId" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherCourseLanding />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Course Modules */}
        <Route 
          path="/teach/course/:courseId/modules" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherModules />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Course Assignments */}
        <Route 
          path="/teach/course/:courseId/assignments" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherAssignments />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Course Quizzes */}
        <Route 
          path="/teach/course/:courseId/quizzes" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherQuizzes />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Global Discussion Routes for Teachers */}
        <Route 
          path="/teach/discussions/:threadId" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <DiscussionThread />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Contextual Discussion Routes for Teachers */}
        <Route 
          path="/teach/courses/:courseId/discussions/:threadId" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <DiscussionThread />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Global Module Routes for Teachers */}
        <Route 
          path="/teach/modules/:moduleId" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <ModulePage />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        {/* Contextual Module Routes for Teachers */}
        <Route 
          path="/teach/courses/:courseId/modules/:moduleId" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <ModulePage />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teach/classes" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherClasses />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/students" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherStudents />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/content" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherContent />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/schedule" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherSchedule />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/analytics" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherAnalytics />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/assignments" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherAssignments />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/messages" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherMessages />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teach/settings" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherAppShell>
                <LazyPageWrapper>
                  <TeacherSettings />
                </LazyPageWrapper>
              </TeacherAppShell>
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </PageTransition>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SkipLink />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <ToastHub />
            <SearchModal />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
import { useCallback } from 'react';
import { useToasts } from '../contexts/ToastContext';

export const useToastActions = () => {
  const { push } = useToasts();

  const showSuccess = useCallback((title: string, message?: string) => {
    return push({
      type: 'success',
      title,
      message,
    });
  }, [push]);

  const showError = useCallback((title: string, message?: string) => {
    return push({
      type: 'error',
      title,
      message,
    });
  }, [push]);

  const showWarning = useCallback((title: string, message?: string) => {
    return push({
      type: 'warning',
      title,
      message,
    });
  }, [push]);

  const showInfo = useCallback((title: string, message?: string) => {
    return push({
      type: 'info',
      title,
      message,
    });
  }, [push]);

  const showFileUploadSuccess = useCallback((fileName: string) => {
    return push({
      type: 'success',
      title: 'File Uploaded',
      message: `${fileName} has been uploaded successfully`,
    });
  }, [push]);

  const showFileUploadError = useCallback((fileName: string, error?: string) => {
    return push({
      type: 'error',
      title: 'Upload Failed',
      message: `Failed to upload ${fileName}${error ? `: ${error}` : ''}`,
    });
  }, [push]);

  const showQuizSubmitted = useCallback((quizTitle: string) => {
    return push({
      type: 'success',
      title: 'Quiz Submitted',
      message: `Your answers for "${quizTitle}" have been submitted successfully`,
    });
  }, [push]);

  const showAssignmentSubmitted = useCallback((assignmentTitle: string) => {
    return push({
      type: 'success',
      title: 'Assignment Submitted',
      message: `"${assignmentTitle}" has been submitted successfully`,
    });
  }, [push]);

  const showGradingComplete = useCallback((assignmentTitle: string, studentCount: number) => {
    return push({
      type: 'success',
      title: 'Grading Complete',
      message: `Graded ${studentCount} submissions for "${assignmentTitle}"`,
    });
  }, [push]);

  const showCourseCreated = useCallback((courseTitle: string) => {
    return push({
      type: 'success',
      title: 'Course Created',
      message: `"${courseTitle}" has been created successfully`,
      action: {
        label: 'View Course',
        onClick: () => {
          // Navigate to course
          window.location.href = '/teach/classes';
        }
      }
    });
  }, [push]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showFileUploadSuccess,
    showFileUploadError,
    showQuizSubmitted,
    showAssignmentSubmitted,
    showGradingComplete,
    showCourseCreated,
  };
};
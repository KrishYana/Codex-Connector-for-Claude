import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToasts } from '../contexts/ToastContext';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

interface SubmissionEvent {
  student_name: string;
  assignment_title: string;
  course_title: string;
  submission_id: string;
}

export const useWebSocket = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { push } = useToasts();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3; // Reduced attempts for demo environments
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Check if we're in a demo environment (StackBlitz, etc.)
    const isDemoEnvironment = window.location.hostname.includes('stackblitz') || 
                             window.location.hostname.includes('webcontainer') ||
                             window.location.hostname.includes('localhost');

    // Use environment variable or fallback to localhost
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    
    try {
      wsRef.current = new WebSocket(`${wsUrl}?token=${token}`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        isConnectedRef.current = true;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        isConnectedRef.current = false;
        
        // Only attempt to reconnect if not a normal closure and in production-like environment
        if (event.code !== 1000 && 
            reconnectAttempts.current < maxReconnectAttempts && 
            !isDemoEnvironment) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (isDemoEnvironment && reconnectAttempts.current === 0) {
          // Log once for demo environments
          console.log('WebSocket server not available in demo environment - this is expected');
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn('WebSocket connection failed - this is expected in demo environments');
        isConnectedRef.current = false;
        
        // Don't spam error logs in demo environments
        if (!isDemoEnvironment) {
          console.error('WebSocket error:', error);
        }
      };

    } catch (error) {
      console.warn('Failed to create WebSocket connection:', error);
      isConnectedRef.current = false;
    }
  }, [isAuthenticated, token]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'submission:new':
        if (user?.role === 'teacher') {
          const submission = message.payload as SubmissionEvent;
          push({
            type: 'info',
            title: 'New Submission',
            message: `${submission.student_name} submitted "${submission.assignment_title}" in ${submission.course_title}`,
            action: {
              label: 'View Submission',
              onClick: () => {
                // Navigate to submission view
                window.location.href = `/teach/assignments/${submission.submission_id}`;
              }
            }
          });
        }
        break;

      case 'assignment:graded':
        if (user?.role === 'student') {
          const grading = message.payload;
          push({
            type: 'success',
            title: 'Assignment Graded',
            message: `Your assignment "${grading.assignment_title}" has been graded`,
            action: {
              label: 'View Grade',
              onClick: () => {
                window.location.href = `/courses/${grading.course_id}/assignments/${grading.assignment_id}`;
              }
            }
          });
        }
        break;

      case 'course:updated':
        push({
          type: 'info',
          title: 'Course Updated',
          message: `Course "${message.payload.course_title}" has been updated`,
        });
        break;

      case 'system:maintenance':
        push({
          type: 'warning',
          title: 'System Maintenance',
          message: message.payload.message,
          duration: 10000, // 10 seconds for important system messages
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, [user?.role, push]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    isConnectedRef.current = false;
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log('WebSocket not connected - message not sent:', { type, payload });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current && wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    disconnect,
  };
};
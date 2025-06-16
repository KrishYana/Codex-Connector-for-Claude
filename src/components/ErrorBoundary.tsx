import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to server
    this.logErrorToServer(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logErrorToServer = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
      };

      await fetch('/logs/client-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify(errorData),
      });
    } catch (logError) {
      console.error('Failed to log error to server:', logError);
      // Fallback to console logging
      console.error('Original error:', error);
      console.error('Error info:', errorInfo);
    }
  };

  private getUserId = (): string | null => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  };

  private handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // Add a small delay to show the loading state
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 500);
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `.trim();

    const subject = encodeURIComponent('Bug Report: Application Error');
    const body = encodeURIComponent(`Please describe what you were doing when this error occurred:\n\n[Your description here]\n\n--- Technical Details ---\n${errorDetails}`);
    
    window.open(`mailto:support@edulearn.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-space-6">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-space-6">
              <AlertTriangle className="w-10 h-10 text-error-500" />
            </div>

            {/* Error Message */}
            <h1 className="heading-1 text-error-800 mb-space-2">
              Something went wrong
            </h1>
            <p className="body-text mb-space-6">
              We're sorry, but something unexpected happened. The error has been logged 
              and our team has been notified.
            </p>

            {/* Error Details (Development Mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-space-6 p-space-4 bg-neutral-100 rounded-radius-lg">
                <summary className="cursor-pointer font-weight-medium text-neutral-800 mb-space-2">
                  Error Details (Development)
                </summary>
                <div className="text-scale-sm text-neutral-600 font-mono">
                  <p className="mb-space-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="whitespace-pre-wrap text-scale-xs bg-neutral-0 p-space-2 rounded-radius-sm overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-space-3">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="btn-primary w-full flex items-center justify-center space-x-space-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {this.state.isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                )}
              </button>

              <div className="flex space-x-space-3">
                <button
                  onClick={this.handleGoHome}
                  className="btn-outline flex-1 flex items-center justify-center space-x-space-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>

                <button
                  onClick={this.handleReportBug}
                  className="btn-outline flex-1 flex items-center justify-center space-x-space-2"
                >
                  <Bug className="w-4 h-4" />
                  <span>Report Bug</span>
                </button>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-space-8 p-space-4 bg-primary-50 rounded-radius-lg border border-primary-200">
              <h3 className="text-scale-sm font-weight-bold text-primary-800 mb-space-2">
                Need immediate help?
              </h3>
              <p className="text-scale-sm text-primary-700 mb-space-3">
                If this problem persists, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-space-2 text-scale-sm">
                <a 
                  href="mailto:support@edulearn.com" 
                  className="text-primary-600 hover:text-primary-800 font-weight-medium"
                >
                  support@edulearn.com
                </a>
                <span className="hidden sm:inline text-primary-400">•</span>
                <a 
                  href="tel:+1-555-0123" 
                  className="text-primary-600 hover:text-primary-800 font-weight-medium"
                >
                  +1 (555) 012-3456
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
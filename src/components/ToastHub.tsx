import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToasts, Toast, ToastType } from '../contexts/ToastContext';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { dismiss } = useToasts();

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-800';
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary-600" />;
      default:
        return <Info className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <div
      className={`
        relative flex items-start space-x-space-3 p-space-4 rounded-radius-lg border shadow-md
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        ${getToastStyles(toast.type)}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex-shrink-0">
        {getToastIcon(toast.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-scale-sm font-weight-bold">{toast.title}</h4>
        {toast.message && (
          <p className="text-scale-sm mt-space-1 opacity-90">{toast.message}</p>
        )}
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-scale-sm font-weight-medium underline hover:no-underline mt-space-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-radius-sm"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {toast.dismissible && (
        <button
          onClick={() => dismiss(toast.id)}
          className="flex-shrink-0 p-space-1 rounded-radius-sm hover:bg-black hover:bg-opacity-10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const ToastHub: React.FC = () => {
  const { toasts } = useToasts();

  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="fixed top-space-4 right-space-4 z-50 space-y-space-3 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
};
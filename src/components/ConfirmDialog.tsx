import React from 'react';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-error-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-warning-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-success-500" />;
      default:
        return <Info className="w-6 h-6 text-primary-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-error-500 hover:bg-error-600 text-neutral-0';
      case 'warning':
        return 'bg-warning-500 hover:bg-warning-600 text-neutral-0';
      case 'success':
        return 'bg-success-500 hover:bg-success-600 text-neutral-0';
      default:
        return 'btn-primary';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-space-4 flex items-center justify-center rounded-full bg-neutral-100">
          {getIcon()}
        </div>
        
        <p className="body-text mb-space-6">{message}</p>
        
        <div className="flex space-x-space-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-outline px-space-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-space-6 py-space-2 rounded-radius-md font-weight-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClass()}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
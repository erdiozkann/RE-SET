import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(message.id), 300);
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getTypeStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <i className="ri-check-circle-line text-green-600 text-xl"></i>;
      case 'error':
        return <i className="ri-error-warning-line text-red-600 text-xl"></i>;
      case 'warning':
        return <i className="ri-alert-line text-yellow-600 text-xl"></i>;
      case 'info':
        return <i className="ri-information-line text-blue-600 text-xl"></i>;
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg
        transition-all duration-300 min-w-[300px] max-w-md
        ${getTypeStyles()}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message.message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(message.id), 300);
        }}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
};

export default Toast;

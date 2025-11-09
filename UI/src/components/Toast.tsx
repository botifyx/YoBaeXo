import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (default 5 seconds)
    if (!toast.persistent) {
      const duration = toast.duration || 3000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconProps = { className: "h-5 w-5" };

  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="h-5 w-5 text-green-400" />;
    case 'error':
      return <XCircle {...iconProps} className="h-5 w-5 text-red-400" />;
    case 'warning':
      return <AlertCircle {...iconProps} className="h-5 w-5 text-yellow-400" />;
    case 'info':
      return <Info {...iconProps} className="h-5 w-5 text-blue-400" />;
    case 'loading':
      return <Loader2 {...iconProps} className="h-5 w-5 text-pink-400 animate-spin" />;
    default:
      return <Info {...iconProps} className="h-5 w-5 text-gray-400" />;
  }
};

const getToastStyles = (type: ToastType) => {
  const baseStyles = "relative flex items-start p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02]";
  
  switch (type) {
    case 'success':
      return `${baseStyles} bg-green-500/10 border-green-500/30 text-green-100`;
    case 'error':
      return `${baseStyles} bg-red-500/10 border-red-500/30 text-red-100`;
    case 'warning':
      return `${baseStyles} bg-yellow-500/10 border-yellow-500/30 text-yellow-100`;
    case 'info':
      return `${baseStyles} bg-blue-500/10 border-blue-500/30 text-blue-100`;
    case 'loading':
      return `${baseStyles} bg-pink-500/10 border-pink-500/30 text-pink-100`;
    default:
      return `${baseStyles} bg-gray-500/10 border-gray-500/30 text-gray-100`;
  }
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      const element = document.getElementById(`toast-${toast.id}`);
      if (element) {
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [toast.id]);

  const handleRemove = () => {
    const element = document.getElementById(`toast-${toast.id}`);
    if (element) {
      element.style.transform = 'translateX(100%)';
      element.style.opacity = '0';
      setTimeout(() => onRemove(toast.id), 300);
    } else {
      onRemove(toast.id);
    }
  };

  return (
    <div
      id={`toast-${toast.id}`}
      className={getToastStyles(toast.type)}
      style={{
        transform: 'translateX(100%)',
        opacity: '0',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="flex items-start space-x-3 flex-1">
        <ToastIcon type={toast.type} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white font-poppins">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
      </div>
      
      {!toast.persistent && (
        <button
          onClick={handleRemove}
          className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors duration-200"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-white" />
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Convenience hooks for different toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message, duration: 4000 }),
    
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message, duration: 6000 }),
    
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message, duration: 5000 }),
    
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message, duration: 4000 }),
    
    loading: (title: string, message?: string, persistent = false) =>
      addToast({ type: 'loading', title, message, persistent }),
  };
};
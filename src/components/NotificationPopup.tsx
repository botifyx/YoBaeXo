import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationPopupProps {
  isOpen: boolean;
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : XCircle;
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const textColor = isSuccess ? 'text-green-400' : 'text-red-400';

  // Auto-close after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
            <h3 className="text-xl font-bold text-white font-poppins">
              {isSuccess ? 'Success!' : 'Error!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>
        <p className={`text-gray-300 mb-4 ${textColor} font-medium`}>
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
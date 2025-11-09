import React from 'react';
import { Loader2, Music, Download, CreditCard, LogIn, UserPlus } from 'lucide-react';

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoaderType = 'spinner' | 'dots' | 'pulse' | 'music' | 'download' | 'payment' | 'auth' | 'register';

interface LoaderProps {
  size?: LoaderSize;
  type?: LoaderType;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const getSizeClasses = (size: LoaderSize) => {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'md':
      return 'h-6 w-6';
    case 'lg':
      return 'h-8 w-8';
    case 'xl':
      return 'h-12 w-12';
    default:
      return 'h-6 w-6';
  }
};

const getTextSize = (size: LoaderSize) => {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    default:
      return 'text-base';
  }
};

const Spinner: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <Loader2 className={`animate-spin text-pink-500 ${getSizeClasses(size)} ${className}`} />
);

const Dots: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => {
  const dotSize = size === 'sm' ? 'h-1 w-1' : size === 'lg' ? 'h-3 w-3' : 'h-2 w-2';
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSize} bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

const Pulse: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <div className={`${getSizeClasses(size)} bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse ${className}`} />
);

const MusicIconLoader: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <div className={`relative ${getSizeClasses(size)} ${className}`}>
    <Music className={`h-full w-full text-pink-500 animate-bounce`} />
    <div className="absolute inset-0 animate-ping">
      <Music className={`h-full w-full text-pink-300 opacity-20`} />
    </div>
  </div>
);

const DownloadIconLoader: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <div className={`relative ${getSizeClasses(size)} ${className}`}>
    <Download className={`h-full w-full text-violet-500 animate-bounce`} />
    <div className="absolute inset-0 animate-ping">
      <Download className={`h-full w-full text-violet-300 opacity-20`} />
    </div>
  </div>
);

const PaymentIconLoader: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <div className={`relative ${getSizeClasses(size)} ${className}`}>
    <CreditCard className={`h-full w-full text-green-500 animate-pulse`} />
    <div className="absolute -top-1 -right-1">
      <div className="h-3 w-3 bg-green-400 rounded-full animate-ping" />
    </div>
  </div>
);

const AuthIconLoader: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <div className={`relative ${getSizeClasses(size)} ${className}`}>
    <LogIn className={`h-full w-full text-blue-500 animate-bounce`} />
    <div className="absolute inset-0 animate-ping">
      <LogIn className={`h-full w-full text-blue-300 opacity-20`} />
    </div>
  </div>
);

const RegisterIconLoader: React.FC<{ size: LoaderSize; className?: string }> = ({ size, className = '' }) => (
  <div className={`relative ${getSizeClasses(size)} ${className}`}>
    <UserPlus className={`h-full w-full text-purple-500 animate-bounce`} />
    <div className="absolute inset-0 animate-ping">
      <UserPlus className={`h-full w-full text-purple-300 opacity-20`} />
    </div>
  </div>
);

const LoaderIcon: React.FC<{ type: LoaderType; size: LoaderSize; className?: string }> = ({ 
  type, 
  size, 
  className = '' 
}) => {
  switch (type) {
    case 'dots':
      return <Dots size={size} className={className} />;
    case 'pulse':
      return <Pulse size={size} className={className} />;
    case 'music':
      return <MusicIconLoader size={size} className={className} />;
    case 'download':
      return <DownloadIconLoader size={size} className={className} />;
    case 'payment':
      return <PaymentIconLoader size={size} className={className} />;
    case 'auth':
      return <AuthIconLoader size={size} className={className} />;
    case 'register':
      return <RegisterIconLoader size={size} className={className} />;
    default:
      return <Spinner size={size} className={className} />;
  }
};

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  type = 'spinner', 
  text, 
  className = '', 
  fullScreen = false 
}) => {
  const baseClasses = fullScreen 
    ? 'fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center';
  
  const content = (
    <div className={`${baseClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <LoaderIcon type={type} size={size} />
        {text && (
          <p className={`text-gray-300 font-medium ${getTextSize(size)} animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );

  return fullScreen ? content : <div className={content.props.className}>{content.props.children}</div>;
};

// Specialized loader components
export const LoadingSpinner: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="spinner" />
);

export const LoadingDots: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="dots" />
);

export const LoadingPulse: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="pulse" />
);

export const MusicLoader: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="music" />
);

export const DownloadLoader: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="download" />
);

export const PaymentLoader: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="payment" text={props.text || 'Processing payment...'} />
);

export const AuthLoader: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="auth" text={props.text || 'Signing in...'} />
);

export const RegisterLoader: React.FC<Omit<LoaderProps, 'type'>> = (props) => (
  <Loader {...props} type="register" text={props.text || 'Creating account...'} />
);

// Button loader for form submissions
export const ButtonLoader: React.FC<{ size?: LoaderSize; type?: LoaderType }> = ({ 
  size = 'sm', 
  type = 'spinner' 
}) => (
  <div className="flex items-center space-x-2">
    <LoaderIcon type={type} size={size} />
  </div>
);

// Overlay loader for modals and pages
export const OverlayLoader: React.FC<Omit<LoaderProps, 'fullScreen'>> = (props) => (
  <Loader {...props} fullScreen={true} />
);
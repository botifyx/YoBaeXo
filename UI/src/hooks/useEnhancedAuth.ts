import { useAuth } from '../lib/auth';
import { useToastHelpers } from '../components/Toast';

export const useEnhancedAuth = () => {
  const { login, register, logout, ...authProps } = useAuth();
  const toast = useToastHelpers();

  const enhancedLogin = async (email: string, password: string) => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Signing in...', 'Please wait while we authenticate your credentials');
      
      const result = await login(email, password);
      
      // Remove loading toast and show success
      toast.success('Welcome back!', 'You have been successfully signed in');
      
      return result;
    } catch (error) {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error('Login Failed', errorMessage);
      throw error;
    }
  };

  const enhancedRegister = async (name: string, email: string, password: string) => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Creating account...', 'Setting up your profile and preferences');
      
      const result = await register(name, email, password);
      
      // Remove loading toast and show success
      toast.success('Account Created!', 'Your account has been successfully created. Please check your email to verify your account.');
      
      return result;
    } catch (error) {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error('Registration Failed', errorMessage);
      throw error;
    }
  };

  const enhancedLogout = async () => {
    try {
      // Show loading toast
      toast.loading('Signing out...', 'Please wait while we log you out');
      
      await logout();
      
      // Show success message
      toast.success('Signed out', 'You have been successfully signed out');
    } catch (error) {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Logout failed. Please try again.';
      toast.error('Logout Failed', errorMessage);
      throw error;
    }
  };

  return {
    ...authProps,
    login: enhancedLogin,
    register: enhancedRegister,
    logout: enhancedLogout,
  };
};
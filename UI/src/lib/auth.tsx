import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface UserData {
  uid: string;
  name: string;
  email: string;
  licenseStatus: 'free' | 'active';
  createdAt: Date;
  emailVerified?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<{ user: User; idToken: string }>;
  register: (name: string, email: string, password: string) => Promise<{ user: User; idToken: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  verifyEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: User): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: user.uid,
          name: data.name || '',
          email: data.email || user.email || '',
          licenseStatus: data.licenseStatus || 'free',
          createdAt: data.createdAt?.toDate() || new Date(),
          emailVerified: data.emailVerified || user.emailVerified,
        };
      } else {
        // Create user document if it doesn't exist
        const newUserData = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          licenseStatus: 'free' as const,
          createdAt: new Date(),
          emailVerified: user.emailVerified || false,
        };
        
        await setDoc(userDocRef, newUserData);
        return newUserData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get ID token for backend authentication
      const idToken = await user.getIdToken();
      
      // Store token for future API calls
      localStorage.setItem('firebaseIdToken', idToken);
      
      // Fetch and set user data
      const userDataResult = await fetchUserData(user);
      setUserData(userDataResult);

      return { user, idToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Step 1: Sign up with Firebase REST API (no displayName)
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      if (!apiKey) {
        throw new Error('Firebase API key not found');
      }

      const signUpResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
          }),
        }
      );

      if (!signUpResponse.ok) {
        const errorData = await signUpResponse.json();
        throw new Error(errorData.error?.message || 'Sign up failed');
      }

      const signUpData = await signUpResponse.json();
      const { idToken, localId, email: registeredEmail } = signUpData;

      // Step 2: Update profile with displayName
      const updateProfileResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken,
            displayName: name,
            returnSecureToken: true
          }),
        }
      );

      if (!updateProfileResponse.ok) {
        const errorData = await updateProfileResponse.json();
        throw new Error(errorData.error?.message || 'Profile update failed');
      }
      
      // Create a minimal user object for consistency with the rest of the app
      const user = {
        uid: localId,
        email: registeredEmail,
        displayName: name,
        emailVerified: false,
        getIdToken: async () => idToken
      } as User;

      // Store token for future API calls
      localStorage.setItem('firebaseIdToken', idToken);

      // Create user document in Firestore
      const newUserData = {
        uid: localId,
        name: name,
        email: registeredEmail,
        licenseStatus: 'free' as const,
        createdAt: new Date(),
        emailVerified: false,
      };

      await setDoc(doc(db, 'users', localId), newUserData);
      setUserData(newUserData);

      // Send email verification using Firebase Auth
      try {
        await sendEmailVerification(user);
      } catch (emailError) {
        console.warn('Email verification failed:', emailError);
        // Don't throw - email verification is not critical
      }

      return { user, idToken };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const getAuthToken = async (): Promise<string | null> => {
    if (currentUser) {
      try {
        return await currentUser.getIdToken();
      } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
      }
    }
    return null;
  };

  const refreshUserData = async () => {
    if (currentUser) {
      const data = await fetchUserData(currentUser);
      setUserData(data);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDataResult = await fetchUserData(user);
        setUserData(userDataResult);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    login,
    register,
    logout,
    loading,
    verifyEmail,
    resetPassword,
    refreshUserData,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
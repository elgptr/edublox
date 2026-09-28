import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import firebaseService from '@services/firebaseService';

export interface AppState {
  isLoading: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  userId: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AppState>({
    isLoading: true,
    isLoggedIn: false,
    currentUser: null,
    userId: null,
  });

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = firebaseService.getAuth()?.onAuthStateChanged((user) => {
      setState({
        isLoading: false,
        isLoggedIn: !!user,
        currentUser: user,
        userId: user?.uid || null,
      });
    });

    return () => unsubscribe?.();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await firebaseService.login(email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const result = await firebaseService.signup(email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseService.logout();
    } catch (error) {
      throw error;
    }
  };

  return {
    ...state,
    login,
    signup,
    logout,
  };
};

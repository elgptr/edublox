import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import firebaseService from '../services/firebaseService';
import firestoreService from '../services/firestoreService';

export interface AppState {
  isLoading: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  userId: string | null;
  isAdmin: boolean;
  userRole: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AppState>({
    isLoading: true,
    isLoggedIn: false,
    currentUser: null,
    userId: null,
    isAdmin: false,
    userRole: 'user',
  });

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = firebaseService.getAuth()?.onAuthStateChanged(async (user) => {
      let role = 'user';
      let adminFlag = false;

      if (user) {
        const emailLower = user.email?.toLowerCase() || '';
        if (emailLower === 'admin@edublox.id' || emailLower.startsWith('admin')) {
          adminFlag = true;
          role = 'admin';
        } else {
          try {
            const profile = await firestoreService.getUserProfile(user.uid);
            if (profile?.role === 'admin') {
              adminFlag = true;
              role = 'admin';
            }
          } catch {}
        }
      }

      setState({
        isLoading: false,
        isLoggedIn: !!user,
        currentUser: user,
        userId: user?.uid || null,
        isAdmin: adminFlag,
        userRole: role,
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
      if (result.user) {
        await firestoreService.createUserProfile(
          result.user.uid,
          email,
          result.user.displayName || email.split('@')[0],
          'user'
        );
      }
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

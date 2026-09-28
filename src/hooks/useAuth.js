import { useState, useEffect } from 'react';
import firebaseService from '@services/firebaseService';
export const useAuth = () => {
    const [state, setState] = useState({
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
    const login = async (email, password) => {
        try {
            const result = await firebaseService.login(email, password);
            return result.user;
        }
        catch (error) {
            throw error;
        }
    };
    const signup = async (email, password) => {
        try {
            const result = await firebaseService.signup(email, password);
            return result.user;
        }
        catch (error) {
            throw error;
        }
    };
    const logout = async () => {
        try {
            await firebaseService.logout();
        }
        catch (error) {
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
//# sourceMappingURL=useAuth.js.map
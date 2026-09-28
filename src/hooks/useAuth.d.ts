import { User } from 'firebase/auth';
export interface AppState {
    isLoading: boolean;
    isLoggedIn: boolean;
    currentUser: User | null;
    userId: string | null;
}
export declare const useAuth: () => {
    isLoading: boolean;
    isLoggedIn: boolean;
    currentUser: User | null;
    userId: string | null;
    login: (email: string, password: string) => Promise<User>;
    signup: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
};
//# sourceMappingURL=useAuth.d.ts.map
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
declare class FirebaseService {
    private static instance;
    private auth;
    private db;
    private initialized;
    private constructor();
    private initialize;
    static getInstance(): FirebaseService;
    isInitialized(): boolean;
    getAuth(): Auth | null;
    getFirestore(): Firestore | null;
    signup(email: string, password: string): Promise<import("@firebase/auth").UserCredential>;
    login(email: string, password: string): Promise<import("@firebase/auth").UserCredential>;
    logout(): Promise<void>;
    getCurrentUser(): import("@firebase/auth").User | null;
}
declare const _default: FirebaseService;
export default _default;
//# sourceMappingURL=firebaseService.d.ts.map
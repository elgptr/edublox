import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};
class FirebaseService {
    constructor() {
        Object.defineProperty(this, "auth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "initialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.initialize();
    }
    initialize() {
        try {
            if (!firebaseConfig.projectId) {
                console.warn('Firebase config not set. Check .env file.');
                return;
            }
            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);
            this.db = getFirestore(app);
            this.initialized = true;
        }
        catch (error) {
            console.error('Firebase initialization failed:', error);
        }
    }
    static getInstance() {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }
    isInitialized() {
        return this.initialized;
    }
    getAuth() {
        return this.auth;
    }
    getFirestore() {
        return this.db;
    }
    async signup(email, password) {
        if (!this.auth)
            throw new Error('Firebase not initialized');
        return createUserWithEmailAndPassword(this.auth, email, password);
    }
    async login(email, password) {
        if (!this.auth)
            throw new Error('Firebase not initialized');
        return signInWithEmailAndPassword(this.auth, email, password);
    }
    async logout() {
        if (!this.auth)
            throw new Error('Firebase not initialized');
        return firebaseSignOut(this.auth);
    }
    getCurrentUser() {
        return this.auth?.currentUser || null;
    }
}
export default FirebaseService.getInstance();
//# sourceMappingURL=firebaseService.js.map
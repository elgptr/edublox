import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

class FirebaseService {
  private static instance: FirebaseService;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private initialized = false;

  private constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      if (!firebaseConfig.projectId) {
        console.warn('Firebase config not set. Check .env file.');
        return;
      }
      const app = initializeApp(firebaseConfig);
      this.auth = getAuth(app);
      this.db = getFirestore(app);
      this.initialized = true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getAuth(): Auth | null {
    return this.auth;
  }

  getFirestore(): Firestore | null {
    return this.db;
  }

  async signup(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase not initialized');
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async login(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase not initialized');
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    if (!this.auth) throw new Error('Firebase not initialized');
    return firebaseSignOut(this.auth);
  }

  getCurrentUser() {
    return this.auth?.currentUser || null;
  }
}

export default FirebaseService.getInstance();


import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyAtFO7ZzGjz2512aiYWa5WzzmsYMkd176A',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'edublox-73d4d.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID || 'edublox-73d4d',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'edublox-73d4d.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '383773373748',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID || '1:383773373748:web:2fc28a9204d72779062161',
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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.auth) throw new Error('Firebase belum terinisialisasi.');
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Tidak ada pengguna yang sedang login.');
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }

  async sendPasswordReset(email: string): Promise<void> {
    if (!this.auth) throw new Error('Firebase belum terinisialisasi.');
    await sendPasswordResetEmail(this.auth, email.trim());
  }
}

export default FirebaseService.getInstance();

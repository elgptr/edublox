import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import firebaseService from './firebaseService';
import { ExamResult, ExamSetup } from '@types/index';

export class FirestoreService {
  private db = firebaseService.getFirestore();

  /**
   * Save exam setup ke Firestore
   */
  async saveExamSetup(userId: string, setup: ExamSetup) {
    if (!this.db) throw new Error('Firestore not initialized');

    const examSetupCollection = collection(this.db, 'users', userId, 'examSetups');
    const docRef = await addDoc(examSetupCollection, {
      ...setup,
      createdAt: Timestamp.fromDate(setup.createdAt),
    });

    return docRef.id;
  }

  /**
   * Get exam setup by ID
   */
  async getExamSetup(userId: string, setupId: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const docRef = doc(this.db, 'users', userId, 'examSetups', setupId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() };
  }

  /**
   * Get all exam setups for user
   */
  async getExamSetups(userId: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const q = query(collection(this.db, 'users', userId, 'examSetups'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Save exam result
   */
  async saveExamResult(userId: string, result: ExamResult) {
    if (!this.db) throw new Error('Firestore not initialized');

    const examResultCollection = collection(this.db, 'users', userId, 'examResults');
    const docRef = await addDoc(examResultCollection, {
      ...result,
      startedAt: Timestamp.fromDate(result.startedAt),
      completedAt: Timestamp.fromDate(result.completedAt),
    });

    return docRef.id;
  }

  /**
   * Get exam result
   */
  async getExamResult(userId: string, resultId: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const docRef = doc(this.db, 'users', userId, 'examResults', resultId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() };
  }

  /**
   * Get all exam results for user
   */
  async getExamResults(userId: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const q = query(collection(this.db, 'users', userId, 'examResults'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Create user document
   */
  async createUserProfile(userId: string, email: string, displayName: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const userRef = doc(this.db, 'users', userId);
    await setDoc(userRef, {
      email,
      displayName,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const userRef = doc(this.db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    return userSnap.data();
  }
}

export default new FirestoreService();

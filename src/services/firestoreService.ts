import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import firebaseService from './firebaseService';
import type { ExamResult, ExamSetup, User, DiscountCoupon, UserFeedback, FeedbackStatus, SystemAIEndpointConfig } from '../types';

/**
 * Membersihkan objek secara rekursif dari nilai `undefined`
 * dan mengonversi Date ke Firestore Timestamp
 */
export function sanitizeForFirestore(data: any): any {
  if (data === undefined) {
    return null;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return Timestamp.fromDate(data);
  }
  if (data instanceof Timestamp) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined);
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned;
}

export class FirestoreService {
  private db = firebaseService.getFirestore();

  /**
   * Save exam setup ke Firestore
   */
  async saveExamSetup(userId: string, setup: ExamSetup) {
    if (!this.db) throw new Error('Firestore not initialized');

    const sanitized = sanitizeForFirestore({
      ...setup,
      createdAt: setup.createdAt instanceof Date ? Timestamp.fromDate(setup.createdAt) : setup.createdAt,
    });

    const examSetupCollection = collection(this.db, 'users', userId, 'examSetups');
    const docRef = await addDoc(examSetupCollection, sanitized);

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

    const sanitized = sanitizeForFirestore({
      ...result,
      startedAt: result.startedAt instanceof Date ? Timestamp.fromDate(result.startedAt) : result.startedAt,
      completedAt: result.completedAt instanceof Date ? Timestamp.fromDate(result.completedAt) : result.completedAt,
    });

    const examResultCollection = collection(this.db, 'users', userId, 'examResults');
    const docRef = await addDoc(examResultCollection, sanitized);

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
  async createUserProfile(userId: string, email: string, displayName: string, role: string = 'user') {
    if (!this.db) throw new Error('Firestore not initialized');

    const userRef = doc(this.db, 'users', userId);
    await setDoc(userRef, {
      email,
      displayName,
      role,
      isSubscribed: false,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    if (!this.db) return null;

    try {
      const userRef = doc(this.db, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
      return null;
    }
  }

  // ================= ADMIN MONITORING SERVICES =================

  /**
   * Ambil seluruh user terdaftar untuk monitoring Admin
   */
  async getAllUsers(): Promise<User[]> {
    if (!this.db) return [];

    try {
      const q = query(collection(this.db, 'users'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          email: data.email || '',
          displayName: data.displayName || data.email?.split('@')[0] || 'User',
          role: data.role || 'user',
          isSubscribed: !!data.isSubscribed,
          subscriptionPlan: data.subscriptionPlan || undefined,
          subscriptionExpiresAt: data.subscriptionExpiresAt ? (data.subscriptionExpiresAt.toDate ? data.subscriptionExpiresAt.toDate() : new Date(data.subscriptionExpiresAt)) : undefined,
          specialDiscountPercent: data.specialDiscountPercent || 0,
          assignedCouponCode: data.assignedCouponCode || undefined,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
          lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin)) : new Date(),
        };
      });
    } catch (e) {
      console.warn('Gagal fetch all users:', e);
      return [];
    }
  }

  /**
   * Berikan Free Upgrade Paket Langganan kepada User tertentu
   */
  async grantFreeUpgrade(userId: string, planName: string = 'Paket Free Upgrade Admin (3x Kuota)', durationDays: number = 30) {
    if (!this.db) throw new Error('Firestore not initialized');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      isSubscribed: true,
      subscriptionPlan: planName,
      subscriptionExpiresAt: Timestamp.fromDate(expiresAt),
      upgradedByAdmin: true,
      updatedAt: Timestamp.now(),
    });

    return { expiresAt };
  }

  /**
   * Berikan Diskon Khusus langsung ke User tertentu
   */
  async grantSpecialDiscount(userId: string, discountPercent: number, couponCode?: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      specialDiscountPercent: discountPercent,
      assignedCouponCode: couponCode || `KHUSUS-${discountPercent}%`,
      updatedAt: Timestamp.now(),
    });
  }

  // ================= KUPON & DISKON SERVICES =================

  /**
   * Buat kupon promo baru
   */
  async createCoupon(coupon: DiscountCoupon) {
    if (!this.db) throw new Error('Firestore not initialized');

    const couponCollection = collection(this.db, 'discountCoupons');
    const sanitized = sanitizeForFirestore({
      ...coupon,
      code: coupon.code.toUpperCase().trim(),
      validUntil: Timestamp.fromDate(coupon.validUntil),
      createdAt: Timestamp.now(),
    });

    const docRef = await addDoc(couponCollection, sanitized);
    return docRef.id;
  }

  /**
   * Ambil daftar seluruh kupon diskon
   */
  async getCoupons(): Promise<DiscountCoupon[]> {
    if (!this.db) return [];

    try {
      const q = query(collection(this.db, 'discountCoupons'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          code: data.code,
          discountPercent: data.discountPercent,
          validUntil: data.validUntil?.toDate ? data.validUntil.toDate() : new Date(data.validUntil),
          description: data.description,
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        };
      });
    } catch (e) {
      return [];
    }
  }

  // ================= MAILBOX / FEEDBACK SERVICES =================

  /**
   * Kirim pesan / feedback dari user ke mailbox Admin
   */
  async sendFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>) {
    if (!this.db) throw new Error('Firestore not initialized');

    const feedbackCollection = collection(this.db, 'feedback');
    const sanitized = sanitizeForFirestore({
      ...feedback,
      status: 'new',
      createdAt: Timestamp.now(),
    });

    const docRef = await addDoc(feedbackCollection, sanitized);
    return docRef.id;
  }

  /**
   * Ambil seluruh feedback untuk Mailbox Admin
   */
  async getFeedbackMessages(): Promise<UserFeedback[]> {
    if (!this.db) return [];

    try {
      const q = query(collection(this.db, 'feedback'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || '',
          userEmail: data.userEmail || '',
          userName: data.userName || data.userEmail?.split('@')[0] || 'User',
          category: data.category || 'pertanyaan',
          subject: data.subject || '',
          message: data.message || '',
          status: data.status || 'new',
          adminReply: data.adminReply || undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          resolvedAt: data.resolvedAt?.toDate ? data.resolvedAt.toDate() : undefined,
        };
      });
    } catch (e) {
      console.warn('Gagal fetch feedback:', e);
      return [];
    }
  }

  /**
   * Update status dan respon admin pada feedback
   */
  async updateFeedbackStatus(feedbackId: string, status: FeedbackStatus, adminReply?: string) {
    if (!this.db) throw new Error('Firestore not initialized');

    const feedbackRef = doc(this.db, 'feedback', feedbackId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply;
    }
    if (status === 'resolved') {
      updateData.resolvedAt = Timestamp.now();
    }

    await updateDoc(feedbackRef, updateData);
  }

  /**
   * Menghapus pesan feedback dari Firestore
   */
  async deleteFeedbackMessage(feedbackId: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    const feedbackRef = doc(this.db, 'feedback', feedbackId);
    await deleteDoc(feedbackRef);
  }

  /**
   * Mengambil riwayat pesan feedback milik user tertentu
   */
  async getUserFeedbacks(userId: string): Promise<UserFeedback[]> {
    if (!this.db || !userId) return [];

    try {
      const q = query(collection(this.db, 'feedback'), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId || '',
          userEmail: data.userEmail || '',
          userName: data.userName || data.userEmail?.split('@')[0] || 'User',
          category: data.category || 'pertanyaan',
          subject: data.subject || '',
          message: data.message || '',
          status: data.status || 'new',
          adminReply: data.adminReply || undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          resolvedAt: data.resolvedAt?.toDate ? data.resolvedAt.toDate() : undefined,
        };
      });
    } catch (e) {
      console.warn('Gagal fetch user feedback:', e);
      return [];
    }
  }

  /**
   * Menyimpan konfigurasi endpoint custom untuk AI Bawaan sistem
   */
  async saveSystemAIConfig(config: Partial<SystemAIEndpointConfig>, updatedBy?: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');

    const configDocRef = doc(this.db, 'systemSettings', 'ai_endpoint');
    const sanitized = sanitizeForFirestore({
      ...config,
      updatedAt: Timestamp.now(),
      updatedBy: updatedBy || 'admin',
    });

    await setDoc(configDocRef, sanitized, { merge: true });
  }

  /**
   * Mengambil konfigurasi endpoint custom untuk AI Bawaan sistem
   */
  async getSystemAIConfig(): Promise<SystemAIEndpointConfig | null> {
    if (!this.db) return null;

    try {
      const configDocRef = doc(this.db, 'systemSettings', 'ai_endpoint');
      const docSnap = await getDoc(configDocRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        enabled: data.enabled !== undefined ? !!data.enabled : true,
        provider: data.provider || 'openai',
        baseUrl: data.baseUrl || '',
        apiKey: data.apiKey || '',
        model: data.model || '',
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
        updatedBy: data.updatedBy || '',
      };
    } catch (e) {
      console.warn('Gagal membaca system AI config dari Firestore:', e);
      return null;
    }
  }
}

export default new FirestoreService();

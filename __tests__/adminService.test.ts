jest.mock('firebase/firestore', () => {
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    static fromDate(date: Date) {
      return new MockTimestamp(Math.floor(date.getTime() / 1000), (date.getTime() % 1000) * 1000000);
    }
    static now() {
      return MockTimestamp.fromDate(new Date());
    }
    toMillis() {
      return this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000);
    }
    toDate() {
      return new Date(this.toMillis());
    }
  }

  return {
    collection: jest.fn((db, col) => ({ path: col })),
    doc: jest.fn((db, col, id) => ({ path: `${col}/${id}`, id })),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn().mockResolvedValue({ id: 'mock_doc_id' }),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    query: jest.fn((c) => c),
    where: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({ docs: [] }),
    Timestamp: MockTimestamp,
  };
});

jest.mock('../src/services/firebaseService', () => ({
  getFirestore: jest.fn(() => ({})),
}));

import firestoreService from '../src/services/firestoreService';
import { doc, collection, addDoc, updateDoc } from 'firebase/firestore';

describe('Admin & Mailbox Firestore Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('grantFreeUpgrade', () => {
    it('should update user with 30-day active subscription', async () => {
      const result = await firestoreService.grantFreeUpgrade('user_123', 'Paket VIP 3x Kuota', 30);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user_123');
      expect(updateDoc).toHaveBeenCalledTimes(1);
      const updatePayload = (updateDoc as jest.Mock).mock.calls[0][1];

      expect(updatePayload.isSubscribed).toBe(true);
      expect(updatePayload.subscriptionPlan).toBe('Paket VIP 3x Kuota');
      expect(updatePayload.upgradedByAdmin).toBe(true);
      expect(updatePayload.subscriptionExpiresAt).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('grantSpecialDiscount', () => {
    it('should assign custom discount percentage and coupon code to user', async () => {
      await firestoreService.grantSpecialDiscount('user_456', 50, 'SUPER50');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user_456');
      expect(updateDoc).toHaveBeenCalledTimes(1);
      const updatePayload = (updateDoc as jest.Mock).mock.calls[0][1];

      expect(updatePayload.specialDiscountPercent).toBe(50);
      expect(updatePayload.assignedCouponCode).toBe('SUPER50');
    });

    it('should generate fallback coupon code if not provided', async () => {
      await firestoreService.grantSpecialDiscount('user_789', 30);

      const updatePayload = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updatePayload.specialDiscountPercent).toBe(30);
      expect(updatePayload.assignedCouponCode).toBe('KHUSUS-30%');
    });
  });

  describe('createCoupon', () => {
    it('should create coupon with uppercased code and timestamp', async () => {
      const couponId = await firestoreService.createCoupon({
        code: 'promo50',
        discountPercent: 50,
        validUntil: new Date('2026-12-31'),
        description: 'Diskon Akhir Tahun',
        isActive: true,
      });

      expect(couponId).toBe('mock_doc_id');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'discountCoupons');
      expect(addDoc).toHaveBeenCalledTimes(1);
      const addPayload = (addDoc as jest.Mock).mock.calls[0][1];

      expect(addPayload.code).toBe('PROMO50');
      expect(addPayload.discountPercent).toBe(50);
      expect(addPayload.validUntil).toBeDefined();
    });
  });

  describe('sendFeedback', () => {
    it('should add feedback to mailbox with status new', async () => {
      const feedbackId = await firestoreService.sendFeedback({
        userId: 'user_test',
        userEmail: 'siswa@edublox.id',
        userName: 'Siswa Juara',
        category: 'komplain_soal',
        subject: 'Soal Matematika No 3 Rancu',
        message: 'Penjelasan pilihan C dan D kurang tepat',
      });

      expect(feedbackId).toBe('mock_doc_id');
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'feedback');
      expect(addDoc).toHaveBeenCalledTimes(1);
      const payload = (addDoc as jest.Mock).mock.calls[0][1];

      expect(payload.userId).toBe('user_test');
      expect(payload.category).toBe('komplain_soal');
      expect(payload.status).toBe('new');
      expect(payload.createdAt).toBeDefined();
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update status and optional admin reply', async () => {
      await firestoreService.updateFeedbackStatus('fb_100', 'resolved', 'Terima kasih, soal sudah diperbaiki!');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'feedback', 'fb_100');
      expect(updateDoc).toHaveBeenCalledTimes(1);
      const payload = (updateDoc as jest.Mock).mock.calls[0][1];

      expect(payload.status).toBe('resolved');
      expect(payload.adminReply).toBe('Terima kasih, soal sudah diperbaiki!');
      expect(payload.resolvedAt).toBeDefined();
    });
  });
});

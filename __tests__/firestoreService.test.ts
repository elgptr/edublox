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
    toMillis() {
      return this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000);
    }
  }

  return {
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    Timestamp: MockTimestamp,
  };
});

jest.mock('../src/services/firebaseService', () => ({
  getFirestore: jest.fn(() => ({})),
}));

import { sanitizeForFirestore } from '../src/services/firestoreService';
import { Timestamp } from 'firebase/firestore';

describe('sanitizeForFirestore', () => {
  it('should remove undefined keys recursively and keep valid data', () => {
    const input = {
      id: 'test_1',
      title: 'Soal Matematika',
      visualIllustration: undefined,
      imageUrl: undefined,
      score: 100,
      nested: {
        a: 1,
        b: undefined,
        c: null,
      },
      arrayItems: [
        { name: 'Item 1', extra: undefined },
        { name: 'Item 2', value: 42 },
      ],
    };

    const sanitized = sanitizeForFirestore(input);

    expect(sanitized.id).toBe('test_1');
    expect(sanitized.title).toBe('Soal Matematika');
    expect('visualIllustration' in sanitized).toBe(false);
    expect('imageUrl' in sanitized).toBe(false);
    expect(sanitized.score).toBe(100);

    expect(sanitized.nested.a).toBe(1);
    expect('b' in sanitized.nested).toBe(false);
    expect(sanitized.nested.c).toBe(null);

    expect(sanitized.arrayItems).toHaveLength(2);
    expect('extra' in sanitized.arrayItems[0]).toBe(false);
    expect(sanitized.arrayItems[1].value).toBe(42);
  });

  it('should convert Date instances to Firestore Timestamp', () => {
    const now = new Date('2026-10-22T10:00:00Z');
    const input = {
      createdAt: now,
      name: 'Test Date',
    };

    const sanitized = sanitizeForFirestore(input);
    expect(sanitized.createdAt).toBeInstanceOf(Timestamp);
    expect(sanitized.createdAt.toMillis()).toBe(now.getTime());
  });
});

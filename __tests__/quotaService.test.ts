import { QuotaService, FREE_LIMITS, PREMIUM_LIMITS } from '../src/services/quotaService';
import AsyncStorage from '@react-native-async-storage/async-storage';

let mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(async () => {
    mockStorage = {};
  }),
}));

describe('QuotaService', () => {
  beforeEach(async () => {
    mockStorage = {};
    jest.clearAllMocks();
  });

  it('should initialize with standard free quota limits', async () => {
    const quota = await QuotaService.getQuota('test-user');
    expect(quota.generatesUsedToday).toBe(0);
    expect(quota.questionsGeneratedToday).toBe(0);
    expect(quota.maxGeneratesPerDay).toBe(FREE_LIMITS.maxGeneratesPerDay); // 5
    expect(quota.maxQuestionsPerDay).toBe(FREE_LIMITS.maxQuestionsPerDay); // 100
    expect(quota.maxQuestionsPerExam).toBe(FREE_LIMITS.maxQuestionsPerExam); // 20
    expect(quota.isSubscribed).toBe(false);
  });

  it('should prevent generating more than 20 questions per single exam', async () => {
    const check = await QuotaService.canGenerate(25, 'test-user');
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Maksimal butir soal per pembuatan adalah 20');
  });

  it('should track and enforce max 5 generations per day on free tier', async () => {
    const user = 'user-limit-test';

    for (let i = 0; i < 5; i++) {
      const check = await QuotaService.canGenerate(5, user);
      expect(check.allowed).toBe(true);
      await QuotaService.recordGeneration(5, user);
    }

    // Attempting 6th generation should be denied
    const sixthCheck = await QuotaService.canGenerate(5, user);
    expect(sixthCheck.allowed).toBe(false);
    expect(sixthCheck.reason).toContain('Batas harian 5x pembuatan soal telah tercapai');
  });

  it('should track and enforce max 100 questions per day on free tier', async () => {
    const user = 'user-total-questions';

    // 4 generations of 20 questions = 80 questions
    for (let i = 0; i < 4; i++) {
      await QuotaService.recordGeneration(20, user);
    }

    // Remaining capacity is 20. Attempting 25 questions should fail
    const overCheck = await QuotaService.canGenerate(25, user);
    expect(overCheck.allowed).toBe(false);

    // Attempting 20 should be allowed
    const validCheck = await QuotaService.canGenerate(20, user);
    expect(validCheck.allowed).toBe(true);
  });

  it('should provide 3x daily quota (15 generates, 300 questions) when subscribed', async () => {
    const user = 'premium-user';
    await QuotaService.activateSubscription(user, 'Paket Pelajar 3x Kuota (Rp 5.000/bln)');

    const quota = await QuotaService.getQuota(user);
    expect(quota.isSubscribed).toBe(true);
    expect(quota.maxGeneratesPerDay).toBe(PREMIUM_LIMITS.maxGeneratesPerDay); // 15
    expect(quota.maxQuestionsPerDay).toBe(PREMIUM_LIMITS.maxQuestionsPerDay); // 300

    // Should easily allow 10 generations
    for (let i = 0; i < 10; i++) {
      const check = await QuotaService.canGenerate(10, user);
      expect(check.allowed).toBe(true);
      await QuotaService.recordGeneration(10, user);
    }

    const midQuota = await QuotaService.getQuota(user);
    expect(midQuota.generatesUsedToday).toBe(10);
    expect(midQuota.questionsGeneratedToday).toBe(100);
  });
});

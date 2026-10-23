import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserQuota {
  userId: string;
  dateString: string; // YYYY-MM-DD
  generatesUsedToday: number;
  questionsGeneratedToday: number;
  maxGeneratesPerDay: number;
  maxQuestionsPerDay: number;
  maxQuestionsPerExam: number;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
}

export const FREE_LIMITS = {
  maxGeneratesPerDay: 5,
  maxQuestionsPerDay: 100,
  maxQuestionsPerExam: 20,
};

export const PREMIUM_LIMITS = {
  maxGeneratesPerDay: 15, // 3x kuota harian
  maxQuestionsPerDay: 300, // 3x kuota harian
  maxQuestionsPerExam: 20,
};

const QUOTA_STORAGE_PREFIX = '@edunesis_quota_';
const LEGACY_QUOTA_STORAGE_PREFIX = '@edublox_quota_';

export class QuotaService {
  private static getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private static getStorageKey(userId: string = 'guest'): string {
    return `${QUOTA_STORAGE_PREFIX}${userId}`;
  }

  public static async getQuota(userId: string = 'guest'): Promise<UserQuota> {
    const today = this.getTodayDateString();
    const key = this.getStorageKey(userId);

    try {
      let stored = await AsyncStorage.getItem(key);
      if (!stored) {
        stored = await AsyncStorage.getItem(`${LEGACY_QUOTA_STORAGE_PREFIX}${userId}`);
      }
      if (stored) {
        const data: UserQuota = JSON.parse(stored);

        // Periksa apakah langganan aktif
        let isSubscribed = data.isSubscribed || false;
        if (data.subscriptionExpiresAt) {
          const exp = new Date(data.subscriptionExpiresAt).getTime();
          if (Date.now() > exp) {
            isSubscribed = false;
          }
        }

        const limits = isSubscribed ? PREMIUM_LIMITS : FREE_LIMITS;

        // Jika hari sudah berganti, reset counter harian
        if (data.dateString !== today) {
          const resetData: UserQuota = {
            userId,
            dateString: today,
            generatesUsedToday: 0,
            questionsGeneratedToday: 0,
            maxGeneratesPerDay: limits.maxGeneratesPerDay,
            maxQuestionsPerDay: limits.maxQuestionsPerDay,
            maxQuestionsPerExam: limits.maxQuestionsPerExam,
            isSubscribed,
            subscriptionPlan: isSubscribed ? data.subscriptionPlan : undefined,
            subscriptionExpiresAt: data.subscriptionExpiresAt,
          };
          await AsyncStorage.setItem(key, JSON.stringify(resetData));
          return resetData;
        }

        return {
          ...data,
          isSubscribed,
          maxGeneratesPerDay: limits.maxGeneratesPerDay,
          maxQuestionsPerDay: limits.maxQuestionsPerDay,
          maxQuestionsPerExam: limits.maxQuestionsPerExam,
        };
      }
    } catch (e) {
      // Abaikan error parsing dan gunakan default
    }

    // Default kuota baru
    const initialQuota: UserQuota = {
      userId,
      dateString: today,
      generatesUsedToday: 0,
      questionsGeneratedToday: 0,
      maxGeneratesPerDay: FREE_LIMITS.maxGeneratesPerDay,
      maxQuestionsPerDay: FREE_LIMITS.maxQuestionsPerDay,
      maxQuestionsPerExam: FREE_LIMITS.maxQuestionsPerExam,
      isSubscribed: false,
    };

    try {
      await AsyncStorage.setItem(key, JSON.stringify(initialQuota));
    } catch {}

    return initialQuota;
  }

  public static async canGenerate(
    requestedQuestions: number,
    userId: string = 'guest'
  ): Promise<{ allowed: boolean; reason?: string; quota: UserQuota }> {
    const quota = await this.getQuota(userId);

    if (requestedQuestions > quota.maxQuestionsPerExam) {
      return {
        allowed: false,
        reason: `Maksimal butir soal per pembuatan adalah ${quota.maxQuestionsPerExam} soal.`,
        quota,
      };
    }

    if (quota.generatesUsedToday >= quota.maxGeneratesPerDay) {
      return {
        allowed: false,
        reason: `Batas harian ${quota.maxGeneratesPerDay}x pembuatan soal telah tercapai untuk hari ini. Reset kuota setiap tengah malam (00:00).`,
        quota,
      };
    }

    if (quota.questionsGeneratedToday + requestedQuestions > quota.maxQuestionsPerDay) {
      const remainingQuestions = Math.max(0, quota.maxQuestionsPerDay - quota.questionsGeneratedToday);
      return {
        allowed: false,
        reason: `Kuota butir soal harian tersisa ${remainingQuestions} soal lagi (Maksimal ${quota.maxQuestionsPerDay} soal per hari).`,
        quota,
      };
    }

    return { allowed: true, quota };
  }

  public static async recordGeneration(
    questionCount: number,
    userId: string = 'guest'
  ): Promise<UserQuota> {
    const quota = await this.getQuota(userId);
    const key = this.getStorageKey(userId);

    const updatedQuota: UserQuota = {
      ...quota,
      generatesUsedToday: quota.generatesUsedToday + 1,
      questionsGeneratedToday: quota.questionsGeneratedToday + questionCount,
    };

    try {
      await AsyncStorage.setItem(key, JSON.stringify(updatedQuota));
    } catch {}

    return updatedQuota;
  }

  public static async activateSubscription(
    userId: string = 'guest',
    planName: string = 'Paket 3x Kuota (1 Bulan)'
  ): Promise<UserQuota> {
    const quota = await this.getQuota(userId);
    const key = this.getStorageKey(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 hari

    const updatedQuota: UserQuota = {
      ...quota,
      isSubscribed: true,
      subscriptionPlan: planName,
      subscriptionExpiresAt: expiresAt.toISOString(),
      maxGeneratesPerDay: PREMIUM_LIMITS.maxGeneratesPerDay,
      maxQuestionsPerDay: PREMIUM_LIMITS.maxQuestionsPerDay,
      maxQuestionsPerExam: PREMIUM_LIMITS.maxQuestionsPerExam,
    };

    try {
      await AsyncStorage.setItem(key, JSON.stringify(updatedQuota));
    } catch {}

    return updatedQuota;
  }

  public static async resetQuota(userId: string = 'guest'): Promise<UserQuota> {
    const key = this.getStorageKey(userId);
    const quota = await this.getQuota(userId);
    const reset: UserQuota = {
      ...quota,
      generatesUsedToday: 0,
      questionsGeneratedToday: 0,
    };
    try {
      await AsyncStorage.setItem(key, JSON.stringify(reset));
    } catch {}
    return reset;
  }
}

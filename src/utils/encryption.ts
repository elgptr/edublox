/**
 * Encryption Service untuk menyimpan API key secara aman
 * Menggunakan react-native-keychain untuk secure storage
 */

import * as Keychain from 'react-native-keychain';
import type { AppError } from '../types';

export class EncryptionService {
  private static readonly SERVICE_NAME = 'edublox-ai-keys';
  private static readonly ACCOUNT_PREFIX = 'ai_key_';

  /**
   * Simpan API key terenkripsi di secure storage
   */
  static async saveAPIKey(provider: string, apiKey: string): Promise<void> {
    try {
      const account = `${this.ACCOUNT_PREFIX}${provider}`;
      await Keychain.setGenericPassword(account, apiKey, {
        service: this.SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
    } catch (error) {
      throw this.handleError(error, `Failed to save ${provider} API key`);
    }
  }

  /**
   * Ambil API key dari secure storage
   */
  static async getAPIKey(provider: string): Promise<string | null> {
    try {
      const account = `${this.ACCOUNT_PREFIX}${provider}`;
      const credentials = await Keychain.getGenericPassword({
        service: this.SERVICE_NAME,
      });

      if (!credentials || credentials.username !== account) {
        return null;
      }

      return credentials.password;
    } catch (error) {
      throw this.handleError(error, `Failed to retrieve ${provider} API key`);
    }
  }

  /**
   * Hapus API key dari secure storage
   */
  static async removeAPIKey(provider: string): Promise<void> {
    try {
      const account = `${this.ACCOUNT_PREFIX}${provider}`;
      await Keychain.resetGenericPassword({
        service: this.SERVICE_NAME,
      });
    } catch (error) {
      throw this.handleError(error, `Failed to remove ${provider} API key`);
    }
  }

  /**
   * Check apakah API key sudah tersimpan
   */
  static async hasAPIKey(provider: string): Promise<boolean> {
    try {
      const apiKey = await this.getAPIKey(provider);
      return apiKey !== null && apiKey.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Hapus semua API keys
   */
  static async clearAllKeys(): Promise<void> {
    try {
      const providers = ['openai', 'gemini', 'claude'];
      await Promise.all(providers.map((provider) => this.removeAPIKey(provider)));
    } catch (error) {
      throw this.handleError(error, 'Failed to clear all API keys');
    }
  }

  private static handleError(error: unknown, message: string): AppError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      code: 'ENCRYPTION_ERROR',
      message,
      details: errorMessage,
      timestamp: new Date(),
    };
  }
}

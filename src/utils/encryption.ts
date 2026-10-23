/**
 * Encryption Service untuk menyimpan API key secara aman
 * Menggunakan react-native-keychain untuk native dan AsyncStorage untuk web
 */

import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppError } from '../types';

const isWeb = Platform.OS === 'web';

export class EncryptionService {
  private static readonly SERVICE_NAME = 'edublox-ai-keys';
  private static readonly ACCOUNT_PREFIX = 'ai_key_';
  private static readonly WEB_PREFIX = 'edublox_sec_key_';

  /**
   * Simpan API key terenkripsi di secure storage
   */
  static async saveAPIKey(provider: string, apiKey: string): Promise<void> {
    try {
      if (isWeb || !Keychain.setGenericPassword) {
        await AsyncStorage.setItem(`${this.WEB_PREFIX}${provider}`, apiKey);
        return;
      }
      const account = `${this.ACCOUNT_PREFIX}${provider}`;
      await Keychain.setGenericPassword(account, apiKey, {
        service: this.SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
    } catch (error) {
      if (isWeb) {
        await AsyncStorage.setItem(`${this.WEB_PREFIX}${provider}`, apiKey);
        return;
      }
      throw this.handleError(error, `Failed to save ${provider} API key`);
    }
  }

  /**
   * Ambil API key dari secure storage
   */
  static async getAPIKey(provider: string): Promise<string | null> {
    try {
      if (isWeb || !Keychain.getGenericPassword) {
        return await AsyncStorage.getItem(`${this.WEB_PREFIX}${provider}`);
      }
      const account = `${this.ACCOUNT_PREFIX}${provider}`;
      const credentials = await Keychain.getGenericPassword({
        service: this.SERVICE_NAME,
      });

      if (!credentials || credentials.username !== account) {
        return null;
      }

      return credentials.password;
    } catch (error) {
      if (isWeb) {
        return await AsyncStorage.getItem(`${this.WEB_PREFIX}${provider}`);
      }
      throw this.handleError(error, `Failed to retrieve ${provider} API key`);
    }
  }

  /**
   * Hapus API key dari secure storage
   */
  static async removeAPIKey(provider: string): Promise<void> {
    try {
      if (isWeb || !Keychain.resetGenericPassword) {
        await AsyncStorage.removeItem(`${this.WEB_PREFIX}${provider}`);
        return;
      }
      await Keychain.resetGenericPassword({
        service: this.SERVICE_NAME,
      });
    } catch (error) {
      if (isWeb) {
        await AsyncStorage.removeItem(`${this.WEB_PREFIX}${provider}`);
        return;
      }
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

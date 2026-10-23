import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SystemAIEndpointConfig } from '../types';

const AI_CONFIG_KEY = 'edunesis_ai_endpoint_config';
const LEGACY_AI_CONFIG_KEY = 'edublox_ai_endpoint_config';
const SYSTEM_AI_CONFIG_KEY = 'edunesis_system_ai_endpoint_config';
const LEGACY_SYSTEM_AI_CONFIG_KEY = 'edublox_system_ai_endpoint_config';
const WEB_STORAGE_PREFIX = 'edunesis_api_key_';
const LEGACY_WEB_STORAGE_PREFIX = 'edublox_api_key_';

const isWeb = Platform.OS === 'web';

export const keyStorageService = {
  /**
   * Save an API key securely (Keychain on iOS/Android, AsyncStorage on Web)
   */
  async saveKey(provider: 'openai' | 'gemini' | 'claude', key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(`${WEB_STORAGE_PREFIX}${provider}`, key);
        return;
      }
      await Keychain.setGenericPassword(provider, key, { service: `edunesis_${provider}` });
    } catch (e) {
      if (isWeb) {
        await AsyncStorage.setItem(`${WEB_STORAGE_PREFIX}${provider}`, key);
        return;
      }
      console.error(`Error saving ${provider} key to keychain:`, e);
      throw e;
    }
  },

  /**
   * Retrieve a saved API key (Keychain on iOS/Android, AsyncStorage on Web)
   */
  async getKey(provider: 'openai' | 'gemini' | 'claude'): Promise<string | null> {
    try {
      if (isWeb) {
        const val = await AsyncStorage.getItem(`${WEB_STORAGE_PREFIX}${provider}`);
        if (val) return val;
        return await AsyncStorage.getItem(`${LEGACY_WEB_STORAGE_PREFIX}${provider}`);
      }
      const credentials = (await Keychain.getGenericPassword({ service: `edunesis_${provider}` }))
        || (await Keychain.getGenericPassword({ service: `edublox_${provider}` }));
      return credentials ? credentials.password : null;
    } catch (e) {
      if (isWeb) {
        try {
          const val = await AsyncStorage.getItem(`${WEB_STORAGE_PREFIX}${provider}`);
          if (val) return val;
          return await AsyncStorage.getItem(`${LEGACY_WEB_STORAGE_PREFIX}${provider}`);
        } catch {
          return null;
        }
      }
      console.error(`Error retrieving ${provider} key from keychain:`, e);
      return null;
    }
  },

  /**
   * Delete a saved API key
   */
  async removeKey(provider: 'openai' | 'gemini' | 'claude'): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(`${WEB_STORAGE_PREFIX}${provider}`);
        await AsyncStorage.removeItem(`${LEGACY_WEB_STORAGE_PREFIX}${provider}`);
        return;
      }
      await Keychain.resetGenericPassword({ service: `edunesis_${provider}` });
      try {
        await Keychain.resetGenericPassword({ service: `edublox_${provider}` });
      } catch {}
    } catch (e) {
      if (isWeb) {
        await AsyncStorage.removeItem(`${WEB_STORAGE_PREFIX}${provider}`);
        await AsyncStorage.removeItem(`${LEGACY_WEB_STORAGE_PREFIX}${provider}`);
        return;
      }
      console.error(`Error removing ${provider} key from keychain:`, e);
      throw e;
    }
  },

  /**
   * Check if any of the keys are set
   */
  async hasAnyKey(): Promise<boolean> {
    const openai = await this.getKey('openai');
    const gemini = await this.getKey('gemini');
    const claude = await this.getKey('claude');
    return !!(openai || gemini || claude);
  },

  async saveAIConfig(config: { provider: 'openai' | 'gemini' | 'claude'; baseUrl?: string; model?: string }): Promise<void> {
    await AsyncStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  },

  async getAIConfig(): Promise<{ provider: 'openai' | 'gemini' | 'claude'; baseUrl?: string; model?: string } | null> {
    try {
      const value = (await AsyncStorage.getItem(AI_CONFIG_KEY)) || (await AsyncStorage.getItem(LEGACY_AI_CONFIG_KEY));
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async saveSystemAIConfig(config: SystemAIEndpointConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(SYSTEM_AI_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Gagal menyimpan system AI config ke local storage:', e);
    }
  },

  async getSystemAIConfig(): Promise<SystemAIEndpointConfig | null> {
    try {
      const value = (await AsyncStorage.getItem(SYSTEM_AI_CONFIG_KEY)) || (await AsyncStorage.getItem(LEGACY_SYSTEM_AI_CONFIG_KEY));
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async removeSystemAIConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYSTEM_AI_CONFIG_KEY);
      await AsyncStorage.removeItem(LEGACY_SYSTEM_AI_CONFIG_KEY);
    } catch (e) {
      console.warn('Gagal menghapus system AI config dari local storage:', e);
    }
  }
};

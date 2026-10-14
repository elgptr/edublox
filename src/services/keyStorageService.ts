import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AIProvider } from '../types';

interface AIConfig {
  provider: AIProvider;
  baseUrl?: string;
  model?: string;
}

export const keyStorageService = {
  /**
   * Save an API key securely using the device keychain
   * @param provider - 'openai', 'gemini', or 'claude'
   * @param key - The API key string
   */
  async saveKey(provider: 'openai' | 'gemini' | 'claude', key: string): Promise<void> {
    try {
      // Store as username:provider, password:key
      await Keychain.setGenericPassword(provider, key, { service: `edublox_${provider}` });
    } catch (e) {
      console.error(`Error saving ${provider} key to keychain:`, e);
      throw e;
    }
  },

  /**
   * Retrieve a saved API key from the keychain
   * @param provider - 'openai', 'gemini', or 'claude'
   */
  async getKey(provider: 'openai' | 'gemini' | 'claude'): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: `edublox_${provider}` });
      return credentials ? credentials.password : null;
    } catch (e) {
      console.error(`Error retrieving ${provider} key from keychain:`, e);
      return null;
    }
  },

  /**
   * Delete a saved API key from the keychain
   * @param provider - 'openai', 'gemini', or 'claude'
   */
  async removeKey(provider: 'openai' | 'gemini' | 'claude'): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: `edublox_${provider}` });
    } catch (e) {
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

  /**
   * Save AI configuration (provider, baseUrl, model)
   */
  async saveAIConfig(config: AIConfig): Promise<void> {
    try {
      await AsyncStorage.setItem('edublox_ai_config', JSON.stringify(config));
    } catch (e) {
      console.error('Error saving AI config:', e);
      throw e;
    }
  },

  /**
   * Get saved AI configuration
   */
  async getAIConfig(): Promise<AIConfig | null> {
    try {
      const config = await AsyncStorage.getItem('edublox_ai_config');
      return config ? JSON.parse(config) : null;
    } catch (e) {
      console.error('Error retrieving AI config:', e);
      return null;
    }
  },
};

import * as Keychain from 'react-native-keychain';

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
  }
};

import { useState, useEffect } from 'react';
import { keyStorageService } from '../services/keyStorageService';

export type AIProvider = 'openai' | 'gemini' | 'claude';

export const useAIKey = () => {
  const [keys, setKeys] = useState<{ [key: string]: string | null }>({
    openai: null,
    gemini: null,
    claude: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const openai = await keyStorageService.getKey('openai');
      const gemini = await keyStorageService.getKey('gemini');
      const claude = await keyStorageService.getKey('claude');
      setKeys({ openai, gemini, claude });
    } catch (error) {
      console.error('Error loading AI keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveKey = async (provider: AIProvider, key: string) => {
    try {
      await keyStorageService.saveKey(provider, key);
      setKeys(prev => ({ ...prev, [provider]: key }));
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${provider} key:`, error);
      return { success: false, error };
    }
  };

  const removeKey = async (provider: AIProvider) => {
    try {
      await keyStorageService.removeKey(provider);
      setKeys(prev => ({ ...prev, [provider]: null }));
      return { success: true };
    } catch (error) {
      console.error(`Error removing ${provider} key:`, error);
      return { success: false, error };
    }
  };

  return {
    keys,
    isLoading,
    saveKey,
    removeKey,
    refreshKeys: loadKeys,
  };
};

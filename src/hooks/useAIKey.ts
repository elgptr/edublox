import { useState, useEffect } from 'react';
import { keyStorageService } from '../services/keyStorageService';
import { AIService, ActiveKeyResult } from '../services/aiService';
import type { AIProvider } from '../types';

export const useAIKey = () => {
  const [keys, setKeys] = useState<{ [key: string]: string | null }>({
    openai: null,
    gemini: null,
    claude: null,
  });
  const [activeKeyInfo, setActiveKeyInfo] = useState<ActiveKeyResult | null>(null);
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

      // Resolve key aktif (custom key vs system default key)
      try {
        const resolved = await AIService.getActiveKey();
        setActiveKeyInfo(resolved);
      } catch {
        setActiveKeyInfo(null);
      }
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
      const resolved = await AIService.getActiveKey(provider);
      setActiveKeyInfo(resolved);
      return { success: true };
    } catch (error) {
      console.error(`Error saving ${provider} key:`, error);
      return { success: false, error };
    }
  };

  const saveAIConfig = async (config: { provider: AIProvider; baseUrl?: string; model?: string }) => {
    await keyStorageService.saveAIConfig(config);
    const resolved = await AIService.getActiveKey(config.provider);
    setActiveKeyInfo(resolved);
  };

  const removeKey = async (provider: AIProvider) => {
    try {
      await keyStorageService.removeKey(provider);
      setKeys(prev => ({ ...prev, [provider]: null }));
      try {
        const resolved = await AIService.getActiveKey();
        setActiveKeyInfo(resolved);
      } catch {
        setActiveKeyInfo(null);
      }
      return { success: true };
    } catch (error) {
      console.error(`Error removing ${provider} key:`, error);
      return { success: false, error };
    }
  };

  return {
    keys,
    activeKeyInfo,
    isUsingSystemKey: activeKeyInfo?.isSystemDefault ?? false,
    hasAvailableKey: !!activeKeyInfo?.apiKey,
    isLoading,
    saveKey,
    saveAIConfig,
    removeKey,
    refreshKeys: loadKeys,
    testConnection: AIService.testConnection,
  };
};

import { AIService, normalizeBaseUrl } from '../src/services/aiService';
import { keyStorageService } from '../src/services/keyStorageService';

jest.mock('../src/services/keyStorageService', () => {
  let mockSystemConfig: any = null;
  return {
    keyStorageService: {
      getKey: jest.fn().mockResolvedValue(null),
      getAIConfig: jest.fn().mockResolvedValue(null),
      saveSystemAIConfig: jest.fn((cfg) => {
        mockSystemConfig = cfg;
        return Promise.resolve();
      }),
      getSystemAIConfig: jest.fn(() => Promise.resolve(mockSystemConfig)),
      removeSystemAIConfig: jest.fn(() => {
        mockSystemConfig = null;
        return Promise.resolve();
      }),
    },
  };
});

describe('System AI Endpoint & normalizeBaseUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SYSTEM_GEMINI_KEY = 'mock-system-gemini-key';
  });

  describe('normalizeBaseUrl', () => {
    it('should add /v1 if missing', () => {
      expect(normalizeBaseUrl('https://api.txsiber.online')).toBe('https://api.txsiber.online/v1');
      expect(normalizeBaseUrl('https://api.txsiber.online/')).toBe('https://api.txsiber.online/v1');
    });

    it('should keep /v1 without duplicate slashes', () => {
      expect(normalizeBaseUrl('https://api.txsiber.online/v1')).toBe('https://api.txsiber.online/v1');
      expect(normalizeBaseUrl('https://api.txsiber.online/v1/')).toBe('https://api.txsiber.online/v1');
      expect(normalizeBaseUrl('https://api.openai.com/v1')).toBe('https://api.openai.com/v1');
    });

    it('should handle empty or whitespace string', () => {
      expect(normalizeBaseUrl('')).toBe('');
      expect(normalizeBaseUrl('   ')).toBe('');
    });
  });

  describe('AIService.getActiveKey with System Endpoint', () => {
    it('should return custom endpoint when enabled in system config', async () => {
      await keyStorageService.saveSystemAIConfig({
        enabled: true,
        provider: 'openai',
        baseUrl: 'https://api.txsiber.online',
        apiKey: 'sk-txsiber-test-key-12345',
        model: 'claude-3-7-sonnet-latest',
      });

      const active = await AIService.getActiveKey();
      expect(active.isSystemDefault).toBe(true);
      expect(active.provider).toBe('openai');
      expect(active.apiKey).toBe('sk-txsiber-test-key-12345');
      expect(active.baseUrl).toBe('https://api.txsiber.online/v1');
      expect(active.model).toBe('claude-3-7-sonnet-latest');
    });

    it('should fallback to default Gemini when system endpoint is disabled', async () => {
      await keyStorageService.saveSystemAIConfig({
        enabled: false,
        provider: 'openai',
        baseUrl: 'https://api.txsiber.online/v1',
        apiKey: 'sk-txsiber-test-key-12345',
        model: 'claude-3-7-sonnet-latest',
      });

      const active = await AIService.getActiveKey();
      expect(active.isSystemDefault).toBe(true);
      expect(active.provider).toBe('gemini');
      expect(active.apiKey).toBeDefined();
    });
  });
});

import { keyStorageService } from '../src/services/keyStorageService';
import * as Keychain from 'react-native-keychain';

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

describe('keyStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save API key correctly', async () => {
    await keyStorageService.saveKey('openai', 'sk-test-key');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith('openai', 'sk-test-key', {
      service: 'edunesis_openai',
    });
  });

  it('should retrieve API key if it exists', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({ password: 'sk-existing-key' });
    const key = await keyStorageService.getKey('gemini');
    
    expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: 'edunesis_gemini' });
    expect(key).toBe('sk-existing-key');
  });

  it('should return null if key does not exist', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
    const key = await keyStorageService.getKey('claude');
    
    expect(key).toBeNull();
  });

  it('should check if any key exists', async () => {
    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce(false) // openai
      .mockResolvedValueOnce({ password: 'key' }) // gemini
      .mockResolvedValueOnce(false); // claude
      
    const hasAny = await keyStorageService.hasAnyKey();
    expect(hasAny).toBe(true);
  });
});

/**
 * Encryption Service untuk menyimpan API key secara aman
 * Menggunakan react-native-keychain untuk secure storage
 */
import * as Keychain from 'react-native-keychain';
export class EncryptionService {
    /**
     * Simpan API key terenkripsi di secure storage
     */
    static async saveAPIKey(provider, apiKey) {
        try {
            const account = `${this.ACCOUNT_PREFIX}${provider}`;
            await Keychain.setGenericPassword(account, apiKey, {
                service: this.SERVICE_NAME,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            });
        }
        catch (error) {
            throw this.handleError(error, `Failed to save ${provider} API key`);
        }
    }
    /**
     * Ambil API key dari secure storage
     */
    static async getAPIKey(provider) {
        try {
            const account = `${this.ACCOUNT_PREFIX}${provider}`;
            const credentials = await Keychain.getGenericPassword({
                service: this.SERVICE_NAME,
            });
            if (!credentials || credentials.username !== account) {
                return null;
            }
            return credentials.password;
        }
        catch (error) {
            throw this.handleError(error, `Failed to retrieve ${provider} API key`);
        }
    }
    /**
     * Hapus API key dari secure storage
     */
    static async removeAPIKey(provider) {
        try {
            const account = `${this.ACCOUNT_PREFIX}${provider}`;
            await Keychain.resetGenericPassword({
                service: this.SERVICE_NAME,
            });
        }
        catch (error) {
            throw this.handleError(error, `Failed to remove ${provider} API key`);
        }
    }
    /**
     * Check apakah API key sudah tersimpan
     */
    static async hasAPIKey(provider) {
        try {
            const apiKey = await this.getAPIKey(provider);
            return apiKey !== null && apiKey.length > 0;
        }
        catch {
            return false;
        }
    }
    /**
     * Hapus semua API keys
     */
    static async clearAllKeys() {
        try {
            const providers = ['openai', 'gemini', 'claude'];
            await Promise.all(providers.map((provider) => this.removeAPIKey(provider)));
        }
        catch (error) {
            throw this.handleError(error, 'Failed to clear all API keys');
        }
    }
    static handleError(error, message) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            code: 'ENCRYPTION_ERROR',
            message,
            details: errorMessage,
            timestamp: new Date(),
        };
    }
}
Object.defineProperty(EncryptionService, "SERVICE_NAME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'edublox-ai-keys'
});
Object.defineProperty(EncryptionService, "ACCOUNT_PREFIX", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'ai_key_'
});
//# sourceMappingURL=encryption.js.map
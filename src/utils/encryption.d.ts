/**
 * Encryption Service untuk menyimpan API key secara aman
 * Menggunakan react-native-keychain untuk secure storage
 */
export declare class EncryptionService {
    private static readonly SERVICE_NAME;
    private static readonly ACCOUNT_PREFIX;
    /**
     * Simpan API key terenkripsi di secure storage
     */
    static saveAPIKey(provider: string, apiKey: string): Promise<void>;
    /**
     * Ambil API key dari secure storage
     */
    static getAPIKey(provider: string): Promise<string | null>;
    /**
     * Hapus API key dari secure storage
     */
    static removeAPIKey(provider: string): Promise<void>;
    /**
     * Check apakah API key sudah tersimpan
     */
    static hasAPIKey(provider: string): Promise<boolean>;
    /**
     * Hapus semua API keys
     */
    static clearAllKeys(): Promise<void>;
    private static handleError;
}
//# sourceMappingURL=encryption.d.ts.map
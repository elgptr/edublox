import { ExamResult, ExamSetup } from '@types/index';
export declare class FirestoreService {
    private db;
    /**
     * Save exam setup ke Firestore
     */
    saveExamSetup(userId: string, setup: ExamSetup): Promise<string>;
    /**
     * Get exam setup by ID
     */
    getExamSetup(userId: string, setupId: string): Promise<{
        id: string;
    } | null>;
    /**
     * Get all exam setups for user
     */
    getExamSetups(userId: string): Promise<{
        id: string;
    }[]>;
    /**
     * Save exam result
     */
    saveExamResult(userId: string, result: ExamResult): Promise<string>;
    /**
     * Get exam result
     */
    getExamResult(userId: string, resultId: string): Promise<{
        id: string;
    } | null>;
    /**
     * Get all exam results for user
     */
    getExamResults(userId: string): Promise<{
        id: string;
    }[]>;
    /**
     * Create user document
     */
    createUserProfile(userId: string, email: string, displayName: string): Promise<void>;
    /**
     * Get user profile
     */
    getUserProfile(userId: string): Promise<import("@firebase/firestore").DocumentData | null>;
}
declare const _default: FirestoreService;
export default _default;
//# sourceMappingURL=firestoreService.d.ts.map
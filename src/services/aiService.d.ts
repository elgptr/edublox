import { GenerateQuestionsRequest, GenerateQuestionsResponse } from '@types/index';
export declare class AIService {
    static generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse>;
    private static generateWithOpenAI;
    private static generateWithGemini;
    private static generateWithClaude;
    private static buildPrompt;
    private static parseQuestionsJSON;
    private static createError;
}
//# sourceMappingURL=aiService.d.ts.map
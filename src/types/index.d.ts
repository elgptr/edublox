/**
 * Types untuk Edublox Application
 * Companion app untuk belajar try out dan training berbasis AI
 */
export interface User {
    id: string;
    email: string;
    displayName: string;
    createdAt: Date;
    lastLogin: Date;
}
export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Semester = 'I' | 'II';
export type QuestionType = 'multiple-choice' | 'essay' | 'mixed';
export type ExamMode = 'tryout' | 'training';
export interface ExamSetup {
    id?: string;
    gradeLevel: GradeLevel;
    semester: Semester;
    bookName: string;
    numberOfQuestions: number;
    questionType: QuestionType;
    mode: ExamMode;
    createdAt: Date;
}
export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}
export interface Question {
    id: string;
    text: string;
    type: 'multiple-choice' | 'essay';
    options?: QuestionOption[];
    correctAnswer?: string;
    explanation: string;
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}
export interface UserAnswer {
    questionId: string;
    selectedOption?: string;
    essayAnswer?: string;
    isCorrect?: boolean;
    answeredAt: Date;
}
export interface ExamResult {
    id: string;
    examSetupId: string;
    userId: string;
    questions: Question[];
    userAnswers: UserAnswer[];
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    mode: ExamMode;
    startedAt: Date;
    completedAt: Date;
    timeSpentSeconds: number;
}
export type AIProvider = 'openai' | 'gemini' | 'claude';
export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model?: string;
}
export interface GenerateQuestionsRequest {
    gradeLevel: GradeLevel;
    semester: Semester;
    bookName: string;
    numberOfQuestions: number;
    questionType: QuestionType;
    aiConfig: AIConfig;
}
export interface GenerateQuestionsResponse {
    questions: Question[];
    generatedAt: Date;
}
export type RootStackParamList = {
    Login: undefined;
    Setup: undefined;
    AIKeyInput: {
        from?: string;
    };
    Question: {
        examSetupId: string;
        questionIndex: number;
    };
    Result: {
        examResultId: string;
    };
    History: undefined;
    Home: undefined;
};
export interface AppError {
    code: string;
    message: string;
    details?: string;
    timestamp: Date;
}
//# sourceMappingURL=index.d.ts.map
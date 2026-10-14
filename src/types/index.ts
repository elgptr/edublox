/**
 * Types untuk Edublox Application
 * Companion app untuk belajar try out dan training berbasis AI
 */

// ============ User & Auth Types ============
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLogin: Date;
}

// ============ Exam Configuration Types ============
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

// ============ Question Types ============
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'essay';
  options?: QuestionOption[]; // For multiple choice
  correctAnswer?: string; // For essay/expected answer
  explanation: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// ============ Answer & Result Types ============
export interface UserAnswer {
  questionId: string;
  selectedOption?: string; // For multiple choice
  essayAnswer?: string; // For essay questions
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
  score: number; // Percentage
  mode: ExamMode;
  startedAt: Date;
  completedAt: Date;
  timeSpentSeconds: number;
}

// ============ AI Provider Types ============
export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
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

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

// ============ UI Navigation Types ============
export type RootStackParamList = {
  Login: undefined;
  Setup: undefined;
  AIKeyInput: { from?: string };
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

// ============ Error Types ============
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
}

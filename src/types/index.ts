/**
 * Types untuk Edunesis Application
 * Platform Asesmen Multi-Jenjang & Multi-Kurikulum Berbasis AI (TK hingga SMA)
 */

// ============ User & Auth Types ============
export type UserRole = 'admin' | 'user' | 'teacher';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role?: UserRole;
  isSubscribed?: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date;
  specialDiscountPercent?: number; // e.g. 50% discount given by admin
  assignedCouponCode?: string;
  createdAt: Date;
  lastLogin: Date;
}

// ============ 8 Supported Curricula ============
export type CurriculumType =
  | 'merdeka'        // 1. Kurikulum Merdeka (Deep Learning & Capaian Pembelajaran)
  | 'k13'            // 2. Kurikulum 2013 (Tematik & Kompetensi Dasar)
  | 'cambridge'      // 3. Cambridge Assessment International Education (CAIE)
  | 'ib'             // 4. International Baccalaureate (PYP, MYP, DP)
  | 'singapore'      // 5. Singapore MOE (CPA Approach & Bar Modeling)
  | 'edexcel'        // 6. Pearson Edexcel (iPrimary, iLowerSecondary, IGCSE, IAL)
  | 'american'       // 7. American Curriculum (Common Core, NGSS, AP Track)
  | 'montessori_ipc';// 8. IPC, IMYC & Montessori (Eksploratif & Hands-on)

// ============ Education Level & Grade Level ============
export type EarlyYearsLevel = 'pra-tk' | 'tk' | 'pra-sd';
export type PrimaryGrade = 1 | 2 | 3 | 4 | 5 | 6;
export type LowerSecondaryGrade = 7 | 8 | 9;         // SMP / Middle School / Lower Secondary
export type UpperSecondaryGrade = 10 | 11 | 12;      // SMA / High School / IGCSE / A-Level / IB-DP

export type GradeLevel = EarlyYearsLevel | PrimaryGrade | LowerSecondaryGrade | UpperSecondaryGrade;

export type EducationTier =
  | 'early_childhood' // Pra-TK, TK, Pra-SD (Usia 2-7 Tahun)
  | 'primary'         // Kelas 1 - 6 SD
  | 'lower_secondary' // Kelas 7 - 9 SMP
  | 'upper_secondary';// Kelas 10 - 12 SMA

// ============ Language Support ============
export type AssessmentLanguage =
  | 'id'        // Bahasa Indonesia murni
  | 'en'        // Bahasa Inggris murni (Standar Kurikulum Internasional)
  | 'bilingual';// Dua bahasa sekaligus (teks utama EN/ID + terjemahan pendamping)

// ============ Semester & Period ============
export type Semester = 'I' | 'II';
export type ExamPeriod = 'regular' | 'pts' | 'pas' | 'mock_exam' | 'checkpoint' | 'final_board';
export type QuestionType = 'multiple-choice' | 'essay' | 'mixed';
export type ExamMode = 'tryout' | 'training';

// ============ Curriculum Specific Parameters ============
export interface MerdekaParams {
  fase: 'fase_fondasi' | 'fase_a' | 'fase_b' | 'fase_c' | 'fase_d' | 'fase_e' | 'fase_f';
  deepLearningPillar?: 'mindful' | 'meaningful' | 'joyful';
  profilPelajarPancasila?: string;
}

export interface CambridgeParams {
  stageOrLevel?: 'early_years' | 'primary' | 'lower_secondary' | 'igcse' | 'as_a_level';
  paperType?: 'paper_1_mcq' | 'paper_2_theory' | 'core' | 'extended';
  syllabusCode?: string; // cth: "0580" (Math), "0610" (Biology)
}

export interface IBParams {
  programme?: 'pyp' | 'myp' | 'dp';
  commandTerm?: 'state' | 'describe' | 'explain' | 'evaluate' | 'analyze' | 'calculate';
  globalContext?: string;
}

export interface SingaporeParams {
  stage?: 'nel' | 'primary_psle' | 'secondary_olevel';
  problemSolvingMethod?: 'bar_modeling' | 'heuristics' | 'cpa_concrete_pictorial_abstract';
}

export interface EdexcelParams {
  stream?: 'early_years' | 'iprimary' | 'ilowersecondary' | 'international_gcse' | 'ial';
  paperCode?: string;
}

export interface AmericanParams {
  standardFramework?: 'common_core' | 'ngss' | 'ap';
  apSubject?: string;
  dokLevel?: 1 | 2 | 3 | 4;
}

export interface MontessoriIPCParams {
  approach?: 'montessori' | 'ipc' | 'imyc';
  milepost?: 'early_years' | 'milepost_1' | 'milepost_2' | 'milepost_3' | 'imyc';
}

export type CurriculumSpecificParams = {
  merdeka?: MerdekaParams;
  cambridge?: CambridgeParams;
  ib?: IBParams;
  singapore?: SingaporeParams;
  edexcel?: EdexcelParams;
  american?: AmericanParams;
  montessori_ipc?: MontessoriIPCParams;
};

// ============ Kisi-Kisi Attachment ============
export type KisiKisiGenerationMode = 'exact' | 'similar';

export interface KisiKisiFileAttachment {
  name: string;
  mimeType: string;
  base64Data: string; // base64 payload
  uri?: string;
  sizeBytes?: number;
}

// ============ Main Exam Setup ============
export interface ExamSetup {
  id?: string;
  curriculum?: CurriculumType;
  language?: AssessmentLanguage;
  gradeLevel: GradeLevel;
  tier?: EducationTier;
  semester: Semester;
  examPeriod?: ExamPeriod;
  bookName: string;
  numberOfQuestions: number;
  questionType: QuestionType;
  mode: ExamMode;
  createdAt: Date;
  curriculumParams?: CurriculumSpecificParams;
  isKisiKisiMode?: boolean;
  kisiKisiMode?: KisiKisiGenerationMode;
  kisiKisiFileName?: string;
}

// ============ Question Types ============
export interface QuestionOption {
  id: string; // 'a' | 'b' | 'c' | 'd' | 'e'
  text: string;
  bilingualText?: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  bilingualText?: string; // Teks bahasa inggris/terjemahan pendamping jika mode bilingual
  type: 'multiple-choice' | 'essay';
  visualIllustration?: string; // Blok ilustrasi visual objek (misal: "🍎 🍎 🍎", "🔺 🟦 🔺 [ ? ]")
  imageUrl?: string; // URL gambar jika ada
  imageCaption?: string; // Keterangan gambar/ilustrasi
  options?: QuestionOption[]; // For multiple choice (A s.d. E)
  correctAnswer?: string; // For essay/expected answer or option id
  explanation: string;
  bilingualExplanation?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';

  // Khusus TK/Pra-SD (Fase Fondasi / Montessori / Early Years)
  parentTeacherGuide?: string; // Panduan observasi motorik & verbal bagi guru/orang tua

  // Khusus SMP/SMA (Aljabar, Kalkulus, Fisika, Kimia)
  latexFormulas?: string[]; // Rumus matematika murni dalam LaTeX (contoh: ["\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"])

  // Metadata Penyelaras Kurikulum
  curriculumMetadata?: {
    curriculum: CurriculumType;
    faseOrStage?: string;
    cognitiveDomain?: string;
    commandTerm?: string;
    standardCode?: string;
  };
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
  curriculum?: CurriculumType;
  language?: AssessmentLanguage;
  gradeLevel: GradeLevel;
  tier?: EducationTier;
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

// ============ Admin & Monetization Types ============
export interface DiscountCoupon {
  id?: string;
  code: string; // e.g. "DISKON50", "JUARAHEMAT"
  discountPercent: number; // e.g. 50 (50%)
  validUntil: Date;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

export type FeedbackCategory = 'keluhan_soal' | 'kendala_teknis' | 'saran_fitur' | 'pertanyaan';
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved';

export interface UserFeedback {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: FeedbackCategory;
  subject: string;
  message: string;
  status: FeedbackStatus;
  adminReply?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============ AI Provider Types ============
export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface AIKeyConfig {
  provider: AIProvider;
  customKey: string | null;
  useSystemDefault: boolean; // true = pakai Gemini Free dari sistem
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  models?: string[];
  statusCode?: number;
}

export interface SystemAIEndpointConfig {
  enabled: boolean;
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface GenerateQuestionsRequest {
  gradeLevel: GradeLevel;
  semester: Semester;
  examPeriod?: ExamPeriod;
  bookName: string;
  numberOfQuestions: number;
  questionType: QuestionType;
  aiConfig: AIConfig;
  curriculum?: CurriculumType;
  language?: AssessmentLanguage;
  tier?: EducationTier;
  curriculumParams?: CurriculumSpecificParams;
  isKisiKisiMode?: boolean;
  kisiKisiMode?: KisiKisiGenerationMode;
  kisiKisiAttachment?: KisiKisiFileAttachment;
  kisiKisiNotes?: string;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
  generatedAt: Date;
}

// ============ UI Navigation Types ============
export type RootStackParamList = {
  Login: undefined;
  Setup: undefined;
  AIKeyInput: { from?: string };
  Question: {
    examSetupId: string;
    setup?: ExamSetup;
    questions: Question[];
    questionIndex: number;
  };
  Result: {
    result?: ExamResult;
    examResultId?: string;
  };
  History: undefined;
  Home: undefined;
  Admin: undefined;
};

// ============ Error Types ============
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
}

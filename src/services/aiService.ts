import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { keyStorageService } from './keyStorageService';
import type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  Question,
  AppError,
} from '../types';

export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface ActiveKeyResult {
  apiKey: string;
  provider: AIProvider;
  isSystemDefault: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export class AIService {
  /**
   * Mengambil API key yang aktif:
   * 1. Cek Custom Key milik user di local encrypted storage.
   * 2. Jika tidak ada / kosong, otomatis fallback ke EXPO_PUBLIC_SYSTEM_GEMINI_KEY.
   */
  static async getActiveKey(preferredProvider: AIProvider = 'gemini'): Promise<ActiveKeyResult> {
    try {
      const userCustomKey = await keyStorageService.getKey(preferredProvider);
      if (userCustomKey && userCustomKey.trim().length > 0) {
        return {
          apiKey: userCustomKey.trim(),
          provider: preferredProvider,
          isSystemDefault: false,
        };
      }
    } catch (e) {
      console.warn('Gagal membaca custom key dari storage:', e);
    }

    // Fallback ke System Gemini Key
    const systemKey = process.env.EXPO_PUBLIC_SYSTEM_GEMINI_KEY || '';
    if (systemKey && systemKey.trim().length > 0) {
      return {
        apiKey: systemKey.trim(),
        provider: 'gemini',
        isSystemDefault: true,
      };
    }

    throw this.createError(
      'NO_API_KEY',
      'Tidak ada API Key yang tersedia. Silakan masukkan API Key di Pengaturan atau hubungi administrator.'
    );
  }

  /**
   * Menguji validitas API Key dengan melakukan lightweight ping ke masing-masing provider.
   */
  static async testConnection(provider: AIProvider, apiKey: string): Promise<ConnectionTestResult> {
    if (!apiKey || apiKey.trim().length === 0) {
      return { success: false, message: 'API key tidak boleh kosong.' };
    }

    const cleanKey = apiKey.trim();

    try {
      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(cleanKey);
        // Menggunakan model flash/pro untuk test prompt super ringan
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hi');
        if (result && result.response) {
          return { success: true, message: 'Koneksi ke Google Gemini berhasil!' };
        }
      } else if (provider === 'openai') {
        const openai = new OpenAI({ apiKey: cleanKey });
        await openai.models.list();
        return { success: true, message: 'Koneksi ke OpenAI berhasil!' };
      } else if (provider === 'claude') {
        const anthropic = new Anthropic({ apiKey: cleanKey });
        await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        });
        return { success: true, message: 'Koneksi ke Anthropic Claude berhasil!' };
      }

      return { success: false, message: 'Provider tidak dikenali.' };
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('Incorrect API key') || errorMsg.includes('401')) {
        return { success: false, message: 'API Key tidak valid atau telah kedaluwarsa.' };
      }
      if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
        return { success: false, message: 'Batas kuota API (Rate Limit / Quota) terlampaui.' };
      }
      return { success: false, message: `Gagal terhubung: ${errorMsg}` };
    }
  }

  static async generateQuestions(
    request: GenerateQuestionsRequest
  ): Promise<GenerateQuestionsResponse> {
    try {
      const prompt = this.buildPrompt(request);
      let questionsJSON: string;

      switch (request.aiConfig.provider) {
        case 'openai':
          questionsJSON = await this.generateWithOpenAI(prompt, request.aiConfig.apiKey);
          break;
        case 'gemini':
          questionsJSON = await this.generateWithGemini(prompt, request.aiConfig.apiKey);
          break;
        case 'claude':
          questionsJSON = await this.generateWithClaude(prompt, request.aiConfig.apiKey);
          break;
        default:
          throw this.createError('INVALID_PROVIDER', `Invalid AI provider`);
      }

      const questions = this.parseQuestionsJSON(questionsJSON);
      return { questions, generatedAt: new Date() };
    } catch (error) {
      const isAppError = (e: unknown): e is AppError => {
        return typeof e === 'object' && e !== null && 'code' in e && 'message' in e;
      };
      if (isAppError(error)) throw error;
      throw this.createError('GENERATION_ERROR', 'Failed to generate questions');
    }
  }

  private static async generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw this.createError('OPENAI_ERROR', 'OpenAI API call failed');
    }
  }

  private static async generateWithGemini(prompt: string, apiKey: string): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Mendukung model gemini-1.5-flash / gemini-pro
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw this.createError('GEMINI_ERROR', 'Gemini API call failed');
    }
  }

  private static async generateWithClaude(prompt: string, apiKey: string): Promise<string> {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      throw this.createError('CLAUDE_ERROR', 'Claude API call failed');
    }
  }

  private static buildPrompt(request: GenerateQuestionsRequest): string {
    const semesterText = request.semester === 'I' ? 'Semester Ganjil' : 'Semester Genap';
    return `Generate ${request.numberOfQuestions} educational questions for Grade ${request.gradeLevel}, ${semesterText}, Book: ${request.bookName}.
Type: ${request.questionType === 'multiple-choice' ? 'Multiple choice (4 options)' : request.questionType === 'essay' ? 'Essay' : 'Mixed'}.
Return ONLY valid JSON: {"questions": [{"id": "q1", "text": "...", "type": "multiple-choice", "options": [...], "explanation": "..."}]}`;
  }

  private static parseQuestionsJSON(jsonString: string): Question[] {
    try {
      // Membersihkan markdown formatting (```json ... ```) jika dikembalikan oleh AI
      const cleanJSON = jsonString.replace(/^```json/g, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(cleanJSON);
      return (parsed.questions || []).map((q: any, i: number) => ({
        id: q.id || `q${i + 1}`,
        text: q.text || '',
        type: q.type || 'multiple-choice',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      }));
    } catch {
      throw this.createError('PARSING_ERROR', 'Failed to parse AI response');
    }
  }

  private static createError(code: string, message: string, details?: string): AppError {
    return { code, message, details, timestamp: new Date() };
  }
}

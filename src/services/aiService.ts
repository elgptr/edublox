import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { keyStorageService } from './keyStorageService';
import type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  Question,
  AppError,
  AIProvider,
  ConnectionTestResult,
} from '../types';

export interface ActiveKeyResult {
  apiKey: string;
  provider: AIProvider;
  isSystemDefault: boolean;
  baseUrl?: string;
  model?: string;
}

export interface ConnectionOptions {
  baseUrl?: string;
  model?: string;
}

export class AIService {
  /**
   * Mengambil API key yang aktif:
   * 1. Cek Custom Key milik user di local encrypted storage.
   * 2. Jika tidak ada / kosong, otomatis fallback ke EXPO_PUBLIC_SYSTEM_GEMINI_KEY.
   */
  static async getActiveKey(preferredProvider?: AIProvider): Promise<ActiveKeyResult> {
    const providers: AIProvider[] = preferredProvider
      ? [preferredProvider, ...(['gemini', 'openai', 'claude'] as AIProvider[]).filter(p => p !== preferredProvider)]
      : ['gemini', 'openai', 'claude'];

    for (const provider of providers) {
      try {
        const userCustomKey = await keyStorageService.getKey(provider);
        if (userCustomKey && userCustomKey.trim().length > 0) {
          const config = await keyStorageService.getAIConfig();
          return {
            apiKey: userCustomKey.trim(), provider, isSystemDefault: false,
            baseUrl: config?.provider === provider ? config.baseUrl : undefined,
            model: config?.provider === provider ? config.model : undefined,
          };
        }
      } catch (e) {
        console.warn(`Gagal membaca custom key ${provider} dari storage:`, e);
      }
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
  static async testConnection(provider: AIProvider, apiKey: string, options: ConnectionOptions = {}): Promise<ConnectionTestResult> {
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
        const openai = new OpenAI({ apiKey: cleanKey, ...(options.baseUrl ? { baseURL: options.baseUrl.trim() } : {}) });
        if (options.model) {
          await openai.chat.completions.create({ model: options.model.trim(), messages: [{ role: 'user', content: 'Reply with OK.' }], max_tokens: 5 });
        } else {
          await openai.models.list();
        }
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
      const status = error?.status || error?.statusCode;
      if (status === 401 || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('Incorrect API key') || errorMsg.includes('401')) {
        return { success: false, message: 'API Key tidak valid atau telah kedaluwarsa.' };
      }
      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
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
          questionsJSON = await this.generateWithOpenAI(prompt, request.aiConfig.apiKey, request.aiConfig.baseUrl, request.aiConfig.model);
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
    } catch (error: any) {
      const isAppError = (e: unknown): e is AppError => {
        return typeof e === 'object' && e !== null && 'code' in e && 'message' in e;
      };
      if (isAppError(error)) throw error;
      throw this.createError('GENERATION_ERROR', error?.message || 'Failed to generate questions', error?.status ? `HTTP_${error.status}` : undefined);
    }
  }

  private static async generateWithOpenAI(prompt: string, apiKey: string, baseUrl?: string, model?: string): Promise<string> {
    try {
      const openai = new OpenAI({ apiKey, ...(baseUrl ? { baseURL: baseUrl } : {}) });
      const response = await openai.chat.completions.create({
        model: model || 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      throw this.createError('OPENAI_ERROR', error?.message || 'OpenAI API call failed', error?.status ? `HTTP_${error.status}` : undefined);
    }
  }

  private static async generateWithGemini(prompt: string, apiKey: string): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Mendukung model gemini-1.5-flash / gemini-pro
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      throw this.createError('GEMINI_ERROR', error?.message || 'Gemini API call failed', error?.status ? `HTTP_${error.status}` : undefined);
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
    } catch (error: any) {
      throw this.createError('CLAUDE_ERROR', error?.message || 'Claude API call failed', error?.status ? `HTTP_${error.status}` : undefined);
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

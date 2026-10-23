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
  KisiKisiFileAttachment,
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

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

/**
 * Normalisasi Base URL agar konsisten dengan standar OpenAI-compatible API:
 * 1. Menghilangkan trailing slashes
 * 2. Memastikan endpoint berakhiran /v1 jika belum memiliki path versi
 */
export function normalizeBaseUrl(url: string): string {
  let b = (url || '').trim().replace(/\/+$/, '');
  if (!b) return '';
  if (!b.endsWith('/v1') && !b.includes('/v1/')) {
    b = `${b}/v1`;
  }
  return b;
}

export class AIService {
  /**
   * Mengambil API key yang aktif:
   * 1. Cek Custom Key milik user di local encrypted storage.
   * 2. Jika tidak ada / user pakai opsi sistem, periksa System Custom Endpoint yang diset Admin (Firestore / local cache).
   * 3. Jika tidak aktif / belum diset admin, fallback ke EXPO_PUBLIC_SYSTEM_GEMINI_KEY.
   */
  static async getActiveKey(preferredProvider?: AIProvider): Promise<ActiveKeyResult> {
    const providers: AIProvider[] = preferredProvider
      ? [preferredProvider, ...(['gemini', 'openai', 'claude'] as AIProvider[]).filter(p => p !== preferredProvider)]
      : ['gemini', 'openai', 'claude'];

    // 1. Cek custom key milik user
    for (const provider of providers) {
      try {
        const userCustomKey = await keyStorageService.getKey(provider);
        if (userCustomKey && userCustomKey.trim().length > 0) {
          const config = await keyStorageService.getAIConfig();
          return {
            apiKey: userCustomKey.trim(),
            provider,
            isSystemDefault: false,
            baseUrl: config?.provider === provider && config.baseUrl ? normalizeBaseUrl(config.baseUrl) : undefined,
            model: config?.provider === provider ? config.model : undefined,
          };
        }
      } catch (e) {
        console.warn(`Gagal membaca custom key ${provider} dari storage:`, e);
      }
    }

    // 2. Cek System Custom Endpoint untuk AI Bawaan (dikonfigurasi oleh Admin)
    try {
      let systemAI = await keyStorageService.getSystemAIConfig();
      if (!systemAI) {
        try {
          const firestoreModule = await import('./firestoreService');
          const firestore = firestoreModule.default;
          systemAI = await firestore.getSystemAIConfig();
          if (systemAI) {
            await keyStorageService.saveSystemAIConfig(systemAI);
          }
        } catch {
          // Abaikan jika offline / di test environment
        }
      }

      if (systemAI && systemAI.enabled && systemAI.apiKey && systemAI.apiKey.trim().length > 0) {
        return {
          apiKey: systemAI.apiKey.trim(),
          provider: systemAI.provider || 'openai',
          isSystemDefault: true,
          baseUrl: systemAI.baseUrl ? normalizeBaseUrl(systemAI.baseUrl) : undefined,
          model: systemAI.model ? systemAI.model.trim() : undefined,
        };
      }
    } catch (e) {
      console.warn('Gagal membaca System AI Endpoint:', e);
    }

    // 3. Fallback ke System Gemini Key bawaan environment
    const systemKey = process.env.EXPO_PUBLIC_SYSTEM_GEMINI_KEY;
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
   * Mengambil daftar model yang tersedia dari endpoint /models (OpenAI-compatible)
   */
  static async fetchAvailableModels(baseUrl: string, apiKey?: string): Promise<{ success: boolean; models: string[]; latencyMs?: number; message?: string }> {
    const normUrl = normalizeBaseUrl(baseUrl || 'https://api.txsiber.online/v1');
    const start = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey && apiKey.trim().length > 0) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      }

      const res = await fetch(`${normUrl}/models`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return {
          success: false,
          models: [],
          latencyMs,
          message: `Server merespon HTTP ${res.status}: ${res.statusText || 'Gagal memuat model'}`,
        };
      }

      const data = await res.json().catch(() => ({}));
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const models = rawList
        .map((m: any) => (typeof m === 'string' ? m : (m?.id || m?.name)))
        .filter((m: any): m is string => typeof m === 'string' && m.length > 0);

      return {
        success: true,
        models,
        latencyMs,
        message: `Berhasil memuat ${models.length} model dari server (${latencyMs} ms).`,
      };
    } catch (e: any) {
      clearTimeout(timeoutId);
      return {
        success: false,
        models: [],
        message: e?.message || 'Gagal menghubungi server endpoint.',
      };
    }
  }

  /**
   * Menguji validitas API Key dan koneksi endpoint (OpenAI-compatible / Gemini / Claude)
   */
  static async testConnection(provider: AIProvider, apiKey: string, options: ConnectionOptions = {}): Promise<ConnectionTestResult> {
    if (!apiKey || apiKey.trim().length === 0) {
      return { success: false, message: 'API key tidak boleh kosong.' };
    }

    const cleanKey = apiKey.trim();
    const start = Date.now();

    try {
      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(cleanKey);
        let lastErr: any = null;

        for (const modelName of GEMINI_MODELS) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            if (result && result.response) {
              const latencyMs = Date.now() - start;
              return { success: true, message: `🟢 Koneksi ke Google Gemini berhasil (${modelName}) dalam ${latencyMs} ms!`, latencyMs };
            }
          } catch (e: any) {
            lastErr = e;
          }
        }
        throw lastErr || new Error('Semua model Gemini tidak merespon');
      } else if (provider === 'openai') {
        const normUrl = options.baseUrl ? normalizeBaseUrl(options.baseUrl) : 'https://api.openai.com/v1';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
        };

        // 1. Coba request langsung ke endpoint /models (gaya TXsiber)
        try {
          const res = await fetch(`${normUrl}/models`, {
            method: 'GET',
            headers,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          const latencyMs = Date.now() - start;

          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            const models = rawList
              .map((m: any) => (typeof m === 'string' ? m : (m?.id || m?.name)))
              .filter((m: any): m is string => typeof m === 'string' && m.length > 0);

            let msg = `🟢 Koneksi Sukses! (${latencyMs} ms) · Ditemukan ${models.length} model di server.`;
            if (options.model && options.model.trim()) {
              const target = options.model.trim();
              const hasModel = models.some(m => m.toLowerCase() === target.toLowerCase());
              if (hasModel) {
                msg = `🟢 Koneksi Sukses! (${latencyMs} ms) · Model '${target}' terverifikasi aktif di server (${models.length} total model).`;
              } else {
                msg = `🟢 Koneksi Sukses! (${latencyMs} ms) · Ditemukan ${models.length} model. Target '${target}' siap digunakan.`;
              }
            }

            return {
              success: true,
              message: msg,
              latencyMs,
              models,
              statusCode: res.status,
            };
          } else {
            // Jika /models 404 pada endpoint custom tapi model terisi, coba ping /chat/completions
            if (res.status === 404 && options.model) {
              const chatStart = Date.now();
              const chatRes = await fetch(`${normUrl}/chat/completions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  model: options.model.trim(),
                  messages: [{ role: 'user', content: 'Hi' }],
                  max_tokens: 2,
                }),
              });
              const chatLatency = Date.now() - chatStart;
              if (chatRes.ok) {
                return {
                  success: true,
                  message: `🟢 Koneksi Sukses via /chat/completions (${chatLatency} ms)! Model '${options.model}' merespon dengan baik.`,
                  latencyMs: chatLatency,
                  statusCode: chatRes.status,
                };
              }
            }

            let detail = `Respon Server HTTP ${res.status}`;
            if (res.status === 401) {
              detail = 'HTTP 401 Unauthorized: API Key salah, tidak valid, atau kedaluwarsa.';
            } else if (res.status === 403) {
              detail = 'HTTP 403 Forbidden: Akses ke endpoint ditolak oleh server.';
            } else if (res.status === 404) {
              detail = `HTTP 404 Not Found: Path endpoint '${normUrl}/models' tidak ditemukan di server.`;
            } else if (res.status === 429) {
              detail = 'HTTP 429 Rate Limit: Batas kuota API Key terlampaui.';
            }

            return {
              success: false,
              message: `⚠️ ${detail}`,
              latencyMs,
              statusCode: res.status,
            };
          }
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          // Fallback ke OpenAI SDK
          const openai = new OpenAI({ apiKey: cleanKey, dangerouslyAllowBrowser: true, baseURL: normUrl });
          if (options.model) {
            await openai.chat.completions.create({
              model: options.model.trim(),
              messages: [{ role: 'user', content: 'Reply with OK.' }],
              max_tokens: 5,
            });
          } else {
            await openai.models.list();
          }
          const latencyMs = Date.now() - start;
          return { success: true, message: `🟢 Koneksi ke OpenAI-compatible endpoint berhasil! (${latencyMs} ms)`, latencyMs };
        }
      } else if (provider === 'claude') {
        const anthropic = new Anthropic({ apiKey: cleanKey, dangerouslyAllowBrowser: true });
        await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        });
        const latencyMs = Date.now() - start;
        return { success: true, message: `🟢 Koneksi ke Anthropic Claude berhasil! (${latencyMs} ms)`, latencyMs };
      }

      return { success: false, message: 'Provider tidak dikenali.' };
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const status = error?.status || error?.statusCode;
      if (status === 401 || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('Incorrect API key') || errorMsg.includes('401')) {
        return { success: false, message: '⚠️ API Key tidak valid atau telah kedaluwarsa (HTTP 401).' };
      }
      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
        return { success: false, message: '⚠️ Batas kuota API (Rate Limit / Quota) terlampaui (HTTP 429).' };
      }
      return { success: false, message: `❌ Gagal terhubung: ${errorMsg}` };
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
          try {
            questionsJSON = await this.generateWithOpenAI(
              prompt,
              request.aiConfig.apiKey,
              request.aiConfig.baseUrl,
              request.aiConfig.model,
              request.kisiKisiAttachment
            );
          } catch (openAiErr: any) {
            // Fallback otomatis ke Gemini jika endpoint OpenAI gagal membaca attachment kisi-kisi (cth: PDF tidak didukung di image_url OpenAI)
            if (request.kisiKisiAttachment) {
              const systemKey = process.env.EXPO_PUBLIC_SYSTEM_GEMINI_KEY;
              if (systemKey) {
                console.warn('OpenAI gagal membaca attachment kisi-kisi, beralih otomatis ke Gemini AI Vision...', openAiErr);
                questionsJSON = await this.generateWithGemini(
                  prompt,
                  systemKey,
                  request.kisiKisiAttachment
                );
                break;
              }
            }
            throw openAiErr;
          }
          break;
        case 'gemini':
          questionsJSON = await this.generateWithGemini(
            prompt,
            request.aiConfig.apiKey,
            request.kisiKisiAttachment
          );
          break;
        case 'claude':
          questionsJSON = await this.generateWithClaude(
            prompt,
            request.aiConfig.apiKey,
            request.kisiKisiAttachment
          );
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

  private static async generateWithOpenAI(
    prompt: string,
    apiKey: string,
    baseUrl?: string,
    model?: string,
    attachment?: KisiKisiFileAttachment
  ): Promise<string> {
    try {
      const normUrl = baseUrl ? normalizeBaseUrl(baseUrl) : undefined;
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true, ...(normUrl ? { baseURL: normUrl } : {}) });

      let userContent: any = prompt;

      if (attachment && attachment.base64Data) {
        userContent = [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${attachment.mimeType || 'image/jpeg'};base64,${attachment.base64Data}`,
            },
          },
        ];
      }

      try {
        const response = await openai.chat.completions.create({
          model: model || 'gpt-4-turbo',
          messages: [{ role: 'user', content: userContent }],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        });
        return response.choices[0]?.message?.content || '';
      } catch (jsonFormatErr: any) {
        // Fallback jika proxy custom tidak mendukung parameter response_format
        const errMsg = String(jsonFormatErr?.message || '');
        if (
          errMsg.includes('response_format') ||
          errMsg.includes('json_object') ||
          errMsg.includes('schema') ||
          errMsg.includes('400')
        ) {
          const fallbackResp = await openai.chat.completions.create({
            model: model || 'gpt-4-turbo',
            messages: [{ role: 'user', content: userContent }],
            temperature: 0.7,
            max_tokens: 4096,
          });
          return fallbackResp.choices[0]?.message?.content || '';
        }
        throw jsonFormatErr;
      }
    } catch (error: any) {
      throw this.createError('OPENAI_ERROR', error?.message || 'OpenAI API call failed', error?.status ? `HTTP_${error.status}` : undefined);
    }
  }

  private static async generateWithGemini(
    prompt: string,
    apiKey: string,
    attachment?: KisiKisiFileAttachment
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastErr: any = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        let model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        let result: any;

        const content = (attachment && attachment.base64Data)
          ? [
              prompt,
              {
                inlineData: {
                  data: attachment.base64Data,
                  mimeType: attachment.mimeType || 'image/jpeg',
                },
              },
            ]
          : prompt;

        try {
          result = await model.generateContent(content);
        } catch (genConfigErr: any) {
          // Fallback tanpa responseMimeType jika model lama menolak generationConfig
          const errStr = String(genConfigErr?.message || '');
          if (errStr.includes('responseMimeType') || errStr.includes('generationConfig') || errStr.includes('400')) {
            model = genAI.getGenerativeModel({ model: modelName });
            result = await model.generateContent(content);
          } else {
            throw genConfigErr;
          }
        }

        const text = result?.response?.text();
        if (text && text.trim().length > 0) {
          return text;
        }
      } catch (e: any) {
        lastErr = e;
      }
    }

    throw this.createError('GEMINI_ERROR', lastErr?.message || 'Gemini API call failed', lastErr?.status ? `HTTP_${lastErr.status}` : undefined);
  }

  private static async generateWithClaude(
    prompt: string,
    apiKey: string,
    attachment?: KisiKisiFileAttachment
  ): Promise<string> {
    try {
      const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      let messageContent: any = prompt;

      if (attachment && attachment.base64Data) {
        if (attachment.mimeType === 'application/pdf') {
          messageContent = [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: attachment.base64Data,
              },
            },
            { type: 'text', text: prompt },
          ];
        } else {
          messageContent = [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (attachment.mimeType as any) || 'image/jpeg',
                data: attachment.base64Data,
              },
            },
            { type: 'text', text: prompt },
          ];
        }
      }

      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [{ role: 'user', content: messageContent }],
      });
      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error: any) {
      throw this.createError('CLAUDE_ERROR', error?.message || 'Claude API call failed', error?.status ? `HTTP_${error.status}` : undefined);
    }
  }

  public static buildPrompt(request: GenerateQuestionsRequest): string {
    const semesterText = request.semester === 'I' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)';
    let periodText = 'Materi Bab Reguler';
    if (request.examPeriod === 'pts') {
      periodText = 'Persiapan Penilaian Tengah Semester (PTS / STS / Progress Test)';
    } else if (request.examPeriod === 'pas') {
      periodText = 'Persiapan Penilaian Akhir Semester (PAS / SAS / PAT / Checkpoint / Final Board)';
    }

    const curriculum = request.curriculum || 'merdeka';
    const language = request.language || 'id';

    // Penentuan Jenjang & Fase
    let gradeTitle = `Kelas ${request.gradeLevel}`;
    let isEarlyChildhood = false;
    let isSecondary = false;

    if (request.gradeLevel === 'pra-tk') {
      gradeTitle = 'Anak Usia Dini Pra-TK / PAUD (Usia 2-4 Tahun)';
      isEarlyChildhood = true;
    } else if (request.gradeLevel === 'tk') {
      gradeTitle = 'Taman Kanak-Kanak / TK A & TK B (Usia 4-6 Tahun)';
      isEarlyChildhood = true;
    } else if (request.gradeLevel === 'pra-sd') {
      gradeTitle = 'Pra-SD / Transisi PAUD ke SD (Kesiapan Masuk SD & Calistung Dasar, Usia 6-7 Tahun)';
      isEarlyChildhood = true;
    } else if (typeof request.gradeLevel === 'number') {
      if (request.gradeLevel <= 6) {
        gradeTitle = `Kelas ${request.gradeLevel} SD / Primary Stage ${request.gradeLevel}`;
      } else if (request.gradeLevel <= 9) {
        gradeTitle = `Kelas ${request.gradeLevel} SMP / Lower Secondary Stage ${request.gradeLevel} / MYP`;
        isSecondary = true;
      } else {
        gradeTitle = `Kelas ${request.gradeLevel} SMA / Upper Secondary / IGCSE / A-Level / IB DP`;
        isSecondary = true;
      }
    }

    // 1. Direktif Pedagogis Kurikulum
    let curriculumDirectives = '';
    switch (curriculum) {
      case 'merdeka':
        curriculumDirectives = `
STANDAR KURIKULUM MERDEKA (INDONESIA - PENDEKATAN DEEP LEARNING):
- Rujuk Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) resmi.
- Terapkan 3 pilar Deep Learning: Mindful Learning (fokus bermakna), Meaningful Learning (kontekstual dunia nyata), dan Joyful Learning (menyenangkan).
- Utamakan stimulus masalah kontekstual, penalaran kritis, dan literasi/numerasi aplikatif. Hindari hafalan istilah mentah.`;
        break;

      case 'cambridge':
        curriculumDirectives = `
STANDAR CAMBRIDGE ASSESSMENT INTERNATIONAL EDUCATION (CAIE):
- Rujuk Cambridge Primary / Lower Secondary / IGCSE Syllabus Framework.
- Gunakan Cambridge Official Command Words secara presisi: "Calculate", "Describe", "Explain", "Identify", "Suggest", "State".
- Struktur stimulus dan opsi pengecoh (distractor) mencerminkan pola soal Past Papers Cambridge IGCSE / Progression Tests.`;
        break;

      case 'singapore':
      case 'singapore_moe' as any:
        curriculumDirectives = `
STANDAR SINGAPORE CURRICULUM (MOE / CPA APPROACH):
- Terapkan pendekatan CPA (Concrete-Pictorial-Abstract).
- Untuk soal matematika, integrasikan gaya pemecahan masalah "Bar Modeling" dan metode heuristik "Problem Sums" bertahap.
- Fokus pada ketelitian logika berhitung bertingkat (multi-step reasoning).`;
        break;

      case 'ib':
        curriculumDirectives = `
STANDAR INTERNATIONAL BACCALAUREATE (IB - PYP/MYP/DP):
- Gunakan IB Command Terms ("Analyze", "Contrast", "Evaluate", "Justify").
- Kaitkan pertanyaan dengan konteks global (Global Contexts) dan eksplorasi inkuiri (Inquiry-based Learning).
- Pembahasan (explanation) wajib menguraikan kriteria penalaran konseptual secara analitis.`;
        break;

      case 'american':
        curriculumDirectives = `
STANDAR AMERICAN CURRICULUM (COMMON CORE / NGSS / AP TRACK):
- Soal Sains merujuk NGSS (Next Generation Science Standards): fenomena nyata dan analisis bukti empiris.
- Matematika merujuk Common Core State Standards (CCSS) dengan fokus penalaran konseptual (Webb's DOK 2-3).`;
        break;

      case 'edexcel':
        curriculumDirectives = `
STANDAR PEARSON EDEXCEL (iPRIMARY / iLOWERSECONDARY / INTERNATIONAL GCSE):
- Mengacu pada spesifikasi silabus Pearson Edexcel International.
- Pertanyaan berorientasi pada pemahaman konsep inti dan penalaran analitis sistematis.`;
        break;

      case 'montessori_ipc':
        curriculumDirectives = `
STANDAR IPC & MONTESSORI (EARLY YEARS / PRIMARY):
- Pembelajaran berbasis eksplorasi langsung (experiential learning) dan stimulasi sensori.
- Soal mendorong keingintahuan alami anak dan keterhubungan dengan kehidupan sehari-hari.`;
        break;

      case 'k13':
      default:
        curriculumDirectives = `
STANDAR KURIKULUM 2013 / NASIONAL:
- Menyesuaikan Kompetensi Inti (KI) dan Kompetensi Dasar (KD).
- Tingkat kognitif seimbang antara C2 (Pemahaman), C3 (Aplikasi), dan C4 (Penalaran Analitis).`;
        break;
    }

    // 2. Direktif Khusus Jenjang (TK/Pra-SD vs SMP/SMA)
    let tierDirectives = '';
    if (isEarlyChildhood) {
      tierDirectives = `
PANDUAN KHUSUS USIA DINI: JENJANG PENDIDIKAN ANAK USIA DINI (PAUD / TK / PRA-SD):
- Bahasa ramah anak, hangat, santun, dan komunikatif.
- Sediakan visual konkret pada field "visualIllustration" (emoji benda/hewan/buah yang jelas: "🍎 🍎 🍎", "🔴 🟦 🟡", dll).
- Opsi pilihan ganda cukup 3 opsi (A, B, C) dengan teks singkat dan sederhana.
- WAJIB menyertakan field "parentTeacherGuide" berisi panduan observasi bagi guru/orang tua dalam membimbing respon anak secara motorik maupun verbal.`;
    } else if (isSecondary) {
      tierDirectives = `
PANDUAN KHUSUS JENJANG MENENGAH (SMP & SMA):
- Untuk soal matematika, fisika, dan kimia, sediakan representasi formula eksak pada field "latexFormulas" (contoh format: "\\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}").
- Pilihan ganda menyediakan 4 atau 5 opsi (A, B, C, D, E).
- Kunci jawaban dan pembahasan (explanation) memuat penalaran ilmiah mendalam dan rasionalisasi mengapa opsi lain salah.`;
    }

    // 3. Kebijakan Bahasa
    let languageDirectives = '';
    if (language === 'en') {
      languageDirectives = 'LANGUAGE DIRECTIVE: Output MUST be strictly in flawless, academic English.';
    } else if (language === 'bilingual') {
      languageDirectives = `
LANGUAGE DIRECTIVE: BILINGUAL (ENGLISH + BAHASA INDONESIA):
- Field "text" berisi soal dalam Bahasa Inggris.
- Field "bilingualText" berisi terjemahan soal dalam Bahasa Indonesia.
- Field "options[i].text" dalam Bahasa Inggris, dan "options[i].bilingualText" dalam Bahasa Indonesia.
- Field "explanation" dalam Bahasa Inggris, dan "bilingualExplanation" dalam Bahasa Indonesia.`;
    } else {
      languageDirectives = 'PANDUAN BAHASA: Gunakan Bahasa Indonesia yang komunikatif, baku, dan sesuai usia perkembangan siswa.';
    }

    const headerInfo = `STANDAR SISTEM ASESMEN:
- KURIKULUM: ${curriculum.toUpperCase()}
- BAHASA PENGANTAR: ${language}
- JENJANG: ${gradeTitle}`;

    let paramsDirectives = '';
    if (request.curriculumParams) {
      const p = request.curriculumParams;
      const paramList: string[] = [];
      if (p.merdekaFase) paramList.push(`- Fase Kurikulum Merdeka: ${p.merdekaFase}`);
      if (p.cambridgePaper) paramList.push(`- Cambridge Paper Type / Syllabus: ${p.cambridgePaper}`);
      if (p.singaporeMethod) paramList.push(`- Singapore Problem Solving Method: ${p.singaporeMethod}`);
      if (p.ibProgramme) paramList.push(`- IB Programme / Criterion: ${p.ibProgramme}`);
      if (p.americanStandard) paramList.push(`- American Assessment Standard: ${p.americanStandard}`);
      if (paramList.length > 0) {
        paramsDirectives = `\nPARAMETER KHUSUS KURIKULUM:\n${paramList.join('\n')}\n`;
      }
    }

    const visualPromptInstruction = `
Panduan Soal Bergambar & Ilustrasi Visual:
- Untuk sebagian soal (sekitar 30% - 60% soal, terutama berhitung objek, pola, bangun, hewan, warna, atau posisi spasial), berikan ilustrasi gambar visual yang menarik.
- Gunakan field "visualIllustration" berisi deretan objek emoji/simbol besar yang jelas (contoh: "🍎 🍎 🍎 🍎" untuk berhitung, "🔴 🔵 🔴 🔵 [ ? ]" untuk pola warna, "🔺 🟦 🟡" untuk bentuk geometri, atau "🐱 🐶 🐰" untuk hewan).
- Gunakan field "imageCaption" untuk memberi keterangan deskripsi gambar (contoh: "Ilustrasi: 4 buah apel merah segar di atas meja").
- Untuk soal non-visual biasa, biarkan field "visualIllustration" kosong/null.`;

    let kisiKisiInstruction = '';
    if (request.isKisiKisiMode) {
      const mode = request.kisiKisiMode || 'exact';
      const fileName = request.kisiKisiAttachment?.name || 'Dokumen Kisi-Kisi Guru';
      const notes = request.kisiKisiNotes ? `\nCatatan Khusus dari Pengguna: "${request.kisiKisiNotes}"` : '';

      const antiRejectionRules = `
ATURAN WAJIB & ANTI-PENOLAKAN (SANGAT PENTING):
1. Anda WAJIB LANGSUNG MERUMUSKAN DAN MENGHASILKAN ${request.numberOfQuestions} BUTIR SOAL dalam format JSON murni.
2. DILARANG KERAS merespons dengan percakapan, pembuka, penutup, sapaan, penolakan, pertanyaan klarifikasi, atau keluhan (seperti "Saya perlu...", "Maaf...", "File tidak jelas...", "Mohon sediakan...").
3. Kisi-kisi guru pada umumnya memuat TABEL INDIKATOR, KOMPETENSI DASAR (KD), ATAU TUJUAN PEMBELAJARAN (bukan naskah soal jadi). Tugas Anda adalah MERUMUSKAN BUTIR SOAL UJIAN ASLI berdasarkan indikator-indikator tersebut!
4. Jika ada bagian gambar/teks kisi-kisi yang buram, terpotong, atau tidak lengkap, JANGAN MENOLAK. Manfaatkan informasi indikator/materi yang terbaca serta konteks mata pelajaran "${request.bookName}" jenjang ${gradeTitle} untuk tetap melengkapi dan menghasilkan ${request.numberOfQuestions} butir soal pilihan ganda berkualitas tinggi.`;

      if (mode === 'exact') {
        kisiKisiInstruction = `
======================================================================
PETUNJUK UTAMA: SOAL HARUS EXACT (PERSIS) SESUAI KISI-KISI
======================================================================
File Kisi-Kisi Guru Terlampir: "${fileName}"
Mode Pembuatan: EXACT SESUAI KISI-KISI${notes}

TUGAS UTAMA AI:
1. Bacalah gambar/dokumen kisi-kisi ujian yang dilampirkan dengan sangat teliti (perhatikan kolom indikator soal, kompetensi dasar/lingkup materi, serta nomor urut indikator).
2. Buatlah ${request.numberOfQuestions} butir soal yang MENGUJI SECARA PERSIS butir-butir indikator dan materi pada kisi-kisi tersebut.
3. Jangan membuat materi di luar cakupan indikator yang tertera dalam kisi-kisi guru.
4. Level kognitif (pemahaman, aplikasi, penalaran) dan jenis stimulus soal harus merefleksikan spesifikasi kisi-kisi yang diberikan.
${antiRejectionRules}`;
      } else {
        kisiKisiInstruction = `
======================================================================
PETUNJUK UTAMA: SOAL CONTOH / VARIASI DENGAN MODEL MIRIP KISI-KISI
======================================================================
File Kisi-Kisi Guru Terlampir: "${fileName}"
Mode Pembuatan: MODEL SOAL MIRIP KISI-KISI (VARIASI LATIHAN DRILL)${notes}

TUGAS UTAMA AI:
1. Analisislah gaya soal, model pertanyaan, pola stimulus (cerita/kasus), dan pola penalaran pada dokumen/gambar kisi-kisi terlampir.
2. Buatlah ${request.numberOfQuestions} butir soal variasi baru yang STRUKTUR, POLA, DAN MODEL SOALNYA SANGAT SERUPA/MIRIP dengan soal pada kisi-kisi tersebut.
3. Ubahlah angka-angka, nama tokoh, objek cerita, atau variabel datanya agar menjadi latihan baru yang variatif, tetapi esensi konsep dan model berpikir yang diuji tetap sama.
4. Tujuannya adalah melatih siswa agar menguasai variasi model soal yang serupa dengan kisi-kisi ujian sekolah mereka.
${antiRejectionRules}`;
      }
    }

    return `Buat ${request.numberOfQuestions} butir soal latihan asesmen pendidikan berkualitas untuk jenjang: ${gradeTitle}, ${semesterText}, Fokus Target: ${periodText}, Topik Materi: "${request.bookName}".

${headerInfo}
${paramsDirectives}
${curriculumDirectives}
${tierDirectives}
${languageDirectives}
${visualPromptInstruction}
${kisiKisiInstruction}

INSTRUKSI FORMAT OUTPUT (SANGAT KETAT):
- WAJIB menghasilkan HANYA JSON murni (valid RFC 8259).
- DILARANG KERAS menyertakan percakapan, sapaan pembuka, atau penjelasan penutup di luar blok JSON (dilarang menulis "Saya perlu...", "Tentu...", "Berikut ini...", dll).
- Struktur JSON yang WAJIB digunakan:
{
  "questions": [
    {
      "id": "q1",
      "text": "Berapa banyak buah apel pada gambar di bawah ini?",
      "bilingualText": "How many apples are there in the picture below?",
      "visualIllustration": "🍎 🍎 🍎",
      "imageCaption": "Ilustrasi: Buah apel merah segar",
      "type": "multiple-choice",
      "options": [
        {"id": "a", "text": "3 buah", "bilingualText": "3 apples", "isCorrect": true},
        {"id": "b", "text": "2 buah", "bilingualText": "2 apples", "isCorrect": false},
        {"id": "c", "text": "4 buah", "bilingualText": "4 apples", "isCorrect": false},
        {"id": "d", "text": "5 buah", "bilingualText": "5 apples", "isCorrect": false}
      ],
      "correctAnswer": "a",
      "explanation": "Mari kita hitung bersama: 🍎 satu, 🍎 dua, 🍎 tiga. Jadi ada 3 buah apel.",
      "bilingualExplanation": "Let's count together: one, two, three apples. So there are 3 apples.",
      "parentTeacherGuide": "Ajak anak menunjuk setiap buah apel satu per satu dengan jari tangan.",
      "latexFormulas": ["x = 3"],
      "curriculumMetadata": {
        "curriculum": "${curriculum}",
        "faseOrStage": "Standar",
        "cognitiveDomain": "C2 - Pemahaman"
      }
    }
  ]
}`;
  }

  public static parseQuestionsJSON(jsonString: string): Question[] {
    try {
      let clean = (jsonString || '').trim();

      // 1. Bersihkan kode markdown fence (```json ... ``` atau ``` ... ```)
      const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch && codeBlockMatch[1]) {
        clean = codeBlockMatch[1].trim();
      }

      // 2. Ekstrak objek JSON {...} atau array [...] terluar
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      const firstBracket = clean.indexOf('[');
      const lastBracket = clean.lastIndexOf(']');

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        if (lastBrace > firstBrace) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }
      } else if (firstBracket !== -1) {
        if (lastBracket > firstBracket) {
          clean = clean.substring(firstBracket, lastBracket + 1);
        }
      }

      // 3. Jika sama sekali tidak ada kurung JSON (AI mengembalikan percakapan atau penolakan biasa)
      if (!clean.startsWith('{') && !clean.startsWith('[')) {
        const preview = clean.length > 120 ? clean.substring(0, 120) + '...' : clean;
        throw this.createError(
          'PARSING_ERROR',
          `AI membalas teks percakapan dan belum menghasilkan format soal: "${preview}". Pastikan dokumen kisi-kisi terlihat jelas atau coba klik Buat Soal sekali lagi.`
        );
      }

      // 4. Parsing JSON dengan toleransi trailing comma
      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch (primaryErr) {
        const sanitized = clean.replace(/,\s*([\]}])/g, '$1');
        try {
          parsed = JSON.parse(sanitized);
        } catch {
          throw primaryErr;
        }
      }

      let rawQuestions: any[] = [];
      if (Array.isArray(parsed)) {
        rawQuestions = parsed;
      } else if (Array.isArray(parsed.questions)) {
        rawQuestions = parsed.questions;
      } else if (Array.isArray(parsed.soal)) {
        rawQuestions = parsed.soal;
      } else if (Array.isArray(parsed.pertanyaan)) {
        rawQuestions = parsed.pertanyaan;
      } else if (Array.isArray(parsed.data)) {
        rawQuestions = parsed.data;
      } else if (Array.isArray(parsed.items)) {
        rawQuestions = parsed.items;
      } else {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) {
          rawQuestions = parsed[arrayKey];
        }
      }

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error('Daftar pertanyaan kosong dalam respon AI');
      }

      return rawQuestions.map((q: any, i: number) => {
        const text = q.text || q.pertanyaan || q.soal || '';
        const rawOptions = q.options || q.pilihan || q.opsi || q.pilihan_jawaban || [];
        const rawCorrectAnswer = q.correctAnswer || q.jawabanBenar || q.jawaban_benar || q.kunci || q.jawaban;
        let correctAnswer = rawCorrectAnswer ? String(rawCorrectAnswer).trim().toLowerCase() : undefined;

        // Normalisasi opsi pilihan ganda
        const options = (rawOptions || []).map((opt: any, optIdx: number) => {
          const letter = ['a', 'b', 'c', 'd', 'e'][optIdx] || `opt${optIdx + 1}`;
          if (typeof opt === 'string') {
            const isCorr = correctAnswer === letter || correctAnswer === opt.trim().toLowerCase();
            return {
              id: letter,
              text: opt,
              isCorrect: isCorr,
            };
          }

          const optId = opt.id ? String(opt.id).trim().toLowerCase() : letter;
          const optText = opt.text || opt.teks || opt.jawaban || String(opt);
          const isCorr = opt.isCorrect !== undefined
            ? !!opt.isCorrect
            : (correctAnswer === optId || (correctAnswer && correctAnswer === optText.trim().toLowerCase()));

          return {
            id: optId,
            text: String(optText),
            bilingualText: opt.bilingualText ? String(opt.bilingualText) : undefined,
            isCorrect: isCorr,
          };
        });

        // Tentukan jawaban benar jika belum ditentukan
        if (!correctAnswer) {
          const found = options.find((o: any) => o.isCorrect);
          if (found) correctAnswer = found.id;
        }

        const explanation = q.explanation || q.pembahasan || q.alasan || '';

        return {
          id: q.id || `q${i + 1}`,
          text: String(text),
          bilingualText: q.bilingualText ? String(q.bilingualText) : undefined,
          type: q.type || 'multiple-choice',
          visualIllustration: q.visualIllustration ? String(q.visualIllustration) : undefined,
          imageUrl: q.imageUrl ? String(q.imageUrl) : undefined,
          imageCaption: q.imageCaption ? String(q.imageCaption) : undefined,
          options,
          correctAnswer: correctAnswer || 'a',
          explanation: String(explanation),
          bilingualExplanation: q.bilingualExplanation ? String(q.bilingualExplanation) : undefined,
          parentTeacherGuide: q.parentTeacherGuide ? String(q.parentTeacherGuide) : undefined,
          latexFormulas: Array.isArray(q.latexFormulas) ? q.latexFormulas.map(String) : undefined,
          curriculumMetadata: q.curriculumMetadata || undefined,
        };
      });
    } catch (e: any) {
      if (e && e.code === 'PARSING_ERROR') throw e;
      throw this.createError('PARSING_ERROR', 'Gagal memproses struktur JSON soal dari AI: ' + (e?.message || 'Format tidak valid'));
    }
  }

  private static createError(code: string, message: string, details?: string): AppError {
    return { code, message, details, timestamp: new Date() };
  }
}

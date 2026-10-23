import { AIService } from '../src/services/aiService';
import { keyStorageService } from '../src/services/keyStorageService';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('../src/services/keyStorageService', () => ({
  keyStorageService: {
    getKey: jest.fn(),
    getAIConfig: jest.fn(),
    getSystemAIConfig: jest.fn().mockResolvedValue(null),
    saveSystemAIConfig: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@google/generative-ai');

describe('AIService - TDD Test Suite', () => {
  const TEST_API_KEY = 'test-gemini-mock-api-key-12345';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_SYSTEM_GEMINI_KEY = TEST_API_KEY;
  });

  describe('parseQuestionsJSON', () => {
    it('should parse standard clean JSON without markdown fences', () => {
      const raw = JSON.stringify({
        questions: [
          {
            id: 'q1',
            text: 'Berapakah 2 + 2?',
            type: 'multiple-choice',
            options: [
              { id: 'a', text: '3', isCorrect: false },
              { id: 'b', text: '4', isCorrect: true },
            ],
            correctAnswer: 'b',
            explanation: '2 + 2 = 4',
          },
        ],
      });

      const parsed = AIService.parseQuestionsJSON(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('q1');
      expect(parsed[0].correctAnswer).toBe('b');
      expect(parsed[0].options?.[1].isCorrect).toBe(true);
    });

    it('should parse JSON wrapped in markdown code fences (```json ... ```)', () => {
      const raw = `
Berikut adalah soal yang dihasilkan:
\`\`\`json
{
  "questions": [
    {
      "id": "q1",
      "text": "Pecahan 1/2 senilai dengan?",
      "options": [
        {"id": "a", "text": "2/4", "isCorrect": true},
        {"id": "b", "text": "1/4", "isCorrect": false}
      ],
      "correctAnswer": "a",
      "explanation": "1/2 = 2/4"
    }
  ]
}
\`\`\`
Semoga bermanfaat!
      `;

      const parsed = AIService.parseQuestionsJSON(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].text).toBe('Pecahan 1/2 senilai dengan?');
      expect(parsed[0].correctAnswer).toBe('a');
    });

    it('should normalize options given as raw strings into structured options', () => {
      const raw = JSON.stringify({
        questions: [
          {
            id: 'q1',
            text: 'Ibukota Indonesia adalah?',
            options: ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
            correctAnswer: 'Jakarta',
            explanation: 'Jakarta adalah ibukota.',
          },
        ],
      });

      const parsed = AIService.parseQuestionsJSON(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].options).toHaveLength(4);
      expect(parsed[0].options?.[0].id).toBe('a');
      expect(parsed[0].options?.[0].text).toBe('Jakarta');
      expect(parsed[0].options?.[0].isCorrect).toBe(true);
    });

    it('should throw PARSING_ERROR with friendly guidance when AI returns conversational refusal (e.g. Saya perlu...)', () => {
      try {
        AIService.parseQuestionsJSON('Saya perlu dokumen kisi-kisi yang lebih jelas untuk dapat merumuskan soal.');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.code).toBe('PARSING_ERROR');
        expect(e.message).toContain('AI membalas teks percakapan dan belum menghasilkan format soal');
        expect(e.message).toContain('Saya perlu dokumen kisi-kisi');
        // Ensure raw syntax error 'unexpected token' is not leaked
        expect(e.message).not.toContain('unexpected token');
      }
    });

    it('should handle JSON with trailing commas gracefully', () => {
      const rawWithTrailingComma = `{
        "questions": [
          {
            "id": "q1",
            "text": "Berapakah 3 + 3?",
            "options": [
              {"id": "a", "text": "5", "isCorrect": false},
              {"id": "b", "text": "6", "isCorrect": true},
            ],
            "correctAnswer": "b",
            "explanation": "3 + 3 = 6",
          },
        ],
      }`;

      const parsed = AIService.parseQuestionsJSON(rawWithTrailingComma);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('q1');
      expect(parsed[0].correctAnswer).toBe('b');
    });

    it('should parse direct JSON array [ {...} ] without outer questions object', () => {
      const rawArray = JSON.stringify([
        {
          id: 'q_arr_1',
          text: 'Apakah matahari terbit dari timur?',
          options: [
            { id: 'a', text: 'Ya', isCorrect: true },
            { id: 'b', text: 'Tidak', isCorrect: false },
          ],
          correctAnswer: 'a',
          explanation: 'Matahari terbit dari timur.',
        },
      ]);

      const parsed = AIService.parseQuestionsJSON(rawArray);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('q_arr_1');
      expect(parsed[0].correctAnswer).toBe('a');
    });

    it('should parse Indonesian field aliases (soal, pertanyaan, pilihan, kunci, pembahasan)', () => {
      const rawIndo = JSON.stringify({
        soal: [
          {
            pertanyaan: 'Sebutkan sila ke-1 Pancasila!',
            pilihan: [
              'Ketuhanan Yang Maha Esa',
              'Kemanusiaan yang Adil dan Beradab',
            ],
            kunci: 'Ketuhanan Yang Maha Esa',
            pembahasan: 'Sila ke-1 adalah Ketuhanan Yang Maha Esa.',
          },
        ],
      });

      const parsed = AIService.parseQuestionsJSON(rawIndo);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].text).toBe('Sebutkan sila ke-1 Pancasila!');
      expect(parsed[0].options[0].text).toBe('Ketuhanan Yang Maha Esa');
      expect(parsed[0].options[0].isCorrect).toBe(true);
      expect(parsed[0].explanation).toBe('Sila ke-1 adalah Ketuhanan Yang Maha Esa.');
    });

    it('should preserve visual illustrations and captions in questions', () => {
      const raw = JSON.stringify({
        questions: [
          {
            id: 'q_visual',
            text: 'Hitunglah buah apel di bawah ini!',
            visualIllustration: '🍎 🍎 🍎',
            imageCaption: '3 Buah apel merah',
            options: [
              { id: 'a', text: '3 buah', isCorrect: true },
              { id: 'b', text: '2 buah', isCorrect: false },
            ],
            correctAnswer: 'a',
            explanation: 'Ada 3 apel',
          },
        ],
      });

      const parsed = AIService.parseQuestionsJSON(raw);
      expect(parsed[0].visualIllustration).toBe('🍎 🍎 🍎');
      expect(parsed[0].imageCaption).toBe('3 Buah apel merah');
    });

    it('should parse multi-curriculum fields (bilingualText, latexFormulas, parentTeacherGuide, curriculumMetadata)', () => {
      const raw = JSON.stringify({
        questions: [
          {
            id: 'q_multi',
            text: 'Tentukan turunan pertama dari f(x) = 3x^2 + 5x.',
            bilingualText: 'Find the first derivative of f(x) = 3x^2 + 5x.',
            latexFormulas: ['f(x) = 3x^2 + 5x', 'f\'(x) = 6x + 5'],
            parentTeacherGuide: 'Pastikan siswa memahami aturan pangkat.',
            curriculumMetadata: {
              curriculum: 'cambridge',
              standardRef: 'CAIE 9709 P1',
            },
            options: [
              { id: 'a', text: '6x + 5', bilingualText: '6x + 5', isCorrect: true },
              { id: 'b', text: '3x + 5', bilingualText: '3x + 5', isCorrect: false },
            ],
            correctAnswer: 'a',
            explanation: 'Dengan diferensiasi d/dx(3x^2) = 6x.',
            bilingualExplanation: 'Using power rule, d/dx(3x^2) = 6x.',
          },
        ],
      });

      const parsed = AIService.parseQuestionsJSON(raw);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].bilingualText).toBe('Find the first derivative of f(x) = 3x^2 + 5x.');
      expect(parsed[0].latexFormulas).toEqual(['f(x) = 3x^2 + 5x', 'f\'(x) = 6x + 5']);
      expect(parsed[0].parentTeacherGuide).toBe('Pastikan siswa memahami aturan pangkat.');
      expect(parsed[0].curriculumMetadata?.curriculum).toBe('cambridge');
      expect(parsed[0].options?.[0].bilingualText).toBe('6x + 5');
      expect(parsed[0].bilingualExplanation).toBe('Using power rule, d/dx(3x^2) = 6x.');
    });
  });

  describe('getActiveKey', () => {
    it('should return user custom key when present in storage', async () => {
      (keyStorageService.getKey as jest.Mock).mockResolvedValue('user-custom-key');
      (keyStorageService.getAIConfig as jest.Mock).mockResolvedValue({ provider: 'gemini' });

      const active = await AIService.getActiveKey('gemini');
      expect(active.apiKey).toBe('user-custom-key');
      expect(active.isSystemDefault).toBe(false);
      expect(active.provider).toBe('gemini');
    });

    it('should fall back to system Gemini key when no custom key is stored', async () => {
      (keyStorageService.getKey as jest.Mock).mockResolvedValue(null);

      const active = await AIService.getActiveKey();
      expect(active.apiKey).toBe(TEST_API_KEY);
      expect(active.isSystemDefault).toBe(true);
      expect(active.provider).toBe('gemini');
    });
  });

  describe('testConnection', () => {
    it('should fail when given an empty API key', async () => {
      const res = await AIService.testConnection('gemini', '  ');
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/tidak boleh kosong/i);
    });

    it('should return success when Gemini generates content', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: { text: () => 'Hi' },
      });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const res = await AIService.testConnection('gemini', TEST_API_KEY);
      expect(res.success).toBe(true);
      expect(res.message).toMatch(/berhasil/i);
    });
  });

  describe('generateQuestions', () => {
    it('should generate and return parsed questions using Gemini', async () => {
      const mockResponseJSON = JSON.stringify({
        questions: [
          {
            id: 'q1',
            text: 'Hasil dari 5 x 5 adalah?',
            type: 'multiple-choice',
            options: [
              { id: 'a', text: '20', isCorrect: false },
              { id: 'b', text: '25', isCorrect: true },
            ],
            correctAnswer: 'b',
            explanation: '5 x 5 = 25',
          },
        ],
      });

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: { text: () => mockResponseJSON },
      });

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const response = await AIService.generateQuestions({
        gradeLevel: 4,
        semester: 'I',
        bookName: 'Matematika Perkalian',
        numberOfQuestions: 1,
        questionType: 'multiple-choice',
        mode: 'training',
        createdAt: new Date(),
        aiConfig: {
          provider: 'gemini',
          apiKey: TEST_API_KEY,
        },
      });

      expect(response.questions).toHaveLength(1);
      expect(response.questions[0].text).toBe('Hasil dari 5 x 5 adalah?');
      expect(response.questions[0].correctAnswer).toBe('b');
    });

    it('should build prompt with EXACT kisi-kisi instructions when exact mode is selected', () => {
      const prompt = AIService.buildPrompt({
        gradeLevel: 5,
        semester: 'II',
        examPeriod: 'pas',
        bookName: 'Kisi-Kisi PAS Matematika Kelas 5',
        numberOfQuestions: 10,
        questionType: 'multiple-choice',
        aiConfig: { provider: 'gemini', apiKey: 'test' },
        isKisiKisiMode: true,
        kisiKisiMode: 'exact',
        kisiKisiAttachment: {
          name: 'kisi-kisi-pas-sd-2026.pdf',
          mimeType: 'application/pdf',
          base64Data: 'dummybase64',
        },
        kisiKisiNotes: 'Fokus pada butir nomor 1-5 pecahan desimal',
      });

      expect(prompt).toContain('SOAL HARUS EXACT (PERSIS) SESUAI KISI-KISI');
      expect(prompt).toContain('kisi-kisi-pas-sd-2026.pdf');
      expect(prompt).toContain('Fokus pada butir nomor 1-5 pecahan desimal');
      expect(prompt).toContain('MENGUJI SECARA PERSIS butir-butir indikator');
    });

    it('should build prompt with SIMILAR / MODEL SOAL MIRIP instructions when similar mode is selected', () => {
      const prompt = AIService.buildPrompt({
        gradeLevel: 3,
        semester: 'I',
        examPeriod: 'pts',
        bookName: 'Kisi-Kisi PTS Tematik',
        numberOfQuestions: 5,
        questionType: 'multiple-choice',
        aiConfig: { provider: 'gemini', apiKey: 'test' },
        isKisiKisiMode: true,
        kisiKisiMode: 'similar',
        kisiKisiAttachment: {
          name: 'foto-kisi-guru.jpg',
          mimeType: 'image/jpeg',
          base64Data: 'dummyimgbase64',
        },
      });

      expect(prompt).toContain('SOAL CONTOH / VARIASI DENGAN MODEL MIRIP KISI-KISI');
      expect(prompt).toContain('foto-kisi-guru.jpg');
      expect(prompt).toContain('STRUKTUR, POLA, DAN MODEL SOALNYA SANGAT SERUPA/MIRIP');
      expect(prompt).toContain('Ubahlah angka-angka, nama tokoh, objek cerita');
    });

    it('should pass attachment to Gemini inlineData when generating with file attachment', async () => {
      const mockResponseJSON = JSON.stringify({
        questions: [
          {
            id: 'q1',
            text: 'Soal berbasis kisi-kisi guru?',
            type: 'multiple-choice',
            options: [
              { id: 'a', text: 'Benar', isCorrect: true },
              { id: 'b', text: 'Salah', isCorrect: false },
            ],
            correctAnswer: 'a',
            explanation: 'Sesuai indikator kisi-kisi',
          },
        ],
      });

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: { text: () => mockResponseJSON },
      });

      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      await AIService.generateQuestions({
        gradeLevel: 4,
        semester: 'I',
        bookName: 'Kisi-Kisi Tematik',
        numberOfQuestions: 1,
        questionType: 'multiple-choice',
        aiConfig: {
          provider: 'gemini',
          apiKey: TEST_API_KEY,
        },
        isKisiKisiMode: true,
        kisiKisiMode: 'exact',
        kisiKisiAttachment: {
          name: 'kisi-kisi.pdf',
          mimeType: 'application/pdf',
          base64Data: 'sample-base64-data',
        },
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(Array.isArray(callArgs)).toBe(true);
      expect(callArgs[0]).toContain('SOAL HARUS EXACT (PERSIS) SESUAI KISI-KISI');
      expect(callArgs[1]).toEqual({
        inlineData: {
          data: 'sample-base64-data',
          mimeType: 'application/pdf',
        },
      });
    });

    it('should build prompt with Cambridge CAIE syllabus and paper directives', () => {
      const prompt = AIService.buildPrompt({
        gradeLevel: 10,
        semester: 'I',
        examPeriod: 'pas',
        bookName: 'Cambridge IGCSE Physics 0625',
        numberOfQuestions: 5,
        questionType: 'multiple-choice',
        curriculum: 'cambridge',
        language: 'en',
        curriculumParams: {
          cambridgePaper: 'Paper 2 (Multiple Choice Extended)',
        },
      });

      expect(prompt).toContain('CAMBRIDGE ASSESSMENT INTERNATIONAL EDUCATION (CAIE)');
      expect(prompt).toContain('Paper 2 (Multiple Choice Extended)');
      expect(prompt).toContain('BAHASA PENGANTAR: en');
    });

    it('should build prompt with Singapore MOE bar modeling and CPA directives', () => {
      const prompt = AIService.buildPrompt({
        gradeLevel: 5,
        semester: 'I',
        examPeriod: 'regular',
        bookName: 'Singapore Math Primary 5',
        numberOfQuestions: 5,
        questionType: 'multiple-choice',
        curriculum: 'singapore_moe',
        language: 'en',
      });

      expect(prompt).toContain('SINGAPORE CURRICULUM (MOE / CPA APPROACH)');
      expect(prompt).toContain('Bar Modeling');
      expect(prompt).toContain('Concrete-Pictorial-Abstract');
    });

    it('should build prompt with Early Childhood directives for pra-tk / tk', () => {
      const prompt = AIService.buildPrompt({
        gradeLevel: 'tk',
        semester: 'I',
        examPeriod: 'regular',
        bookName: 'Mengenal Warna dan Bentuk',
        numberOfQuestions: 3,
        questionType: 'multiple-choice',
        curriculum: 'merdeka',
        language: 'id',
      });

      expect(prompt).toContain('JENJANG PENDIDIKAN ANAK USIA DINI (PAUD / TK / PRA-SD)');
      expect(prompt).toContain('parentTeacherGuide');
      expect(prompt).toContain('visualIllustration');
    });

    it('should build prompt with Bilingual instructions when language is bilingual', () => {
      const prompt = AIService.buildPrompt({
        gradeLevel: 8,
        semester: 'I',
        examPeriod: 'pts',
        bookName: 'Science SMP Bilingual',
        numberOfQuestions: 5,
        questionType: 'multiple-choice',
        curriculum: 'merdeka',
        language: 'bilingual',
      });

      expect(prompt).toContain('BAHASA PENGANTAR: bilingual');
      expect(prompt).toContain('bilingualText');
      expect(prompt).toContain('bilingualExplanation');
    });
  });
});

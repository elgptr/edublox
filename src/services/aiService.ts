import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import type {
  GenerateQuestionsRequest,
  GenerateQuestionsResponse,
  Question,
  AppError,
} from '../types';

export class AIService {
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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
      const parsed = JSON.parse(jsonString);
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

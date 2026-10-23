import { FilePickerService } from '../src/services/filePickerService';

describe('FilePickerService', () => {
  describe('formatFileSize', () => {
    it('returns "0 KB" for undefined, 0, or negative bytes', () => {
      expect(FilePickerService.formatFileSize()).toBe('0 KB');
      expect(FilePickerService.formatFileSize(0)).toBe('0 KB');
      expect(FilePickerService.formatFileSize(-100)).toBe('0 KB');
    });

    it('formats small byte sizes correctly', () => {
      expect(FilePickerService.formatFileSize(512)).toBe('512 B');
    });

    it('formats kilobyte sizes correctly', () => {
      expect(FilePickerService.formatFileSize(1024)).toBe('1.0 KB');
      expect(FilePickerService.formatFileSize(2048)).toBe('2.0 KB');
      expect(FilePickerService.formatFileSize(153600)).toBe('150.0 KB');
    });

    it('formats megabyte sizes correctly', () => {
      expect(FilePickerService.formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(FilePickerService.formatFileSize(5.5 * 1024 * 1024)).toBe('5.5 MB');
    });
  });

  describe('processWebFile', () => {
    // Mock FileReader in Node test environment
    beforeAll(() => {
      (global as any).FileReader = class {
        public result: string = '';
        public onload: (() => void) | null = null;
        public onerror: ((err: any) => void) | null = null;

        public readAsDataURL(blob: any) {
          setTimeout(() => {
            this.result = 'data:application/pdf;base64,VEVTVERBVEE=';
            if (this.onload) this.onload();
          }, 0);
        }
      };
    });

    it('processes a valid PDF file successfully', async () => {
      const mockFile = {
        name: 'kisi-kisi-matematika.pdf',
        type: 'application/pdf',
        size: 204800,
      } as any;

      const result = await FilePickerService.processWebFile(mockFile);
      expect(result).toBeDefined();
      expect(result.name).toBe('kisi-kisi-matematika.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.base64Data).toBe('VEVTVERBVEE=');
      expect(result.uri).toBe('data:application/pdf;base64,VEVTVERBVEE=');
      expect(result.sizeBytes).toBe(204800);
    });

    it('processes a valid JPG/PNG image file successfully', async () => {
      const mockFile = {
        name: 'soal-kisi-kisi.jpg',
        type: 'image/jpeg',
        size: 102400,
      } as any;

      const result = await FilePickerService.processWebFile(mockFile);
      expect(result).toBeDefined();
      expect(result.name).toBe('soal-kisi-kisi.jpg');
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('rejects files larger than 10MB', async () => {
      const oversizedFile = {
        name: 'huge_document.pdf',
        type: 'application/pdf',
        size: 11 * 1024 * 1024,
      } as any;

      await expect(FilePickerService.processWebFile(oversizedFile)).rejects.toThrow(
        'Ukuran file maksimal 10MB'
      );
    });

    it('rejects unsupported file formats like .exe or .zip', async () => {
      const invalidFile = {
        name: 'malicious.exe',
        type: 'application/x-msdownload',
        size: 1024,
      } as any;

      await expect(FilePickerService.processWebFile(invalidFile)).rejects.toThrow(
        'Format file tidak didukung'
      );
    });
  });
});

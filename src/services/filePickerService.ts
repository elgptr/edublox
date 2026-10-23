import { Platform } from 'react-native';
import type { KisiKisiFileAttachment } from '../types';

/**
 * Service untuk memilih file gambar / PDF kisi-kisi dan mengonversinya ke Base64
 * Mendukung Web (HTML5 File API) dan Expo Native (expo-document-picker)
 */
export class FilePickerService {
  private static MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  /**
   * Mengonversi Blob / File ke Base64 string murni (tanpa prefix data:...;base64,)
   */
  public static blobToBase64(blob: Blob): Promise<{ base64: string; dataUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        resolve({ base64, dataUrl });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Membuka dialog pemilihan file kisi-kisi (Gambar JPG, PNG, WEBP atau PDF)
   */
  public static async pickKisiKisiFile(): Promise<KisiKisiFileAttachment | null> {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      return this.pickFileWeb();
    }

    return this.pickFileNative();
  }

  /**
   * Memproses objek File Web (dari file input atau drop event) menjadi KisiKisiFileAttachment
   */
  public static async processWebFile(file: File): Promise<KisiKisiFileAttachment> {
    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      throw new Error('Ukuran file maksimal 10MB. Silakan pilih file yang lebih ringkas.');
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      throw new Error('Format file tidak didukung. Harap upload file gambar (JPG, PNG, WEBP) atau dokumen PDF kisi-kisi.');
    }

    const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');
    const { base64, dataUrl } = await this.blobToBase64(file);

    return {
      name: file.name,
      mimeType,
      base64Data: base64,
      uri: dataUrl,
      sizeBytes: file.size,
    };
  }

  /**
   * Implementasi picker untuk Web
   */
  private static pickFileWeb(): Promise<KisiKisiFileAttachment | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp,image/jpg,application/pdf';
      input.style.display = 'none';

      input.onchange = async (event: any) => {
        try {
          const file = event?.target?.files?.[0];
          if (!file) {
            resolve(null);
            return;
          }

          const attachment = await this.processWebFile(file);
          resolve(attachment);
        } catch (err) {
          reject(err);
        } finally {
          if (input.parentNode) {
            document.body.removeChild(input);
          }
        }
      };

      input.oncancel = () => {
        resolve(null);
        if (input.parentNode) {
          document.body.removeChild(input);
        }
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Implementasi picker untuk React Native / Expo Native
   */
  private static async pickFileNative(): Promise<KisiKisiFileAttachment | null> {
    try {
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];

      if (asset.size && asset.size > this.MAX_FILE_SIZE_BYTES) {
        throw new Error('Ukuran file maksimal 10MB. Silakan pilih file yang lebih ringkas.');
      }

      let base64 = '';
      let dataUrl = asset.uri;

      // Pada web via expo-document-picker, asset.file adalah File object
      if ((asset as any).file instanceof Blob) {
        const res = await this.blobToBase64((asset as any).file);
        base64 = res.base64;
        dataUrl = res.dataUrl;
      } else if (asset.uri) {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const res = await this.blobToBase64(blob);
        base64 = res.base64;
        dataUrl = res.dataUrl;
      }

      return {
        name: asset.name,
        mimeType: asset.mimeType || (asset.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        base64Data: base64,
        uri: dataUrl,
        sizeBytes: asset.size,
      };
    } catch (e: any) {
      console.warn('Gagal memilih file dokumen:', e);
      throw e;
    }
  }

  /**
   * Format ukuran file menjadi label yang nyaman dibaca (cth: "1.2 MB", "450 KB")
   */
  public static formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Lovable Cloud Storage Service
 * Handles file uploads, downloads, and resource management
 */

import { storage } from '../lib/lovable';
import LovableAuthService from './lovable-auth.service';

export interface UploadProgress {
  percent: number;
  bytesUploaded: number;
  totalBytes: number;
}

export class LovableStorageService {
  private static instance: LovableStorageService;

  // Storage buckets
  private readonly BUCKETS = {
    USER_UPLOADS: 'user-uploads',
    LEARNING_RESOURCES: 'learning-resources',
    AVATARS: 'avatars',
    CERTIFICATES: 'certificates',
  };

  private constructor() {}

  static getInstance(): LovableStorageService {
    if (!LovableStorageService.instance) {
      LovableStorageService.instance = new LovableStorageService();
    }
    return LovableStorageService.instance;
  }

  /**
   * Upload user file (notes, projects, etc.)
   */
  async uploadUserFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}_${file.name}`;

    await storage.upload(this.BUCKETS.USER_UPLOADS, file, {
      onProgress: (p) => {
        if (onProgress) {
          onProgress({
            percent: p.percent,
            bytesUploaded: (p.percent / 100) * file.size,
            totalBytes: file.size,
          });
        }
      },
    });

    const url = await storage.getPublicUrl(this.BUCKETS.USER_UPLOADS, fileName);
    return url;
  }

  /**
   * Upload learning resource (for educators/admins)
   */
  async uploadLearningResource(
    file: File,
    metadata: {
      conceptId: string;
      resourceType: string;
      difficulty: number;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${metadata.conceptId}/${timestamp}_${file.name}`;

    await storage.upload(this.BUCKETS.LEARNING_RESOURCES, file, {
      onProgress: (p) => {
        if (onProgress) {
          onProgress({
            percent: p.percent,
            bytesUploaded: (p.percent / 100) * file.size,
            totalBytes: file.size,
          });
        }
      },
    });

    const url = await storage.getPublicUrl(
      this.BUCKETS.LEARNING_RESOURCES,
      fileName
    );
    return url;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.id}/avatar.${file.name.split('.').pop()}`;

    await storage.upload(this.BUCKETS.AVATARS, file);

    const url = await storage.getPublicUrl(this.BUCKETS.AVATARS, fileName);
    return url;
  }

  /**
   * Generate certificate and upload
   */
  async uploadCertificate(
    pathId: string,
    certificateBlob: Blob
  ): Promise<string> {
    const user = await LovableAuthService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.id}/${pathId}_certificate.pdf`;
    const file = new File([certificateBlob], fileName, {
      type: 'application/pdf',
    });

    await storage.upload(this.BUCKETS.CERTIFICATES, file);

    const url = await storage.getPublicUrl(this.BUCKETS.CERTIFICATES, fileName);
    return url;
  }

  /**
   * Download file from storage
   */
  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const blob = await storage.download(bucket, path);
    return blob;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    await storage.delete(bucket, path);
  }

  /**
   * Get public URL for a file
   */
  async getFileUrl(bucket: string, path: string): Promise<string> {
    return storage.getPublicUrl(bucket, path);
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<string[]> {
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const url = await this.uploadUserFile(files[i], (progress) => {
        if (onProgress) {
          onProgress(i, progress);
        }
      });
      urls.push(url);
    }

    return urls;
  }
}

export default LovableStorageService.getInstance();



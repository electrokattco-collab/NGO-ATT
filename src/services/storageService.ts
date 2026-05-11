/**
 * Firebase Storage Service
 * 
 * Handles file uploads, downloads, and management
 * Used for volunteer CVs, blog images, gallery photos, etc.
 */

import { getStorage, getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '@/src/lib/firebase.js';
import { logger } from '@/src/lib/logger.js';
import { BadRequestError, ForbiddenError } from '@/src/middleware/errorHandler.js';

// ============================================================================
// Types
// ============================================================================

export interface UploadResult {
  path: string;
  url: string;
  name: string;
  size: number;
  contentType: string;
}

export interface FileMetadata {
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  originalName: string;
}

// ============================================================================
// Configuration
// ============================================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique filename
 */
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const sanitized = originalName
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50);
  return `${sanitized}-${timestamp}-${random}.${extension}`;
};

/**
 * Validates file type
 */
const validateFileType = (file: Express.Multer.File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Validates file size
 */
const validateFileSize = (file: Express.Multer.File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Uploads a file to Firebase Storage
 */
export const uploadFile = async (
  file: Express.Multer.File,
  folder: string,
  userId: string
): Promise<UploadResult> => {
  try {
    const filename = generateUniqueFilename(file.originalname);
    const filePath = `${folder}/${filename}`;
    const storageRef = ref(storage, filePath);

    const metadata = {
      contentType: file.mimetype,
      customMetadata: {
        uploadedBy: userId,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    logger.info('File uploaded successfully', {
      path: filePath,
      size: file.size,
      userId,
    });

    return {
      path: filePath,
      url: downloadUrl,
      name: filename,
      size: file.size,
      contentType: file.mimetype,
    };
  } catch (error) {
    logger.error('File upload failed', { error: (error as Error).message });
    throw new BadRequestError('Failed to upload file. Please try again.');
  }
};

/**
 * Uploads an image with validation
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
  userId: string
): Promise<UploadResult> => {
  if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
    throw new BadRequestError('Invalid image type. Allowed: JPG, PNG, GIF, WebP');
  }

  if (!validateFileSize(file)) {
    throw new BadRequestError('Image too large. Maximum size is 5MB');
  }

  return uploadFile(file, `images/${folder}`, userId);
};

/**
 * Uploads a document with validation
 */
export const uploadDocument = async (
  file: Express.Multer.File,
  folder: string,
  userId: string
): Promise<UploadResult> => {
  const allowedTypes = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES];
  
  if (!validateFileType(file, allowedTypes)) {
    throw new BadRequestError('Invalid file type. Allowed: PDF, DOC, DOCX, images');
  }

  if (!validateFileSize(file, 10 * 1024 * 1024)) { // 10MB for documents
    throw new BadRequestError('File too large. Maximum size is 10MB');
  }

  return uploadFile(file, `documents/${folder}`, userId);
};

/**
 * Uploads volunteer CV
 */
export const uploadVolunteerCV = async (
  file: Express.Multer.File,
  volunteerId: string
): Promise<UploadResult> => {
  if (!validateFileType(file, ALLOWED_DOCUMENT_TYPES)) {
    throw new BadRequestError('Invalid CV format. Please upload PDF, DOC, or DOCX');
  }

  if (!validateFileSize(file, 5 * 1024 * 1024)) {
    throw new BadRequestError('CV file too large. Maximum size is 5MB');
  }

  return uploadFile(file, `volunteers/${volunteerId}`, 'volunteer');
};

// ============================================================================
// Delete Functions
// ============================================================================

/**
 * Deletes a file from Firebase Storage
 */
export const deleteFile = async (filePath: string, userId: string): Promise<void> => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    logger.info('File deleted successfully', { path: filePath, userId });
  } catch (error) {
    logger.error('File deletion failed', { error: (error as Error).message, path: filePath });
    throw new BadRequestError('Failed to delete file. File may not exist.');
  }
};

// ============================================================================
// Export Service
// ============================================================================

export const storageService = {
  uploadFile,
  uploadImage,
  uploadDocument,
  uploadVolunteerCV,
  deleteFile,
  generateUniqueFilename,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
};

export default storageService;

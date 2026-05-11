/**
 * Request Validation Middleware
 * 
 * Zod-based validation for API request bodies and params
 */

import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/src/middleware/errorHandler.js';

// ============================================================================
// Validation Middleware Factory
// ============================================================================

/**
 * Creates a middleware that validates request body against a Zod schema
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      // Replace body with validated/parsed data
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Creates a middleware that validates request params against a Zod schema
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Invalid URL parameters', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Creates a middleware that validates request query against a Zod schema
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Invalid query parameters', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

// ============================================================================
// Common Validation Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

// ============================================================================
// Sanitization Middleware
// ============================================================================

/**
 * Sanitizes string inputs to prevent XSS
 */
export const sanitizeStrings = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (value: any): any => {
    if (typeof value === 'string') {
      // Basic XSS prevention - encode HTML entities
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    if (Array.isArray(value)) {
      return value.map(sanitize);
    }
    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitize(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

// ============================================================================
// File Upload Validation
// ============================================================================

import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5, // Max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images and documents (PDF, DOC, DOCX) are allowed'));
    }
  },
});

/**
 * Validates file uploads
 */
export const validateFileUpload = (fieldName: string, required: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = required 
      ? upload.single(fieldName)
      : upload.single(fieldName);

    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific error
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError('File too large', [{
            field: fieldName,
            message: 'File size must be less than 5MB',
          }]));
        }
        return next(new ValidationError('File upload error', [{
          field: fieldName,
          message: err.message,
        }]));
      } else if (err) {
        return next(new ValidationError('Invalid file type', [{
          field: fieldName,
          message: err.message,
        }]));
      }
      
      if (required && !req.file) {
        return next(new ValidationError('File required', [{
          field: fieldName,
          message: 'Please upload a file',
        }]));
      }
      
      next();
    });
  };
};

// ============================================================================
// Export Combined Middleware
// ============================================================================

export const validationMiddleware = {
  body: validateBody,
  params: validateParams,
  query: validateQuery,
  sanitize: sanitizeStrings,
  file: validateFileUpload,
};

export default validationMiddleware;

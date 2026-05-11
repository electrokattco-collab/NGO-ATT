/**
 * Global Error Handler Middleware
 * 
 * Centralized error handling for:
 * - API errors (structured JSON responses)
 * - Async error catching
 * - Error logging
 * - Production-safe error messages
 */

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '@/src/lib/logger.js';
import { env } from '@/src/lib/env.js';

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base application error
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code?: string) {
    super(message, 400, code);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code?: string) {
    super(message, 409, code);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  public errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation failed',
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code);
  }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', code?: string) {
    super(message, 503, code);
  }
}

// ============================================================================
// Async Handler Wrapper
// ============================================================================

/**
 * Wraps async route handlers to catch errors automatically
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================================================
// Error Response Formatting
// ============================================================================

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    errors?: Array<{ field: string; message: string }>;
    stack?: string;
    requestId: string;
    timestamp: string;
  };
}

/**
 * Generates a unique request ID for error tracking
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formats error for API response
 */
const formatErrorResponse = (err: Error | AppError, requestId: string): ErrorResponse => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  
  const response: ErrorResponse = {
    success: false,
    error: {
      message: err.message,
      statusCode,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  // Add error code if available
  if (isAppError && (err as AppError).code) {
    response.error.code = (err as AppError).code;
  }

  // Add validation errors if available
  if (err instanceof ValidationError && err.errors.length > 0) {
    response.error.errors = err.errors;
  }

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  return response;
};

// ============================================================================
// Global Error Handler
// ============================================================================

/**
 * Express global error handler middleware
 * Must be registered AFTER all routes and other middleware
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const requestId = generateRequestId();
  
  // Determine status code
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  const isOperational = isAppError ? (err as AppError).isOperational : false;

  // Log error with context
  const errorContext = {
    requestId,
    method: req.method,
    path: req.path,
    statusCode,
    isOperational,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.connection.remoteAddress,
    query: req.query,
    body: env.NODE_ENV === 'development' ? req.body : undefined,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error(`Server Error [${requestId}]: ${err.message}`, errorContext);
  } else if (statusCode === 429) {
    logger.warn(`Rate Limit Exceeded [${requestId}]: ${err.message}`, errorContext);
  } else {
    logger.info(`Client Error [${requestId}]: ${err.message}`, errorContext);
  }

  // Send response
  const errorResponse = formatErrorResponse(err, requestId);
  res.status(statusCode).json(errorResponse);
};

// ============================================================================
// 404 Not Found Handler
// ============================================================================

/**
 * Handles requests to undefined routes
 * Place this AFTER all defined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new NotFoundError(`Route not found: ${req.method} ${req.path}`);
  next(err);
};

// ============================================================================
// Uncaught Exception Handlers
// ============================================================================

/**
 * Handle uncaught exceptions
 * Called at application startup
 */
export const initializeErrorHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
      error: err.message,
      stack: err.stack,
    });
    
    // Give logger time to write before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    logger.error('UNHANDLED REJECTION! 💥', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    
    // Don't exit immediately - let current requests finish
    // The server should be restarted by the process manager (PM2, Docker, etc.)
  });

  // Handle SIGTERM (graceful shutdown)
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    
    // Give time for ongoing requests to finish
    setTimeout(() => {
      logger.info('Process terminated');
      process.exit(0);
    }, 30000); // 30 second grace period
  });
};

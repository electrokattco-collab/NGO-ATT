/**
 * Winston Logger Configuration
 * 
 * Provides structured logging with:
 * - Multiple transports (console, file)
 * - Log rotation
 * - Different log levels per environment
 * - Structured JSON logging for production
 */

import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import * as Sentry from '@sentry/node';
import { env } from '@/src/lib/env.js';

// ============================================================================
// Log Format Configuration
// ============================================================================

/**
 * Custom format for development - human readable
 */
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
  })
);

/**
 * Custom format for production - structured JSON
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ============================================================================
// Log Level Configuration
// ============================================================================

/**
 * Define log levels
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

/**
 * Define colors for each level
 */
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
};

// Add colors to winston
winston.addColors(logColors);

// ============================================================================
// Transport Configuration
// ============================================================================

const transports: winston.transport[] = [];

// Console transport - always enabled
transports.push(
  new winston.transports.Console({
    format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  })
);

// File transports - only in production
if (env.NODE_ENV === 'production') {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: prodFormat,
    })
  );
  
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: prodFormat,
    })
  );
  
  // HTTP access log
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: prodFormat,
    })
  );
}

if (env.LOG_AGGREGATOR_URL) {
  try {
    const aggregatorUrl = new URL(env.LOG_AGGREGATOR_URL);
    transports.push(
      new winston.transports.Http({
        host: aggregatorUrl.hostname,
        port: aggregatorUrl.port ? Number(aggregatorUrl.port) : (aggregatorUrl.protocol === 'https:' ? 443 : 80),
        path: `${aggregatorUrl.pathname}${aggregatorUrl.search}`,
        ssl: aggregatorUrl.protocol === 'https:',
        headers: env.LOG_AGGREGATOR_API_KEY ? { Authorization: `Bearer ${env.LOG_AGGREGATOR_API_KEY}` } : undefined,
        format: prodFormat,
      })
    );
  } catch (error) {
    console.warn('Invalid LOG_AGGREGATOR_URL, skipping remote transport:', error);
  }
}

// ============================================================================
// Monitoring Setup
// ============================================================================

const sentryEnabled = Boolean(env.SENTRY_DSN);

if (sentryEnabled) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0.0,
    release: process.env.npm_package_version,
  });
}

// ============================================================================
// Logger Instance
// ============================================================================

/**
 * Main Winston logger instance
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels: logLevels,
  defaultMeta: {
    service: 'att-ngo-platform',
    environment: env.NODE_ENV,
  },
  transports,
  exitOnError: false,
});

export const reportError = (error: Error, context: Record<string, any> = {}) => {
  logger.error(error.message, { ...context, stack: error.stack });

  if (sentryEnabled) {
    Sentry.captureException(error, { extra: context });
  }
};

// ============================================================================
// HTTP Request Logger (Morgan-style)
// ============================================================================

import type { Request, Response } from 'express';

/**
 * Logs HTTP requests in a structured format
 * Compatible with Express middleware pattern
 */
export const httpLogger = (req: Request, res: Response, next: () => void) => {
  const startTime = Date.now();
  
  // Capture the original end function
  const originalEnd = res.end.bind(res);
  
  // Override end function to log after response is sent
  res.end = function(chunk?: any, encoding?: any, cb?: any): Response {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      referer: req.get('referer'),
    };
    
    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
    
    // Call original end
    return originalEnd(chunk, encoding, cb);
  };
  
  next();
};

/**
 * Express stream interface for Morgan integration
 */
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log a startup message with system info
 */
export const logStartup = (port: number) => {
  logger.info('🚀 Server starting...', {
    port,
    environment: env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid,
  });
};

/**
 * Log Firebase connection status
 */
export const logFirebaseStatus = (connected: boolean, projectId?: string) => {
  if (connected) {
    logger.info('🔥 Firebase connected', { projectId });
  } else {
    logger.error('🔥 Firebase connection failed');
  }
};

/**
 * Log authentication events
 */
export const logAuth = (event: 'login' | 'logout' | 'register' | 'refresh', userId: string, email?: string) => {
  logger.info(`Auth: ${event}`, { userId, email });
};

/**
 * Log security events
 */
export const logSecurity = (event: string, details: Record<string, any>) => {
  logger.warn(`Security: ${event}`, details);
};

// ============================================================================
// Debug Helpers
// ============================================================================

/**
 * Conditional debug logging
 */
export const debug = (message: string, metadata?: Record<string, any>) => {
  if (env.LOG_LEVEL === 'debug') {
    logger.debug(message, metadata);
  }
};

export default logger;

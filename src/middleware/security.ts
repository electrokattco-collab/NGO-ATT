/**
 * Security Middleware Configuration
 * * Implements production-grade security measures:
 * - Rate limiting to prevent abuse
 * - Helmet for security headers
 * - CORS configuration
 * - Request sanitization
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import { env } from '@/src/lib/env.js';

// Determine environments for conditional security rules
const isTestEnv = process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test';
const isDevEnv = process.env.NODE_ENV === 'development' || env.NODE_ENV === 'development';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

/**
 * General API rate limiter - applies to all routes
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests',
    message: 'Please slow down and try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    if (req.path === '/api/health') {
      return true;
    }
    // Skip rate limiting in test environment
    if (isTestEnv || process.env.ENABLE_RATE_LIMIT === 'false') {
      return true;
    }
    return false;
  },
});

/**
 * Strict rate limiter for sensitive operations
 * Used for authentication endpoints to prevent brute force
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many attempts',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many attempts',
      message: 'Authentication rate limit exceeded. Please try again in 15 minutes.',
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});

/**
 * Payment rate limiter - very strict to prevent payment abuse
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    error: 'Payment rate limit exceeded',
    message: 'Too many payment attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// Helmet Configuration
// ============================================================================

/**
 * Content Security Policy configuration
 * Restricts what resources can be loaded
 */
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for some React features
    "'unsafe-eval'", // Required for some bundler features
    "https://*.firebaseapp.com",
    "https://*.googleapis.com",
    "https://apis.google.com", // Added for Google/Firebase Auth scripts
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    "https://fonts.googleapis.com",
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://*.unsplash.com",
    "https://*.firebaseapp.com",
    "https://*.googleusercontent.com",
  ],
  connectSrc: [
    "'self'",
    "https://*.firebaseio.com",
    "https://*.googleapis.com",
    "https://*.firebaseapp.com",
    "wss://*.firebaseio.com",
    // Dynamically allow Vite's HMR websockets ONLY in development
    ...(isDevEnv ? ["ws://localhost:24678", "ws://localhost:3000"] : [])
  ],
  frameSrc: [
    "'self'",
    "https://*.firebaseapp.com",
    "https://*.yoco.com", // Payment iframe
    "https://*.payfast.co.za", // Payment iframe
  ],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: [],
};

/**
 * Helmet middleware configuration
 */
export const helmetMiddleware = helmet({
  // Completely disable CSP during tests to prevent websocket/script blocking
  contentSecurityPolicy: isTestEnv ? false : {
    directives: cspDirectives,
  },
  crossOriginEmbedderPolicy: false, // Disable for Firebase compatibility
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// ============================================================================
// CORS Configuration
// ============================================================================

/**
 * CORS middleware with configurable origins
 */
export const corsMiddleware = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    const allowedOrigins = env.CORS_ORIGIN;
    
    if (allowedOrigins.includes(origin) || isDevEnv) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

// ============================================================================
// Request Sanitization
// ============================================================================

/**
 * Sanitizes request body to prevent injection attacks
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    // Remove potentially dangerous fields
    const forbiddenFields = ['__proto__', 'constructor', 'prototype'];
    
    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Skip forbidden fields
          if (forbiddenFields.includes(key)) {
            console.warn(`Sanitized forbidden field: ${key}`);
            continue;
          }
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitize(req.body);
  }
  
  next();
};

/**
 * Validates Content-Type for POST/PUT/PATCH requests
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    // Skip validation for multipart/form-data (file uploads)
    if (contentType?.includes('multipart/form-data')) {
      return next();
    }
    
    // Require JSON for API endpoints
    if (req.path.startsWith('/api/') && !contentType?.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json for API endpoints',
      });
    }
  }
  
  next();
};

// ============================================================================
// Security Headers (Custom)
// ============================================================================

/**
 * Additional custom security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Disable caching for API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Permissions policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), magnetometer=(), gyroscope=()'
  );
  
  next();
};

// ============================================================================
// IP Whitelist (Optional - for admin endpoints)
// ============================================================================

interface IpWhitelistOptions {
  allowedIps: string[];
  message?: string;
}

/**
 * Creates middleware to restrict access by IP address
 * Use for admin endpoints in high-security environments
 */
export const createIpWhitelist = (options: IpWhitelistOptions) => {
  const { allowedIps, message = 'Access denied' } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP (handle proxies)
    const clientIp = req.ip || 
                     req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
                     'unknown';
    
    if (!allowedIps.includes(clientIp)) {
      console.warn(`IP whitelist blocked: ${clientIp}`);
      return res.status(403).json({ error: message });
    }
    
    next();
  };
};
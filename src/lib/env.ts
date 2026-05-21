/**
 * Environment Configuration Validation
 * 
 * Validates all required environment variables at runtime.
 * Fails fast if critical configuration is missing.
 */

import { config } from 'dotenv';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
  config();
}

// ============================================================================
// Type Definitions
// ============================================================================

interface EnvConfig {
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // Firebase Client (Public)
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_DATABASE_ID: string;
  
  // Firebase Admin (Private)
  FIREBASE_SERVICE_ACCOUNT?: string;
  
  // Security
  SESSION_SECRET: string;
  CORS_ORIGIN: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  PAYMENT_RATE_LIMIT_WINDOW_MS: number;
  PAYMENT_RATE_LIMIT_MAX_REQUESTS: number;
  CONTACT_RATE_LIMIT_WINDOW_MS: number;
  CONTACT_RATE_LIMIT_MAX_REQUESTS: number;
  
  // Payments
  YOCO_SECRET_KEY?: string;
  YOCO_PUBLIC_KEY?: string;
  YOCO_WEBHOOK_SECRET?: string;
  PAYFAST_MERCHANT_ID?: string;
  PAYFAST_MERCHANT_KEY?: string;
  PAYFAST_PASSPHRASE?: string;
  PAYFAST_SANDBOX_MODE: boolean;
  VIRUS_SCAN_ENABLED: boolean;
  
  // Email
  SENDGRID_API_KEY?: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  
  // Monitoring
  SENTRY_DSN?: string;
  LOG_AGGREGATOR_URL?: string;
  LOG_AGGREGATOR_API_KEY?: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // Feature Flags
  ENABLE_PAYMENTS: boolean;
  ENABLE_EMAILS: boolean;
  ENABLE_ANALYTICS: boolean;
}

// ============================================================================
// Validation Helper
// ============================================================================

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = process.env[key];
  
  if (required && (!value || value.trim() === '')) {
    throw new EnvValidationError(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env file and ensure all required variables are set.`
    );
  }
  
  return value;
}

function parseIntOrDefault(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

// ============================================================================
// Configuration Loading
// ============================================================================

function loadConfig(): EnvConfig {
  try {
    const config: EnvConfig = {
      // Server
      NODE_ENV: (getEnvVar('NODE_ENV', false) as EnvConfig['NODE_ENV']) || 'development',
      PORT: parseIntOrDefault(getEnvVar('PORT', false), 3000),
      
      // Firebase Client
      VITE_FIREBASE_API_KEY: getEnvVar('VITE_FIREBASE_API_KEY')!,
      VITE_FIREBASE_AUTH_DOMAIN: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN')!,
      VITE_FIREBASE_PROJECT_ID: getEnvVar('VITE_FIREBASE_PROJECT_ID')!,
      VITE_FIREBASE_STORAGE_BUCKET: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET')!,
      VITE_FIREBASE_MESSAGING_SENDER_ID: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID')!,
      VITE_FIREBASE_APP_ID: getEnvVar('VITE_FIREBASE_APP_ID')!,
      VITE_FIREBASE_DATABASE_ID: getEnvVar('VITE_FIREBASE_DATABASE_ID')!,
      
      // Firebase Admin (optional for dev)
      FIREBASE_SERVICE_ACCOUNT: getEnvVar('FIREBASE_SERVICE_ACCOUNT', false),
      
      // Security
      SESSION_SECRET: getEnvVar('SESSION_SECRET', false) || 'dev-secret-change-in-production',
      CORS_ORIGIN: parseArray(getEnvVar('CORS_ORIGIN', false), ['http://localhost:3000']),
      RATE_LIMIT_WINDOW_MS: parseIntOrDefault(getEnvVar('RATE_LIMIT_WINDOW_MS', false), 15 * 60 * 1000),
      RATE_LIMIT_MAX_REQUESTS: parseIntOrDefault(getEnvVar('RATE_LIMIT_MAX_REQUESTS', false), 100),
      
      // Payments
      YOCO_SECRET_KEY: getEnvVar('YOCO_SECRET_KEY', false),
      YOCO_PUBLIC_KEY: getEnvVar('YOCO_PUBLIC_KEY', false),
      YOCO_WEBHOOK_SECRET: getEnvVar('YOCO_WEBHOOK_SECRET', false),
      PAYFAST_MERCHANT_ID: getEnvVar('PAYFAST_MERCHANT_ID', false),
      PAYFAST_MERCHANT_KEY: getEnvVar('PAYFAST_MERCHANT_KEY', false),
      PAYFAST_PASSPHRASE: getEnvVar('PAYFAST_PASSPHRASE', false) || '',
      PAYFAST_SANDBOX_MODE: parseBoolean(getEnvVar('PAYFAST_SANDBOX_MODE', false), true),
      
      // Email
      SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY', false),
      EMAIL_FROM: getEnvVar('EMAIL_FROM', false) || 'noreply@attngo.org',
      EMAIL_FROM_NAME: getEnvVar('EMAIL_FROM_NAME', false) || 'ATT NGO',
      
      // Monitoring
      SENTRY_DSN: getEnvVar('SENTRY_DSN', false),
      LOG_AGGREGATOR_URL: getEnvVar('LOG_AGGREGATOR_URL', false),
      LOG_AGGREGATOR_API_KEY: getEnvVar('LOG_AGGREGATOR_API_KEY', false),
      LOG_LEVEL: (getEnvVar('LOG_LEVEL', false) as EnvConfig['LOG_LEVEL']) || 'info',
      
      // Rate limiting
      PAYMENT_RATE_LIMIT_WINDOW_MS: parseIntOrDefault(getEnvVar('PAYMENT_RATE_LIMIT_WINDOW_MS', false), 60 * 60 * 1000),
      PAYMENT_RATE_LIMIT_MAX_REQUESTS: parseIntOrDefault(getEnvVar('PAYMENT_RATE_LIMIT_MAX_REQUESTS', false), 10),
      CONTACT_RATE_LIMIT_WINDOW_MS: parseIntOrDefault(getEnvVar('CONTACT_RATE_LIMIT_WINDOW_MS', false), 15 * 60 * 1000),
      CONTACT_RATE_LIMIT_MAX_REQUESTS: parseIntOrDefault(getEnvVar('CONTACT_RATE_LIMIT_MAX_REQUESTS', false), 10),
      
      // File uploads
      VIRUS_SCAN_ENABLED: parseBoolean(getEnvVar('VIRUS_SCAN_ENABLED', false), false),
      
      // Feature Flags
      ENABLE_PAYMENTS: parseBoolean(getEnvVar('ENABLE_PAYMENTS', false), false),
      ENABLE_EMAILS: parseBoolean(getEnvVar('ENABLE_EMAILS', false), false),
      ENABLE_ANALYTICS: parseBoolean(getEnvVar('ENABLE_ANALYTICS', false), false),
    };
    
    // Production-specific validations
    if (config.NODE_ENV === 'production') {
      if (config.SESSION_SECRET === 'dev-secret-change-in-production') {
        throw new EnvValidationError(
          'SESSION_SECRET must be changed from default value in production!'
        );
      }
      
      if (config.SESSION_SECRET.length < 32) {
        throw new EnvValidationError(
          'SESSION_SECRET must be at least 32 characters long in production!'
        );
      }
      
      if (!config.CORS_ORIGIN.length) {
        throw new EnvValidationError('CORS_ORIGIN must be configured for production.');
      }
      
      const invalidOrigins = config.CORS_ORIGIN.filter(origin => /(localhost|127\.0\.0\.1)/.test(origin));
      if (invalidOrigins.length > 0) {
        throw new EnvValidationError(
          `Production CORS_ORIGIN cannot contain local development entries: ${invalidOrigins.join(', ')}`
        );
      }
      
      if (!config.FIREBASE_SERVICE_ACCOUNT) {
        console.warn('⚠️  WARNING: FIREBASE_SERVICE_ACCOUNT not set. ' +
          'Server will attempt to use application default credentials.');
      }
    }
    
    return config;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error('\n❌ Environment Configuration Error:\n');
      console.error(error.message);
      console.error('\nPlease check your .env file and try again.\n');
      process.exit(1);
    }
    throw error;
  }
}

// ============================================================================
// Export Configuration
// ============================================================================

export const env = loadConfig();

// Client-safe config (for Vite)
export const clientEnv = {
  VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: env.VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_DATABASE_ID: env.VITE_FIREBASE_DATABASE_ID,
};

// Feature flags helper
export const features = {
  isEnabled: (flag: keyof Pick<EnvConfig, 'ENABLE_PAYMENTS' | 'ENABLE_EMAILS' | 'ENABLE_ANALYTICS'>) => {
    return env[flag];
  },
  all: () => ({
    payments: env.ENABLE_PAYMENTS,
    emails: env.ENABLE_EMAILS,
    analytics: env.ENABLE_ANALYTICS,
  }),
};

export default env;

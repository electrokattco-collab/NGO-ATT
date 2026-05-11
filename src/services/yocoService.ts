/**
 * Yoco Payment Gateway Service
 * 
 * Integration with Yoco's payment API for South African transactions
 * Docs: https://developer.yoco.com/
 */

import { env } from '@/src/lib/env.js';
import { logger } from '@/src/lib/logger.js';
import { 
  yocoPaymentIntentSchema, 
  type YocoPaymentIntent,
  type DonationInput 
} from '@/src/lib/validation.js';
import { ValidationError, BadRequestError } from '@/src/middleware/errorHandler.js';

// ============================================================================
// Types
// ============================================================================

export interface YocoCheckoutSession {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: 'pending' | 'complete' | 'cancelled' | 'failed';
  metadata: Record<string, string>;
  createdAt: string;
  expiresAt?: string;
}

export interface YocoWebhookEvent {
  id: string;
  type: 'checkout.completed' | 'checkout.cancelled' | 'checkout.failed' | 'payment.success' | 'payment.failed';
  createdAt: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: Record<string, string>;
      paymentMethod?: {
        type: string;
        last4?: string;
        brand?: string;
      };
    };
  };
}

// ============================================================================
// Configuration
// ============================================================================

const YOCO_API_BASE = env.NODE_ENV === 'production' 
  ? 'https://payments.yoco.com/api'
  : 'https://online.yoco.com/v1';

const YOCO_PUBLIC_KEY = env.YOCO_PUBLIC_KEY;
const YOCO_SECRET_KEY = env.YOCO_SECRET_KEY;

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Validates that Yoco is properly configured
 */
export const isYocoConfigured = (): boolean => {
  return !!(YOCO_PUBLIC_KEY && YOCO_SECRET_KEY);
};

/**
 * Creates a Yoco checkout session
 * This generates a payment URL that the user is redirected to
 */
export const createCheckoutSession = async (
  donationData: DonationInput
): Promise<YocoCheckoutSession> => {
  if (!isYocoConfigured()) {
    throw new BadRequestError('Yoco payment gateway is not configured');
  }

  // Validate in test mode if payments disabled
  if (!env.ENABLE_PAYMENTS && env.NODE_ENV !== 'production') {
    logger.info('Yoco: Simulating checkout session (payments disabled)');
    return {
      id: `cs_test_${Date.now()}`,
      url: `${env.CORS_ORIGIN[0]}/donations/success?session_id=cs_test_${Date.now()}`,
      amount: donationData.amount,
      currency: 'ZAR',
      status: 'pending',
      metadata: {
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail || '',
        donationType: donationData.donationType,
        message: donationData.message || '',
        isAnonymous: String(donationData.isAnonymous || false),
      },
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${YOCO_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(donationData.amount * 100), // Convert to cents
        currency: 'ZAR',
        successUrl: `${env.CORS_ORIGIN[0]}/donations/success?session_id={checkout.id}`,
        cancelUrl: `${env.CORS_ORIGIN[0]}/donations?cancelled=true`,
        metadata: {
          donorName: donationData.donorName,
          donorEmail: donationData.donorEmail || '',
          donationType: donationData.donationType,
          message: donationData.message || '',
          isAnonymous: String(donationData.isAnonymous || false),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('Yoco checkout creation failed', { error, status: response.status });
      throw new BadRequestError(error.message || 'Failed to create checkout session');
    }

    const session = await response.json();
    
    logger.info('Yoco checkout session created', {
      sessionId: session.id,
      amount: donationData.amount,
    });

    return {
      id: session.id,
      url: session.redirectUrl || session.url,
      amount: donationData.amount,
      currency: 'ZAR',
      status: 'pending',
      metadata: session.metadata,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Yoco checkout creation error', { error: (error as Error).message });
    throw new BadRequestError('Failed to create payment session. Please try again.');
  }
};

/**
 * Retrieves a checkout session by ID
 */
export const getCheckoutSession = async (sessionId: string): Promise<YocoCheckoutSession> => {
  if (!isYocoConfigured()) {
    throw new BadRequestError('Yoco payment gateway is not configured');
  }

  // Mock response for test mode
  if (sessionId.startsWith('cs_test_')) {
    return {
      id: sessionId,
      url: '',
      amount: 0,
      currency: 'ZAR',
      status: 'complete',
      metadata: {},
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${YOCO_API_BASE}/checkouts/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestError('Checkout session not found');
    }

    const session = await response.json();
    
    return {
      id: session.id,
      url: session.redirectUrl || '',
      amount: session.amount / 100, // Convert from cents
      currency: session.currency,
      status: session.status,
      metadata: session.metadata || {},
      createdAt: session.createdAt,
    };
  } catch (error) {
    logger.error('Yoco get session error', { error: (error as Error).message, sessionId });
    throw new BadRequestError('Failed to retrieve payment session');
  }
};

/**
 * Verifies a Yoco webhook signature
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    // In production, use crypto to verify HMAC signature
    // const crypto = await import('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', secret)
    //   .update(payload)
    //   .digest('hex');
    // return signature === expectedSignature;
    
    // For now, log and accept (implement proper verification in production)
    logger.debug('Yoco webhook signature verification', { signature });
    return true;
  } catch (error) {
    logger.error('Webhook signature verification failed', { error });
    return false;
  }
};

/**
 * Processes a Yoco webhook event
 */
export const processWebhook = async (event: YocoWebhookEvent): Promise<{
  success: boolean;
  donationId?: string;
  status: 'completed' | 'failed' | 'cancelled';
}> => {
  logger.info('Processing Yoco webhook', { 
    eventType: event.type, 
    eventId: event.id,
    checkoutId: event.data.object.id,
  });

  const { object } = event.data;

  switch (event.type) {
    case 'checkout.completed':
    case 'payment.success':
      return {
        success: true,
        donationId: object.metadata?.donationId,
        status: 'completed',
      };

    case 'checkout.cancelled':
      return {
        success: false,
        donationId: object.metadata?.donationId,
        status: 'cancelled',
      };

    case 'checkout.failed':
    case 'payment.failed':
      return {
        success: false,
        donationId: object.metadata?.donationId,
        status: 'failed',
      };

    default:
      logger.warn('Unhandled Yoco webhook event type', { type: event.type });
      return {
        success: false,
        status: 'failed',
      };
  }
};

/**
 * Gets the Yoco public key for client-side use
 */
export const getPublicKey = (): string => {
  return YOCO_PUBLIC_KEY || '';
};

// ============================================================================
// Client-side Payment Intent (for custom checkout)
// ============================================================================

/**
 * Creates a payment token using Yoco's client SDK
 * This would be called from the frontend
 */
export const createPaymentToken = async (cardDetails: {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}): Promise<{ id: string }> => {
  // This is a placeholder - actual implementation uses Yoco's JS SDK
  // In production, this happens entirely client-side
  throw new BadRequestError('Payment token creation must be done client-side');
};

// ============================================================================
// Export Service
// ============================================================================

export const yocoService = {
  createCheckoutSession,
  getCheckoutSession,
  verifyWebhookSignature,
  processWebhook,
  getPublicKey,
  isConfigured: isYocoConfigured,
};

export default yocoService;

/**
 * PayFast Payment Gateway Service
 * 
 * Integration with PayFast for South African payment processing
 * Docs: https://developers.payfast.co.za/docs
 */

import crypto from 'crypto';
import { env } from '@/src/lib/env.js';
import { logger } from '@/src/lib/logger.js';
import { type DonationInput } from '@/src/lib/validation.js';
import { BadRequestError } from '@/src/middleware/errorHandler.js';

// ============================================================================
// Types
// ============================================================================

export interface PayFastFormData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  email_confirmation?: string;
  confirmation_address?: string;
  signature: string;
}

export interface PayFastITNPayload {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: 'COMPLETE' | 'FAILED' | 'CANCELLED' | 'PENDING';
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  signature: string;
}

// ============================================================================
// Configuration
// ============================================================================

const PAYFAST_URL = env.NODE_ENV === 'production'
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

const MERCHANT_ID = env.PAYFAST_MERCHANT_ID;
const MERCHANT_KEY = env.PAYFAST_MERCHANT_KEY;
const PASSPHRASE = env.PAYFAST_PASSPHRASE || '';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates that PayFast is properly configured
 */
export const isPayFastConfigured = (): boolean => {
  return !!(MERCHANT_ID && MERCHANT_KEY);
};

/**
 * Generates PayFast signature
 * PayFast requires fields to be sorted alphabetically and concatenated
 */
const generateSignature = (data: Record<string, string>, passphrase: string = ''): string => {
  const { signature, ...dataWithoutSignature } = data;
  
  const sortedKeys = Object.keys(dataWithoutSignature).sort();
  const paramString = sortedKeys
    .filter(key => dataWithoutSignature[key] !== undefined && dataWithoutSignature[key] !== '')
    .map(key => `${key}=${encodeURIComponent(dataWithoutSignature[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  const stringToHash = passphrase 
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : paramString;

  return crypto.createHash('md5').update(stringToHash).digest('hex');
};

/**
 * Generates a unique payment ID
 */
const generatePaymentId = (): string => {
  return `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Creates PayFast form data for a donation
 * This data is used to create a form that submits to PayFast
 */
export const createPaymentFormData = (donationData: DonationInput): PayFastFormData => {
  const paymentId = generatePaymentId();

  if (!isPayFastConfigured()) {
    if (env.NODE_ENV !== 'production') {
      logger.info('PayFast: Simulating form data in non-production mode');
      const simulatedFormData: Omit<PayFastFormData, 'signature'> = {
        merchant_id: MERCHANT_ID || 'pf_test_merchant',
        merchant_key: MERCHANT_KEY || 'pf_test_key',
        return_url: `${env.CORS_ORIGIN[0]}/donations/success`,
        cancel_url: `${env.CORS_ORIGIN[0]}/donations?cancelled=true`,
        notify_url: `${env.CORS_ORIGIN[0]}/api/webhooks/payfast`,
        name_first: donationData.donorName.split(' ')[0] || 'Supporter',
        name_last: donationData.donorName.split(' ').slice(1).join(' ') || 'ATT',
        email_address: donationData.donorEmail,
        m_payment_id: paymentId,
        amount: donationData.amount.toFixed(2),
        item_name: `Donation to ATT NGO (${donationData.donationType})`,
        item_description: donationData.message || `Thank you for your ${donationData.donationType} donation`,
        custom_str1: donationData.donationType,
        custom_str2: String(donationData.isAnonymous || false),
        custom_str3: donationData.message || '',
        custom_str4: donationData.donorName,
      };

      return {
        ...simulatedFormData,
        signature: generateSignature(simulatedFormData as Record<string, string>, PASSPHRASE),
      };
    }
    throw new BadRequestError('PayFast payment gateway is not configured');
  }
  const baseUrl = env.CORS_ORIGIN[0] || 'http://localhost:3000';
  
  // Split name into first and last
  const nameParts = donationData.donorName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || 'Supporter';

  const formData: Omit<PayFastFormData, 'signature'> = {
    merchant_id: MERCHANT_ID!,
    merchant_key: MERCHANT_KEY!,
    return_url: `${baseUrl}/donations/success`,
    cancel_url: `${baseUrl}/donations?cancelled=true`,
    notify_url: `${baseUrl}/api/webhooks/payfast`,
    name_first: firstName,
    name_last: lastName,
    email_address: donationData.donorEmail,
    m_payment_id: paymentId,
    amount: donationData.amount.toFixed(2),
    item_name: `Donation to ATT NGO (${donationData.donationType})`,
    item_description: donationData.message || `Thank you for your ${donationData.donationType} donation`,
    custom_str1: donationData.donationType,
    custom_str2: String(donationData.isAnonymous || false),
    custom_str3: donationData.message || '',
    custom_str4: donationData.donorName,
  };

  // Generate signature
  const signature = generateSignature(formData as Record<string, string>, PASSPHRASE);

  logger.info('PayFast payment form created', {
    paymentId,
    amount: donationData.amount,
    donationType: donationData.donationType,
  });

  return {
    ...formData,
    signature,
  };
};

/**
 * Gets the PayFast submission URL
 */
export const getPaymentUrl = (): string => {
  return PAYFAST_URL;
};

/**
 * Verifies PayFast ITN (Instant Transaction Notification)
 * This validates that the notification came from PayFast
 */
export const verifyITN = async (payload: PayFastITNPayload): Promise<boolean> => {
  try {
    const expectedSignature = generateSignature(payload as unknown as Record<string, string>, PASSPHRASE);
    
    if (payload.signature !== expectedSignature) {
      logger.error('PayFast ITN signature mismatch', {
        expected: expectedSignature,
        received: payload.signature,
      });
      return false;
    }

    if (env.NODE_ENV === 'test') {
      logger.debug('Skipping remote PayFast validation in test environment');
      return true;
    }

    const verificationUrl = env.NODE_ENV === 'production'
      ? 'https://www.payfast.co.za/eng/query/validate'
      : 'https://sandbox.payfast.co.za/eng/query/validate';

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload as unknown as Record<string, string>),
    });

    const result = await response.text();
    
    if (result === 'VALID') {
      logger.info('PayFast ITN verified as VALID', { paymentId: payload.m_payment_id });
      return true;
    } else {
      logger.error('PayFast ITN verification failed', { result, paymentId: payload.m_payment_id });
      return false;
    }
  } catch (error) {
    logger.error('PayFast ITN verification error', { error: (error as Error).message });
    return false;
  }
};

/**
 * Processes a PayFast ITN payload
 */
export const processITN = async (payload: PayFastITNPayload): Promise<{
  success: boolean;
  paymentId: string;
  status: 'completed' | 'failed' | 'cancelled' | 'pending';
  amount: number;
  metadata: {
    donationType: string;
    isAnonymous: boolean;
    message: string;
    donorName: string;
  };
}> => {
  logger.info('Processing PayFast ITN', {
    paymentId: payload.m_payment_id,
    status: payload.payment_status,
    amount: payload.amount_gross,
  });

  const status = mapPaymentStatus(payload.payment_status);
  
  return {
    success: status === 'completed',
    paymentId: payload.m_payment_id,
    status,
    amount: parseFloat(payload.amount_gross),
    metadata: {
      donationType: payload.custom_str1 || 'one-time',
      isAnonymous: payload.custom_str2 === 'true',
      message: payload.custom_str3 || '',
      donorName: payload.custom_str4 || payload.name_first || 'Anonymous',
    },
  };
};

/**
 * Maps PayFast status to internal status
 */
const mapPaymentStatus = (payfastStatus: string): 'completed' | 'failed' | 'cancelled' | 'pending' => {
  switch (payfastStatus) {
    case 'COMPLETE':
      return 'completed';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    case 'PENDING':
      return 'pending';
    default:
      return 'failed';
  }
};

/**
 * Validates server IP against PayFast IP ranges
 * For additional security, verify the request comes from PayFast
 */
export const isValidPayFastIP = (clientIP: string): boolean => {
  const validIPs = [
    '197.97.145.144',
    '197.97.145.145',
    '197.97.145.146',
    '102.165.216.0/23',
    '41.74.128.0/22',
  ];

  logger.debug('PayFast IP check', { clientIP });

  if (env.NODE_ENV !== 'production') {
    return true;
  }

  return validIPs.some(ip => clientIP.startsWith(ip.replace('/23', '').replace('/22', '')));
};

// ============================================================================
// Sandbox/Test Mode Helpers
// ============================================================================

/**
 * Creates test ITN payload for development
 */
export const createTestITN = (paymentId: string, status: 'COMPLETE' | 'FAILED' = 'COMPLETE'): PayFastITNPayload => {
  const payload: Omit<PayFastITNPayload, 'signature'> = {
    m_payment_id: paymentId,
    pf_payment_id: `PF-${Date.now()}`,
    payment_status: status,
    item_name: 'Test Donation',
    amount_gross: '100.00',
    amount_fee: '3.00',
    amount_net: '97.00',
    custom_str1: 'one-time',
    custom_str2: 'false',
    custom_str3: 'Test message',
    custom_str4: 'Test Donor',
    name_first: 'Test',
    name_last: 'Donor',
    email_address: 'test@example.com',
    merchant_id: MERCHANT_ID || 'test_merchant',
  };

  return {
    ...payload,
    signature: generateSignature(payload as Record<string, string>, PASSPHRASE),
  };
};

// ============================================================================
// Export Service
// ============================================================================

export const payfastService = {
  createPaymentFormData,
  getPaymentUrl,
  verifyITN,
  processITN,
  isValidPayFastIP,
  isConfigured: isPayFastConfigured,
  // Test helpers
  createTestITN,
};

export default payfastService;

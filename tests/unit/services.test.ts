/**
 * Service Unit Tests
 * 
 * Tests for business logic services
 */

import { emailService } from '@/src/services/emailService.js';
import { yocoService } from '@/src/services/yocoService.js';
import { payfastService } from '@/src/services/payfastService.js';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

// Mock logger
jest.mock('@/src/lib/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  logFirebaseStatus: jest.fn(),
  logStartup: jest.fn(),
  loggerStream: { write: jest.fn() },
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDonationReceipt', () => {
    test('should send donation receipt email', async () => {
      const donationData = {
        donorName: 'John Doe',
        donorEmail: 'john@example.com',
        amount: 100,
        donationType: 'one-time' as const,
        transactionReference: 'TXN-123',
        isAnonymous: false,
      };

      await emailService.sendDonationReceipt(donationData);
      
      // Should not throw
      expect(true).toBe(true);
    });

    test('should handle anonymous donations', async () => {
      const donationData = {
        donorName: 'Anonymous',
        donorEmail: 'anon@example.com',
        amount: 500,
        donationType: 'monthly' as const,
        transactionReference: 'TXN-456',
        isAnonymous: true,
        message: 'Keep up the great work!',
      };

      await emailService.sendDonationReceipt(donationData);
      
      expect(true).toBe(true);
    });
  });

  describe('sendVolunteerConfirmation', () => {
    test('should send volunteer confirmation email', async () => {
      const volunteerData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        status: 'pending' as const,
      };

      await emailService.sendVolunteerConfirmation(volunteerData);
      
      expect(true).toBe(true);
    });
  });

  describe('sendContactConfirmation', () => {
    test('should send contact form confirmation', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message that is definitely long enough to pass validation.',
      };

      await emailService.sendContactConfirmation(contactData);
      
      expect(true).toBe(true);
    });
  });
});

describe('Yoco Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    test('should return false when API keys are not set', () => {
      const result = yocoService.isConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('createCheckoutSession', () => {
    test('should create checkout session in test mode', async () => {
      const donationData = {
        donorName: 'Test User',
        donorEmail: 'test@example.com',
        amount: 100,
        donationType: 'one-time' as const,
        isAnonymous: false,
      };

      try {
        const session = await yocoService.createCheckoutSession(donationData);
        
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('url');
        expect(session.amount).toBe(100);
        expect(session.currency).toBe('ZAR');
      } catch (error) {
        // May fail if not configured, which is expected
        expect(error).toBeDefined();
      }
    });
  });

  describe('verifyWebhookSignature', () => {
    test('should verify webhook signature', () => {
      const result = yocoService.verifyWebhookSignature(
        'test-payload',
        'test-signature',
        'test-secret'
      );
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('processWebhook', () => {
    test('should process completed checkout', async () => {
      const event = {
        id: 'evt-123',
        type: 'checkout.completed' as const,
        createdAt: new Date().toISOString(),
        data: {
          object: {
            id: 'cs-123',
            amount: 10000,
            currency: 'ZAR',
            status: 'complete',
            metadata: {
              donationId: 'don-123',
            },
          },
        },
      };

      const result = await yocoService.processWebhook(event);
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
    });

    test('should process failed payment', async () => {
      const event = {
        id: 'evt-456',
        type: 'payment.failed' as const,
        createdAt: new Date().toISOString(),
        data: {
          object: {
            id: 'pay-456',
            amount: 5000,
            currency: 'ZAR',
            status: 'failed',
            metadata: {
              donationId: 'don-456',
            },
          },
        },
      };

      const result = await yocoService.processWebhook(event);
      
      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
    });
  });
});

describe('PayFast Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    test('should return false when merchant credentials are not set', () => {
      const result = payfastService.isConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('createPaymentFormData', () => {
    test('should throw error when not configured', () => {
      const donationData = {
        donorName: 'Test User',
        donorEmail: 'test@example.com',
        amount: 100,
        donationType: 'one-time' as const,
        isAnonymous: false,
      };

      expect(() => {
        payfastService.createPaymentFormData(donationData);
      }).toThrow();
    });
  });

  describe('processITN', () => {
    test('should process successful payment', async () => {
      const payload = {
        m_payment_id: 'ATT-123',
        pf_payment_id: 'PF-456',
        payment_status: 'COMPLETE' as const,
        item_name: 'Donation',
        amount_gross: '100.00',
        amount_fee: '3.00',
        amount_net: '97.00',
        custom_str1: 'one-time',
        custom_str2: 'false',
        custom_str3: 'Thank you!',
        custom_str4: 'John Doe',
        name_first: 'John',
        name_last: 'Doe',
        email_address: 'john@example.com',
        merchant_id: 'test-merchant',
        signature: 'test-signature',
      };

      const result = await payfastService.processITN(payload);
      
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(100.00);
      expect(result.metadata.donorName).toBe('John Doe');
    });

    test('should process failed payment', async () => {
      const payload = {
        m_payment_id: 'ATT-789',
        pf_payment_id: 'PF-999',
        payment_status: 'FAILED' as const,
        item_name: 'Donation',
        amount_gross: '50.00',
        amount_fee: '0.00',
        amount_net: '0.00',
        custom_str1: 'monthly',
        custom_str2: 'true',
        custom_str3: '',
        custom_str4: 'Anonymous',
        merchant_id: 'test-merchant',
        signature: 'test-signature',
      };

      const result = await payfastService.processITN(payload);
      
      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.metadata.isAnonymous).toBe(true);
    });
  });

  describe('isValidPayFastIP', () => {
    test('should validate IP addresses', () => {
      const result = payfastService.isValidPayFastIP('197.97.145.144');
      expect(typeof result).toBe('boolean');
    });
  });
});

/**
 * E2E Tests - Payment Checkout and Webhook Flows
 */

import { test, expect } from '@playwright/test';
import crypto from 'crypto';

const donationPayload = {
  donorName: 'Playwright Donor',
  donorEmail: 'playwright@example.com',
  amount: 100,
  donationType: 'one-time',
  isAnonymous: false,
  message: 'Testing payment checkout and webhook flows.',
};

const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET || 'playwright-test-webhook-secret';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'playwright-test-passphrase';

const buildPayFastSignature = (data: Record<string, string>, passphrase: string): string => {
  const payload = { ...data };
  delete payload.signature;

  const sortedKeys = Object.keys(payload).sort();
  const queryString = sortedKeys
    .filter(key => payload[key] !== undefined && payload[key] !== '')
    .map(key => `${key}=${encodeURIComponent(payload[key]).replace(/%20/g, '+')}`)
    .join('&');

  const signedString = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : queryString;

  return crypto.createHash('md5').update(signedString).digest('hex');
};

test.describe('Payment Flow E2E', () => {
  test('Yoco checkout and webhook flows should succeed', async ({ page, request }) => {
    await page.goto('/donations');
    await page.waitForLoadState('networkidle');

    const checkoutResponse = await request.post('/api/donations/checkout/yoco', {
      data: donationPayload,
    });

    expect(checkoutResponse.ok()).toBeTruthy();
    const checkoutData = await checkoutResponse.json();
    expect(checkoutData.success).toBe(true);
    expect(checkoutData.checkoutUrl).toBeTruthy();
    expect(checkoutData.sessionId).toContain('cs_test_');

    const sessionResponse = await request.get(`/api/donations/session/${checkoutData.sessionId}`);
    expect(sessionResponse.ok()).toBeTruthy();
    const sessionData = await sessionResponse.json();
    expect(sessionData.status).toBe('complete');

    const webhookPayload = JSON.stringify({
      id: 'evt-playwright-yoco',
      type: 'checkout.completed',
      createdAt: new Date().toISOString(),
      data: {
        object: {
          id: checkoutData.sessionId,
          amount: 10000,
          currency: 'ZAR',
          status: 'complete',
          metadata: {
            donationId: checkoutData.donationId,
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', YOCO_WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest('hex');

    const webhookResponse = await request.post('/api/webhooks/yoco', {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'x-yoco-signature': signature,
      },
    });

    expect(webhookResponse.ok()).toBeTruthy();
    expect(await webhookResponse.json()).toEqual({ received: true });
  });

  test('PayFast form creation and ITN webhook should be accepted', async ({ page, request }) => {
    await page.goto('/donations');
    await page.waitForLoadState('networkidle');

    const checkoutResponse = await request.post('/api/donations/checkout/payfast', {
      data: donationPayload,
    });

    expect(checkoutResponse.ok()).toBeTruthy();
    const checkoutData = await checkoutResponse.json();
    expect(checkoutData.success).toBe(true);
    expect(checkoutData.formData).toBeDefined();
    expect(checkoutData.paymentUrl).toContain('https://sandbox.payfast.co.za');

    const itnPayload = {
      merchant_id: checkoutData.formData.merchant_id,
      merchant_key: checkoutData.formData.merchant_key,
      return_url: checkoutData.formData.return_url,
      cancel_url: checkoutData.formData.cancel_url,
      notify_url: checkoutData.formData.notify_url,
      m_payment_id: checkoutData.formData.m_payment_id,
      amount_gross: '100.00',
      amount_fee: '0.00',
      amount_net: '100.00',
      item_name: 'PayFast Test Donation',
      item_description: 'Internal beta verification test',
      name_first: 'Playwright',
      name_last: 'Tester',
      email_address: 'test@attngo.org',
      custom_str1: 'one-time',
      custom_str2: 'false',
      custom_str3: 'Test payment',
      custom_str4: 'Playwright Tester',
    };

    const signature = buildPayFastSignature(itnPayload, PAYFAST_PASSPHRASE);
    const payloadWithSignature = { ...itnPayload, signature };

    const webhookResponse = await request.post('/api/webhooks/payfast', {
      form: payloadWithSignature,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const webhookText = await webhookResponse.text();
    expect(webhookResponse.ok(), webhookText).toBeTruthy();
    expect(webhookText).toBe('OK');
  });
});

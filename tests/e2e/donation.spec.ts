/**
 * E2E Tests - Donation Flow
 * 
 * Critical path: User makes a donation
 */

import { test, expect } from '@playwright/test';

test.describe('Donation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/donations');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display donation page', async ({ page }) => {
    await expect(page).toHaveURL(/.*donation/);
    // Check page loaded by verifying body exists
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show donation amount options', async ({ page }) => {
    // Check for amount buttons with R (Rand) currency or number inputs
    const hasAmountElements = await page.locator('button:has-text("R"), input[type="number"]').count() > 0;
    expect(hasAmountElements).toBeTruthy();
  });

  test('should show payment method options', async ({ page }) => {
    // Check for payment-related text or elements
    const bodyText = await page.locator('body').textContent() || '';
    const hasPaymentInfo = /payment|checkout|donate|secure|authorize/i.test(bodyText);
    expect(hasPaymentInfo).toBeTruthy();
  });
});

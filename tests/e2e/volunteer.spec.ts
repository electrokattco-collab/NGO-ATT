/**
 * E2E Tests - Volunteer Application
 * 
 * Critical path: User applies to volunteer
 */

import { test, expect } from '@playwright/test';

test.describe('Volunteer Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/volunteer');
    // Wait for form to be ready
    await page.waitForSelector('form, input, textarea', { timeout: 10000 });
  });

  test('should display volunteer page', async ({ page }) => {
    await expect(page).toHaveURL(/.*volunteer/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display volunteer application form', async ({ page }) => {
    // Check for form fields
    const hasFormElements = await page.locator('input, textarea, form').count() > 0;
    expect(hasFormElements).toBeTruthy();
  });

  test('should submit volunteer application', async ({ page }) => {
    await page.locator('input[name="fullName"]').fill('Test Volunteer');
    await page.locator('input[name="email"]').fill('volunteer@test.com');
    await page.locator('input[name="phone"]').fill('0821234567');
    await page.locator('textarea[name="motivation"]').fill('I want to help make a difference in my community.');

    // Find and click submit
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      
      // Wait for response (success message or redirect)
      await page.waitForTimeout(2000);
      
      // Check for success indicator
      const bodyText = await page.locator('body').textContent() || '';
      const hasSuccess = /sent|thank|received|success|submitted/i.test(bodyText);
      expect(hasSuccess).toBeTruthy();
    }
  });
});

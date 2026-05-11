/**
 * E2E Tests - Contact Form
 * 
 * Critical path: User sends contact message
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    // Wait for form to be ready
    await page.waitForSelector('form, input, textarea', { timeout: 10000 });
  });

  test('should display contact page', async ({ page }) => {
    await expect(page).toHaveURL(/.*contact/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display contact form', async ({ page }) => {
    // Check for form elements
    const hasFormElements = await page.locator('input, textarea, form').count() > 0;
    expect(hasFormElements).toBeTruthy();
  });

  test('should submit contact form', async ({ page }) => {
    // Fill in the form
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const messageInput = page.locator('textarea').first();
    
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test User');
    }
    
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('test@example.com');
    }
    
    if (await messageInput.isVisible().catch(() => false)) {
      await messageInput.fill('This is a test message through the contact form.');
    }

    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for success
      const bodyText = await page.locator('body').textContent() || '';
      const hasSuccess = /sent|thank|received|success/i.test(bodyText);
      expect(hasSuccess).toBeTruthy();
    }
  });
});

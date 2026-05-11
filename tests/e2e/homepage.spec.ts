/**
 * E2E Tests - Homepage
 */

import { test, expect } from '@playwright/test';

// Helper to wait for page to be ready
async function waitForPageReady(page) {
  await page.goto('/');
  // Wait for React to render - check for any interactive element
  await page.waitForFunction(() => {
    return document.querySelectorAll('nav, a, button').length > 0;
  }, { timeout: 15000 });
}

test.describe('Homepage', () => {
  
  test('should display homepage title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Awaken Thrive Transform|ATT NGO/);
  });

  test('should display main navigation', async ({ page }) => {
    await waitForPageReady(page);
    const navCount = await page.locator('nav').count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('should navigate to About page', async ({ page, isMobile }) => {
    await waitForPageReady(page);
    
    // If we are on mobile, open the hamburger menu first
    if (isMobile) {
      await page.locator('button[aria-label="Open menu"]').click();
      // Wait for mobile menu animation to complete
      await page.waitForTimeout(300);
    }
    
    // Click only the visible link (desktop or mobile)
    await page.locator('a[href="/about"]:visible').first().click();
    await expect(page).toHaveURL(/.*about/);
  });

  test('should navigate to Programs page', async ({ page, isMobile }) => {
    await waitForPageReady(page);
    
    if (isMobile) {
      await page.locator('button[aria-label="Open menu"]').click();
      await page.waitForTimeout(300);
    }
    
    await page.locator('a[href="/programs"]:visible').first().click();
    await expect(page).toHaveURL(/.*programs/);
  });

  test('should navigate to Donations page', async ({ page, isMobile }) => {
    await waitForPageReady(page);
    
    if (isMobile) {
      await page.locator('button[aria-label="Open menu"]').click();
      await page.waitForTimeout(300);
    }
    
    await page.locator('a[href="/donations"]:visible').first().click();
    await expect(page).toHaveURL(/.*donations/); 
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForPageReady(page);

    // Hamburger button must be visible on mobile
    const hamburgerBtn = page.locator('button[aria-label="Open menu"]');
    await expect(hamburgerBtn).toBeVisible();

    // Open the mobile menu
    await hamburgerBtn.click();
    await page.waitForTimeout(300);

    // Mobile menu container should appear
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();

    // Check that navigation links are visible on the page (not inside button)
    // Use :visible to target whichever version is currently showing, .first() to handle multiple matches
    const aboutLink = page.locator('a[href="/about"]:visible').first();
    await expect(aboutLink).toBeVisible();
    
    // Verify multiple mobile nav links are accessible
    await expect(page.locator('a[href="/programs"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/donations"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/volunteer"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/contact"]:visible').first()).toBeVisible();
  });
});

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> should be responsive on mobile
- Location: tests\e2e\homepage.spec.ts:68:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.setViewportSize: Test timeout of 30000ms exceeded.
```

# Test source

```ts
  1  | /**
  2  |  * E2E Tests - Homepage
  3  |  */
  4  | 
  5  | import { test, expect } from '@playwright/test';
  6  | 
  7  | // Helper to wait for page to be ready
  8  | async function waitForPageReady(page) {
  9  |   await page.goto('/');
  10 |   // Wait for React to render - check for any interactive element
  11 |   await page.waitForFunction(() => {
  12 |     return document.querySelectorAll('nav, a, button').length > 0;
  13 |   }, { timeout: 15000 });
  14 | }
  15 | 
  16 | test.describe('Homepage', () => {
  17 |   
  18 |   test('should display homepage title', async ({ page }) => {
  19 |     await page.goto('/');
  20 |     await expect(page).toHaveTitle(/Awaken Thrive Transform|ATT NGO/);
  21 |   });
  22 | 
  23 |   test('should display main navigation', async ({ page }) => {
  24 |     await waitForPageReady(page);
  25 |     const navCount = await page.locator('nav').count();
  26 |     expect(navCount).toBeGreaterThan(0);
  27 |   });
  28 | 
  29 |   test('should navigate to About page', async ({ page, isMobile }) => {
  30 |     await waitForPageReady(page);
  31 |     
  32 |     // If we are on mobile, open the hamburger menu first
  33 |     if (isMobile) {
  34 |       await page.locator('button[aria-label="Open menu"]').click();
  35 |       // Wait for mobile menu animation to complete
  36 |       await page.waitForTimeout(300);
  37 |     }
  38 |     
  39 |     // Click only the visible link (desktop or mobile)
  40 |     await page.locator('a[href="/about"]:visible').first().click();
  41 |     await expect(page).toHaveURL(/.*about/);
  42 |   });
  43 | 
  44 |   test('should navigate to Programs page', async ({ page, isMobile }) => {
  45 |     await waitForPageReady(page);
  46 |     
  47 |     if (isMobile) {
  48 |       await page.locator('button[aria-label="Open menu"]').click();
  49 |       await page.waitForTimeout(300);
  50 |     }
  51 |     
  52 |     await page.locator('a[href="/programs"]:visible').first().click();
  53 |     await expect(page).toHaveURL(/.*programs/);
  54 |   });
  55 | 
  56 |   test('should navigate to Donations page', async ({ page, isMobile }) => {
  57 |     await waitForPageReady(page);
  58 |     
  59 |     if (isMobile) {
  60 |       await page.locator('button[aria-label="Open menu"]').click();
  61 |       await page.waitForTimeout(300);
  62 |     }
  63 |     
  64 |     await page.locator('a[href="/donations"]:visible').first().click();
  65 |     await expect(page).toHaveURL(/.*donations/); 
  66 |   });
  67 | 
  68 |   test('should be responsive on mobile', async ({ page }) => {
> 69 |     await page.setViewportSize({ width: 375, height: 667 });
     |                ^ Error: page.setViewportSize: Test timeout of 30000ms exceeded.
  70 |     await waitForPageReady(page);
  71 | 
  72 |     // Hamburger button must be visible on mobile
  73 |     const hamburgerBtn = page.locator('button[aria-label="Open menu"]');
  74 |     await expect(hamburgerBtn).toBeVisible();
  75 | 
  76 |     // Open the mobile menu
  77 |     await hamburgerBtn.click();
  78 |     await page.waitForTimeout(300);
  79 | 
  80 |     // Mobile menu container should appear
  81 |     const mobileMenu = page.locator('[data-testid="mobile-menu"]');
  82 |     await expect(mobileMenu).toBeVisible();
  83 | 
  84 |     // Check that navigation links are visible on the page (not inside button)
  85 |     // Use :visible to target whichever version is currently showing, .first() to handle multiple matches
  86 |     const aboutLink = page.locator('a[href="/about"]:visible').first();
  87 |     await expect(aboutLink).toBeVisible();
  88 |     
  89 |     // Verify multiple mobile nav links are accessible
  90 |     await expect(page.locator('a[href="/programs"]:visible').first()).toBeVisible();
  91 |     await expect(page.locator('a[href="/donations"]:visible').first()).toBeVisible();
  92 |     await expect(page.locator('a[href="/volunteer"]:visible').first()).toBeVisible();
  93 |     await expect(page.locator('a[href="/contact"]:visible').first()).toBeVisible();
  94 |   });
  95 | });
  96 | 
```
/**
 * Debug Test - Diagnose Rendering Issues
 */

import { test, expect } from '@playwright/test';

test.describe('Debug - Page Rendering', () => {
  
  test('debug homepage HTML', async ({ page }) => {
    await page.goto('/');
    
    // Wait a bit for React to render
    await page.waitForTimeout(2000);
    
    // Get the full HTML
    const html = await page.content();
    
    // Log key info
    console.log('=== PAGE TITLE ===');
    console.log(await page.title());
    
    console.log('=== BODY CLASSES ===');
    const bodyClass = await page.locator('body').getAttribute('class');
    console.log(bodyClass);
    
    console.log('=== ROOT CONTENT (first 500 chars) ===');
    const rootHtml = await page.locator('#root').innerHTML().catch(() => 'NO #root FOUND');
    console.log(rootHtml.substring(0, 500));
    
    console.log('=== NAV ELEMENT ===');
    const navExists = await page.locator('nav').count();
    console.log(`Nav elements found: ${navExists}`);
    
    console.log('=== ALL TEXT (first 300 chars) ===');
    const bodyText = await page.locator('body').textContent();
    console.log(bodyText?.substring(0, 300));
    
    // Check if we're getting the Vite dev server HTML
    expect(html).toContain('script');
  });

  test('debug navigation to About', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Try to find and click About link
    const aboutLink = page.locator('a[href="/about"], a:has-text("About")').first();
    
    console.log('=== ABOUT LINK FOUND ===');
    console.log(await aboutLink.count());
    
    if (await aboutLink.isVisible().catch(() => false)) {
      console.log('Clicking About link...');
      await aboutLink.click();
      
      // Wait for navigation
      await page.waitForTimeout(2000);
      
      console.log('=== CURRENT URL ===');
      console.log(page.url());
      
      console.log('=== ABOUT PAGE CONTENT (first 500 chars) ===');
      const content = await page.locator('body').innerHTML();
      console.log(content.substring(0, 500));
    }
    
    expect(true).toBe(true);
  });

  test('check Firebase initialization', async ({ page }) => {
    await page.goto('/');
    
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('=== CONSOLE ERRORS ===');
    errors.forEach(err => console.log(err));
    
    // Check if there are any script errors that might prevent rendering
    const hasFirebaseError = errors.some(e => e.includes('firebase') || e.includes('Firebase'));
    console.log(`Firebase errors: ${hasFirebaseError}`);
    
    expect(true).toBe(true);
  });

  test('check hydration', async ({ page }) => {
    await page.goto('/');
    
    // Check if React has hydrated by looking for event listeners
    const isHydrated = await page.evaluate(() => {
      // React adds data-reactroot or data-reactid attributes
      const hasReactRoot = document.querySelector('[data-reactroot], [data-reactid]') !== null;
      // Or check if there are click handlers
      const links = document.querySelectorAll('a');
      let hasListeners = false;
      // @ts-ignore
      const reactKey = Object.keys(document.querySelector('body') || {}).find(key => key.startsWith('__react'));
      return { hasReactRoot, reactKey };
    });
    
    console.log('=== HYDRATION STATUS ===');
    console.log(isHydrated);
    
    expect(true).toBe(true);
  });
});

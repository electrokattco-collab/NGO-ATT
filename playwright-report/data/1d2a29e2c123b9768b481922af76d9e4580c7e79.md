# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> should display main navigation
- Location: tests\e2e\homepage.spec.ts:23:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - link "ATT NGO" [ref=e6] [cursor=pointer]:
        - /url: /
        - generic [ref=e9]: ATT NGO
      - generic [ref=e10]:
        - link "Home" [ref=e11] [cursor=pointer]:
          - /url: /
        - link "About" [ref=e12] [cursor=pointer]:
          - /url: /about
        - link "Programs" [ref=e13] [cursor=pointer]:
          - /url: /programs
        - link "Volunteer" [ref=e14] [cursor=pointer]:
          - /url: /volunteer
        - link "Donations" [ref=e15] [cursor=pointer]:
          - /url: /donations
        - link "Contact" [ref=e16] [cursor=pointer]:
          - /url: /contact
        - button "Access" [ref=e18]
        - link "Donate" [ref=e19] [cursor=pointer]:
          - /url: /donations
          - button "Donate" [ref=e20]
  - main [ref=e21]:
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]: Operational Directive 2026
            - generic [ref=e29]: "NPO: IT000123/2026"
          - heading "Awaken. Thrive. Transform." [level=1] [ref=e30]:
            - text: Awaken.
            - text: Thrive.
            - text: Transform.
          - paragraph [ref=e31]: Engineering high-resilience mental wellness ecosystems for South African learners. We bridge the clinical gap between trauma and potential.
          - generic [ref=e32]:
            - link "Join the Mission" [ref=e33] [cursor=pointer]:
              - /url: /volunteer
              - button "Join the Mission" [ref=e34]:
                - text: Join the Mission
                - img [ref=e35]
            - link "Explore Strategy" [ref=e38] [cursor=pointer]:
              - /url: /about
              - button "Explore Strategy" [ref=e39]:
                - img [ref=e41]
                - text: Explore Strategy
        - generic [ref=e44]:
          - generic [ref=e46]:
            - generic [ref=e47]:
              - img [ref=e48]
              - paragraph [ref=e50]: Trust Metrics
            - paragraph [ref=e51]: System validated by 42 school districts. 98% intervention success rate in mental resilience cohorts.
          - img "Impact" [ref=e53]
      - generic [ref=e56]:
        - generic [ref=e57]:
          - img [ref=e59]
          - generic [ref=e61]:
            - generic [ref=e62]: 15,000+
            - generic [ref=e63]: Learners Supported
            - paragraph [ref=e64]: Direct mental wellness interventions.
        - generic [ref=e65]:
          - img [ref=e67]
          - generic [ref=e71]:
            - generic [ref=e72]: 120+
            - generic [ref=e73]: Scale Factor
            - paragraph [ref=e74]: Partnering schools across 3 provinces.
        - generic [ref=e75]:
          - img [ref=e77]
          - generic [ref=e79]:
            - generic [ref=e80]: 85+
            - generic [ref=e81]: Strategic Partners
            - paragraph [ref=e82]: High-impact corporate & local sponsors.
        - generic [ref=e83]:
          - img [ref=e85]
          - generic [ref=e90]:
            - generic [ref=e91]: 2.5k
            - generic [ref=e92]: Corps Strength
            - paragraph [ref=e93]: Mobilized volunteers in the field.
      - generic [ref=e95]:
        - generic [ref=e96]:
          - generic [ref=e97]:
            - generic [ref=e98]: The Problem Statement
            - heading "A Quiet Crisis. A Strategic Response." [level=2] [ref=e99]:
              - text: A Quiet Crisis.
              - text: A Strategic Response.
            - paragraph [ref=e100]: In South Africa, 75% of youth requiring mental health support do not receive it. ATT NGO deploys targeted interventions directly into the learning ecosystem to reverse this vector.
          - generic [ref=e101]:
            - generic [ref=e102]:
              - img [ref=e104]
              - heading "Clinical Precision" [level=4] [ref=e106]
              - paragraph [ref=e107]: Protocol-driven support cohorts.
            - generic [ref=e108]:
              - img [ref=e110]
              - heading "Community Trust" [level=4] [ref=e112]
              - paragraph [ref=e113]: Indigenous-led delivery systems.
          - link "Examine our blueprints" [ref=e115] [cursor=pointer]:
            - /url: /programs
            - button "Examine our blueprints" [ref=e116]
        - img "Mission" [ref=e119]
      - generic [ref=e122]:
        - generic [ref=e123]:
          - generic [ref=e124]:
            - generic [ref=e125]: Corps Deployment
            - heading "Become a Strategic Ally." [level=3] [ref=e126]:
              - text: Become a
              - text: Strategic Ally.
            - paragraph [ref=e127]: Join our field operators in delivering critical care to underprivileged cohorts.
            - link "Apply Now" [ref=e128] [cursor=pointer]:
              - /url: /volunteer
              - button "Apply Now" [ref=e129]
          - img [ref=e131]
        - generic [ref=e136]:
          - generic [ref=e137]:
            - generic [ref=e138]: Capital Infusion
            - heading "Invest in Strategic Future." [level=3] [ref=e139]:
              - text: Invest in
              - text: Strategic Future.
            - paragraph [ref=e140]: Scalable funding models for long-term clinical interventions and school programs.
            - link "Donate Capital" [ref=e141] [cursor=pointer]:
              - /url: /donations
              - button "Donate Capital" [ref=e142]
          - img [ref=e144]
  - contentinfo [ref=e146]:
    - generic [ref=e147]:
      - generic [ref=e148]:
        - generic [ref=e149]:
          - img [ref=e151]
          - generic [ref=e153]: ATT NGO
        - paragraph [ref=e154]:
          - text: "\"Awaken. Thrive. Transform.\""
          - text: Empowering South African learners through mental wellness initiatives and strategic community engagement.
        - generic [ref=e155]:
          - img [ref=e156] [cursor=pointer]
          - img [ref=e158] [cursor=pointer]
          - img [ref=e162] [cursor=pointer]
      - generic [ref=e164]:
        - paragraph [ref=e165]: Quick Links
        - list [ref=e166]:
          - listitem [ref=e167]:
            - link "Home" [ref=e168] [cursor=pointer]:
              - /url: /
          - listitem [ref=e169]:
            - link "About" [ref=e170] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e171]:
            - link "Programs" [ref=e172] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e173]:
            - link "Volunteer" [ref=e174] [cursor=pointer]:
              - /url: /volunteer
          - listitem [ref=e175]:
            - link "Donations" [ref=e176] [cursor=pointer]:
              - /url: /donations
          - listitem [ref=e177]:
            - link "Contact" [ref=e178] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e179]:
        - paragraph [ref=e180]: Intelligence
        - list [ref=e181]:
          - listitem [ref=e182]:
            - link "Mental Wellness" [ref=e183] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e184]:
            - link "Clinical Interventions" [ref=e185] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e186]:
            - link "Educator Empowerment" [ref=e187] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e188]:
            - link "Resource Logistics" [ref=e189] [cursor=pointer]:
              - /url: /programs
      - generic [ref=e190]:
        - paragraph [ref=e191]: Transmissions
        - paragraph [ref=e192]: Join our strategic distribution list for cohort updates.
        - generic [ref=e193]:
          - textbox "Email address" [ref=e194]
          - button [ref=e195]:
            - img [ref=e196]
    - paragraph [ref=e199]:
      - text: © 2026 Awaken Thrive Transform NGO. Operational data encrypted.
      - text: "NPO Reg: IT000123/2026/ZA"
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
> 11 |   await page.waitForFunction(() => {
     |              ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
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
  69 |     await page.setViewportSize({ width: 375, height: 667 });
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
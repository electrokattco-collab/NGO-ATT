# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: volunteer.spec.ts >> Volunteer Application >> should submit volunteer application
- Location: tests\e2e\volunteer.spec.ts:27:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: Join the Cohort
          - heading "Deploy Your Skills for Good." [level=1] [ref=e28]:
            - text: Deploy Your
            - text: Skills for Good.
          - paragraph [ref=e29]: We require dedicated professionals and community members to scale our mental health interventions.
        - generic [ref=e30]:
          - generic [ref=e33]: Resource Logistics
          - generic [ref=e36]: Clinical Support assistant
          - generic [ref=e39]: Community Navigator
          - generic [ref=e42]: Technical Operations
        - generic [ref=e43]: VOLUNTEER
      - generic [ref=e45]:
        - heading "Operational Intake Form" [level=2] [ref=e47]
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]:
              - text: Full Name
              - textbox "e.g. Thandiwe Zulu" [active] [ref=e52]
            - generic [ref=e53]:
              - text: Digital Contact (Email)
              - textbox "name@provider.com" [ref=e54]: volunteer@test.com
          - generic [ref=e55]:
            - generic [ref=e56]:
              - text: Phone Number
              - textbox "+27 (0) 12 345 6789" [ref=e57]
            - generic [ref=e58]:
              - text: Operational Role
              - combobox [ref=e59]:
                - option "Select Capacity" [selected]
                - option "Weekdays (Full Capacity)"
                - option "Weekends Only"
                - option "Flexible / Remote"
          - generic [ref=e60]:
            - text: Specialized Skillset
            - textbox "e.g. Clinical Social Work, Web Architecture, Data Entry" [ref=e61]
          - generic [ref=e62]:
            - text: Strategic Motivation
            - textbox "Briefly state why you wish to join this clinical mission..." [ref=e63]: I want to help make a difference in my community.
          - button "Submit Strategic Profile" [ref=e64]:
            - generic [ref=e65]: Submit Strategic Profile
  - contentinfo [ref=e66]:
    - generic [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]:
          - img [ref=e71]
          - generic [ref=e73]: ATT NGO
        - paragraph [ref=e74]:
          - text: "\"Awaken. Thrive. Transform.\""
          - text: Empowering South African learners through mental wellness initiatives and strategic community engagement.
        - generic [ref=e75]:
          - img [ref=e76] [cursor=pointer]
          - img [ref=e78] [cursor=pointer]
          - img [ref=e81] [cursor=pointer]
      - generic [ref=e83]:
        - paragraph [ref=e84]: Quick Links
        - list [ref=e85]:
          - listitem [ref=e86]:
            - link "Home" [ref=e87] [cursor=pointer]:
              - /url: /
          - listitem [ref=e88]:
            - link "About" [ref=e89] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e90]:
            - link "Programs" [ref=e91] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e92]:
            - link "Volunteer" [ref=e93] [cursor=pointer]:
              - /url: /volunteer
          - listitem [ref=e94]:
            - link "Donations" [ref=e95] [cursor=pointer]:
              - /url: /donations
          - listitem [ref=e96]:
            - link "Contact" [ref=e97] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e98]:
        - paragraph [ref=e99]: Intelligence
        - list [ref=e100]:
          - listitem [ref=e101]:
            - link "Mental Wellness" [ref=e102] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e103]:
            - link "Clinical Interventions" [ref=e104] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e105]:
            - link "Educator Empowerment" [ref=e106] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e107]:
            - link "Resource Logistics" [ref=e108] [cursor=pointer]:
              - /url: /programs
      - generic [ref=e109]:
        - paragraph [ref=e110]: Transmissions
        - paragraph [ref=e111]: Join our strategic distribution list for cohort updates.
        - generic [ref=e112]:
          - textbox "Email address" [ref=e113]
          - button [ref=e114]:
            - img [ref=e115]
    - paragraph [ref=e118]:
      - text: © 2026 Awaken Thrive Transform NGO. Operational data encrypted.
      - text: "NPO Reg: IT000123/2026/ZA"
```

# Test source

```ts
  1  | /**
  2  |  * E2E Tests - Volunteer Application
  3  |  * 
  4  |  * Critical path: User applies to volunteer
  5  |  */
  6  | 
  7  | import { test, expect } from '@playwright/test';
  8  | 
  9  | test.describe('Volunteer Application', () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await page.goto('/volunteer');
  12 |     // Wait for form to be ready
  13 |     await page.waitForSelector('form, input, textarea', { timeout: 10000 });
  14 |   });
  15 | 
  16 |   test('should display volunteer page', async ({ page }) => {
  17 |     await expect(page).toHaveURL(/.*volunteer/);
  18 |     await expect(page.locator('body')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should display volunteer application form', async ({ page }) => {
  22 |     // Check for form fields
  23 |     const hasFormElements = await page.locator('input, textarea, form').count() > 0;
  24 |     expect(hasFormElements).toBeTruthy();
  25 |   });
  26 | 
  27 |   test('should submit volunteer application', async ({ page }) => {
  28 |     // Fill in the form fields if they exist
  29 |     const nameInput = page.locator('input[type="text"]').first();
  30 |     const emailInput = page.locator('input[type="email"]').first();
  31 |     const motivationInput = page.locator('textarea').first();
  32 |     
  33 |     if (await nameInput.isVisible().catch(() => false)) {
  34 |       await nameInput.fill('Test Volunteer');
  35 |     }
  36 |     
  37 |     if (await emailInput.isVisible().catch(() => false)) {
  38 |       await emailInput.fill('volunteer@test.com');
  39 |     }
  40 |     
  41 |     if (await motivationInput.isVisible().catch(() => false)) {
  42 |       await motivationInput.fill('I want to help make a difference in my community.');
  43 |     }
  44 | 
  45 |     // Find and click submit
  46 |     const submitButton = page.locator('button[type="submit"]').first();
  47 |     
  48 |     if (await submitButton.isVisible().catch(() => false)) {
  49 |       await submitButton.click();
  50 |       
  51 |       // Wait for response (success message or redirect)
  52 |       await page.waitForTimeout(2000);
  53 |       
  54 |       // Check for success indicator
  55 |       const bodyText = await page.locator('body').textContent() || '';
  56 |       const hasSuccess = /sent|thank|received|success|submitted/i.test(bodyText);
> 57 |       expect(hasSuccess).toBeTruthy();
     |                          ^ Error: expect(received).toBeTruthy()
  58 |     }
  59 |   });
  60 | });
  61 | 
```
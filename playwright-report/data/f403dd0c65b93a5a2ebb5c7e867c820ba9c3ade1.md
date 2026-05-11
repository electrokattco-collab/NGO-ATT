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
- generic [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - link "ATT NGO" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e9]: ATT NGO
        - button "Open menu" [ref=e10]:
          - img [ref=e11]
    - main [ref=e12]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: Join the Cohort
            - heading "Deploy Your Skills for Good." [level=1] [ref=e19]:
              - text: Deploy Your
              - text: Skills for Good.
            - paragraph [ref=e20]: We require dedicated professionals and community members to scale our mental health interventions.
          - generic [ref=e21]:
            - generic [ref=e24]: Resource Logistics
            - generic [ref=e27]: Clinical Support assistant
            - generic [ref=e30]: Community Navigator
            - generic [ref=e33]: Technical Operations
          - generic [ref=e34]: VOLUNTEER
        - generic [ref=e36]:
          - heading "Operational Intake Form" [level=2] [ref=e38]
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]:
                - text: Full Name
                - textbox "e.g. Thandiwe Zulu" [active] [ref=e43]
              - generic [ref=e44]:
                - text: Digital Contact (Email)
                - textbox "name@provider.com" [ref=e45]: volunteer@test.com
            - generic [ref=e46]:
              - generic [ref=e47]:
                - text: Phone Number
                - textbox "+27 (0) 12 345 6789" [ref=e48]
              - generic [ref=e49]:
                - text: Operational Role
                - combobox [ref=e50]:
                  - option "Select Capacity" [selected]
                  - option "Weekdays (Full Capacity)"
                  - option "Weekends Only"
                  - option "Flexible / Remote"
            - generic [ref=e51]:
              - text: Specialized Skillset
              - textbox "e.g. Clinical Social Work, Web Architecture, Data Entry" [ref=e52]
            - generic [ref=e53]:
              - text: Strategic Motivation
              - textbox "Briefly state why you wish to join this clinical mission..." [ref=e54]: I want to help make a difference in my community.
            - button "Submit Strategic Profile" [ref=e55]:
              - generic [ref=e56]: Submit Strategic Profile
    - contentinfo [ref=e57]:
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - img [ref=e62]
            - generic [ref=e64]: ATT NGO
          - paragraph [ref=e65]:
            - text: "\"Awaken. Thrive. Transform.\""
            - text: Empowering South African learners through mental wellness initiatives and strategic community engagement.
          - generic [ref=e66]:
            - img [ref=e67] [cursor=pointer]
            - img [ref=e69] [cursor=pointer]
            - img [ref=e72] [cursor=pointer]
        - generic [ref=e74]:
          - paragraph [ref=e75]: Quick Links
          - list [ref=e76]:
            - listitem [ref=e77]:
              - link "Home" [ref=e78] [cursor=pointer]:
                - /url: /
            - listitem [ref=e79]:
              - link "About" [ref=e80] [cursor=pointer]:
                - /url: /about
            - listitem [ref=e81]:
              - link "Programs" [ref=e82] [cursor=pointer]:
                - /url: /programs
            - listitem [ref=e83]:
              - link "Volunteer" [ref=e84] [cursor=pointer]:
                - /url: /volunteer
            - listitem [ref=e85]:
              - link "Donations" [ref=e86] [cursor=pointer]:
                - /url: /donations
            - listitem [ref=e87]:
              - link "Contact" [ref=e88] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e89]:
          - paragraph [ref=e90]: Intelligence
          - list [ref=e91]:
            - listitem [ref=e92]:
              - link "Mental Wellness" [ref=e93] [cursor=pointer]:
                - /url: /programs
            - listitem [ref=e94]:
              - link "Clinical Interventions" [ref=e95] [cursor=pointer]:
                - /url: /programs
            - listitem [ref=e96]:
              - link "Educator Empowerment" [ref=e97] [cursor=pointer]:
                - /url: /programs
            - listitem [ref=e98]:
              - link "Resource Logistics" [ref=e99] [cursor=pointer]:
                - /url: /programs
        - generic [ref=e100]:
          - paragraph [ref=e101]: Transmissions
          - paragraph [ref=e102]: Join our strategic distribution list for cohort updates.
          - generic [ref=e103]:
            - textbox "Email address" [ref=e104]
            - button [ref=e105]:
              - img [ref=e106]
      - paragraph [ref=e109]:
        - text: © 2026 Awaken Thrive Transform NGO. Operational data encrypted.
        - text: "NPO Reg: IT000123/2026/ZA"
  - iframe [ref=e110]:
    
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
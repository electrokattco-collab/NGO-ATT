# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact.spec.ts >> Contact Form >> should submit contact form
- Location: tests\e2e\contact.spec.ts:27:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('form, input, textarea') to be visible
    - locator resolved to 7 elements. Proceeding with the first one: <form class="space-y-8">…</form>

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
      - generic [ref=e25]:
        - generic [ref=e26]: Communications Hub
        - heading "Open Channels." [level=1] [ref=e27]
        - paragraph [ref=e28]: Have a strategic inquiry or want to support our mission? We prioritize high-impact collaborations.
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - heading "Institutional Registry" [level=2] [ref=e35]
            - generic [ref=e37]:
              - generic [ref=e38]:
                - generic [ref=e39]:
                  - img [ref=e40]
                  - generic [ref=e43]: Headquarters
                - paragraph [ref=e44]: 123 Community Lane, Sandton, Johannesburg, 2196
              - generic [ref=e45]:
                - generic [ref=e46]:
                  - img [ref=e47]
                  - generic [ref=e49]: Direct Line
                - paragraph [ref=e50]: +27 11 456 7890
              - generic [ref=e51]:
                - generic [ref=e52]:
                  - img [ref=e53]
                  - generic [ref=e56]: Operational Email
                - paragraph [ref=e57]: info@att-ngo.org.za
          - iframe [ref=e60]:
            - link "Open in Maps (opens in new tab)" [ref=f1e4] [cursor=pointer]:
              - /url: about:invalid#zClosurez
              - text: Open in Maps
              - img [ref=f1e6]
        - generic [ref=e62]:
          - heading "Transmission Form" [level=3] [ref=e64]
          - generic [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e68]:
                - text: Sender Identifying Name
                - textbox "e.g. Thandiwe Zulu" [ref=e69]
              - generic [ref=e70]:
                - text: Return Digital Address
                - textbox "name@organization.com" [ref=e71]
            - generic [ref=e72]:
              - text: Subject Classification
              - textbox "e.g. Partnership Opportunity" [ref=e73]
            - generic [ref=e74]:
              - text: Inquiry Context
              - textbox "Discuss the details of your inquiry here..." [ref=e75]
            - button "Transmit Message" [ref=e76]:
              - generic [ref=e77]: Transmit Message
      - generic [ref=e79]:
        - generic [ref=e80]:
          - generic [ref=e81]: Knowledge base
          - heading "Intelligence Repository" [level=2] [ref=e82]
        - generic [ref=e83]:
          - generic [ref=e84]:
            - heading "How can a school partner with ATT NGO?" [level=4] [ref=e85]
            - paragraph [ref=e86]: Simply fill out the contact form or email our partnerships team at partnerships@att-ngo.org.za and we will arrange an introductory presentation.
          - generic [ref=e87]:
            - heading "Are donations tax-deductible?" [level=4] [ref=e88]
            - paragraph [ref=e89]: Yes, we are a registered NPO/PBO and can provide section 18A tax certificates for all donations above R500.
          - generic [ref=e90]:
            - heading "Do you offer individual counselling?" [level=4] [ref=e91]
            - paragraph [ref=e92]: Our primary focus is group interventions and community workshops, but we do provide referrals to partner clinics for individual clinical cases.
  - contentinfo [ref=e93]:
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic [ref=e96]:
          - img [ref=e98]
          - generic [ref=e100]: ATT NGO
        - paragraph [ref=e101]:
          - text: "\"Awaken. Thrive. Transform.\""
          - text: Empowering South African learners through mental wellness initiatives and strategic community engagement.
        - generic [ref=e102]:
          - img [ref=e103] [cursor=pointer]
          - img [ref=e105] [cursor=pointer]
          - img [ref=e109] [cursor=pointer]
      - generic [ref=e111]:
        - paragraph [ref=e112]: Quick Links
        - list [ref=e113]:
          - listitem [ref=e114]:
            - link "Home" [ref=e115] [cursor=pointer]:
              - /url: /
          - listitem [ref=e116]:
            - link "About" [ref=e117] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e118]:
            - link "Programs" [ref=e119] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e120]:
            - link "Volunteer" [ref=e121] [cursor=pointer]:
              - /url: /volunteer
          - listitem [ref=e122]:
            - link "Donations" [ref=e123] [cursor=pointer]:
              - /url: /donations
          - listitem [ref=e124]:
            - link "Contact" [ref=e125] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e126]:
        - paragraph [ref=e127]: Intelligence
        - list [ref=e128]:
          - listitem [ref=e129]:
            - link "Mental Wellness" [ref=e130] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e131]:
            - link "Clinical Interventions" [ref=e132] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e133]:
            - link "Educator Empowerment" [ref=e134] [cursor=pointer]:
              - /url: /programs
          - listitem [ref=e135]:
            - link "Resource Logistics" [ref=e136] [cursor=pointer]:
              - /url: /programs
      - generic [ref=e137]:
        - paragraph [ref=e138]: Transmissions
        - paragraph [ref=e139]: Join our strategic distribution list for cohort updates.
        - generic [ref=e140]:
          - textbox "Email address" [ref=e141]
          - button [ref=e142]:
            - img [ref=e143]
    - paragraph [ref=e146]:
      - text: © 2026 Awaken Thrive Transform NGO. Operational data encrypted.
      - text: "NPO Reg: IT000123/2026/ZA"
```

# Test source

```ts
  1  | /**
  2  |  * E2E Tests - Contact Form
  3  |  * 
  4  |  * Critical path: User sends contact message
  5  |  */
  6  | 
  7  | import { test, expect } from '@playwright/test';
  8  | 
  9  | test.describe('Contact Form', () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await page.goto('/contact');
  12 |     // Wait for form to be ready
> 13 |     await page.waitForSelector('form, input, textarea', { timeout: 10000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  14 |   });
  15 | 
  16 |   test('should display contact page', async ({ page }) => {
  17 |     await expect(page).toHaveURL(/.*contact/);
  18 |     await expect(page.locator('body')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should display contact form', async ({ page }) => {
  22 |     // Check for form elements
  23 |     const hasFormElements = await page.locator('input, textarea, form').count() > 0;
  24 |     expect(hasFormElements).toBeTruthy();
  25 |   });
  26 | 
  27 |   test('should submit contact form', async ({ page }) => {
  28 |     // Fill in the form
  29 |     const nameInput = page.locator('input[type="text"]').first();
  30 |     const emailInput = page.locator('input[type="email"]').first();
  31 |     const messageInput = page.locator('textarea').first();
  32 |     
  33 |     if (await nameInput.isVisible().catch(() => false)) {
  34 |       await nameInput.fill('Test User');
  35 |     }
  36 |     
  37 |     if (await emailInput.isVisible().catch(() => false)) {
  38 |       await emailInput.fill('test@example.com');
  39 |     }
  40 |     
  41 |     if (await messageInput.isVisible().catch(() => false)) {
  42 |       await messageInput.fill('This is a test message through the contact form.');
  43 |     }
  44 | 
  45 |     const submitButton = page.locator('button[type="submit"]').first();
  46 |     
  47 |     if (await submitButton.isVisible().catch(() => false)) {
  48 |       await submitButton.click();
  49 |       
  50 |       // Wait for response
  51 |       await page.waitForTimeout(2000);
  52 |       
  53 |       // Check for success
  54 |       const bodyText = await page.locator('body').textContent() || '';
  55 |       const hasSuccess = /sent|thank|received|success/i.test(bodyText);
  56 |       expect(hasSuccess).toBeTruthy();
  57 |     }
  58 |   });
  59 | });
  60 | 
```
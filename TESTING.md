# Testing Guide - ATT NGO Platform

This document describes the testing strategy and how to run tests for the ATT NGO Platform.

## Test Structure

```
tests/
├── rules/           # Firestore Security Rules tests
├── unit/            # Unit tests for services and utilities
├── integration/     # API integration tests
├── e2e/             # Playwright end-to-end tests
├── fixtures/        # Test data and fixtures
└── setup.ts         # Jest test setup
```

## Running Tests

### All Tests

```bash
npm test
```

### Firestore Security Rules Tests

Tests the "Dirty Dozen" attack vectors and role-based access control:

```bash
npm run test:rules
```

**What it tests:**
- Identity spoofing (creating profiles for other users)
- Elevated privilege (setting role to admin)
- Ghost fields (adding unauthorized fields)
- Invalid IDs (path traversal)
- Unauthorized blog edits
- Data injection (oversized strings)
- Immutability breach (changing createdAt)
- Private path leaks (reading other users' data)
- State shortcuts (self-approving volunteers)
- PII exposure (accessing other users' emails)
- Malicious queries (listing all donations)

### Unit Tests

Tests individual functions and services:

```bash
npm run test:unit
```

**Coverage:**
- Validation schemas (Zod)
- Email service
- Payment services (Yoco, PayFast)
- Utility functions

### Integration Tests

Tests API endpoints:

```bash
npm run test:integration
```

**Coverage:**
- Health endpoint
- Feature flags
- Contact form submission
- Volunteer application
- Error handling

### E2E Tests

Tests complete user flows with Playwright:

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

**Coverage:**
- Homepage navigation
- Donation flow
- Volunteer application
- Contact form submission

## Test Environments

### Test Environment Variables

Create a `.env.test` file for test-specific configuration:

```bash
NODE_ENV=test
ENABLE_PAYMENTS=false
ENABLE_EMAILS=false
FIREBASE_SERVICE_ACCOUNT={}
```

### Firebase Emulator

For Firestore rules tests, you may want to use the Firebase emulator:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Start emulator
firebase emulators:start --only firestore
```

## Writing Tests

### Firestore Rules Tests

```typescript
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

test('should reject user reading another user\'s profile', async () => {
  const userDb = testEnv.authenticatedContext('user-123').firestore();
  
  await expect(
    getDoc(doc(userDb, 'users', 'user-456'))
  ).toBeDenied();
});
```

### Unit Tests

```typescript
import { createDonationSchema } from '@/src/lib/validation.js';

test('should validate valid donation', () => {
  const result = createDonationSchema.safeParse({
    donorName: 'John',
    amount: 100,
    donationType: 'one-time',
  });
  
  expect(result.success).toBe(true);
});
```

### Integration Tests

```typescript
import request from 'supertest';

test('should create contact message', async () => {
  const response = await request(app)
    .post('/api/contact')
    .send({
      name: 'John',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Message content',
    })
    .expect(201);
  
  expect(response.body.success).toBe(true);
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('should complete donation flow', async ({ page }) => {
  await page.goto('/donations');
  await page.click('text=R100');
  await page.fill('input[name="name"]', 'Test');
  await page.click('button:has-text("Donate")');
  
  await expect(page).toHaveURL(/.*success/);
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
```

## Coverage

Generate coverage reports:

```bash
npm run test:coverage
```

Reports are generated in:
- `coverage/lcov-report/index.html` (HTML)
- `coverage/lcov.info` (LCOV for CI)

## Best Practices

1. **Test isolation**: Each test should be independent
2. **Mock external services**: Use mocks for Firebase, SendGrid, etc.
3. **Test the unhappy path**: Include validation and error cases
4. **Use descriptive names**: Test names should explain what's being tested
5. **Keep tests fast**: Unit tests should run in milliseconds
6. **Use fixtures**: Share test data through fixtures

## Troubleshooting

### Firestore Rules Tests Fail

- Ensure Firebase emulator is running
- Check rules syntax: `firebase deploy --only firestore:rules --dry-run`

### E2E Tests Fail

- Ensure dev server is running on port 3000
- Check that Playwright browsers are installed: `npx playwright install`

### Jest Cannot Find Module

- Check moduleNameMapper in jest.config.js
- Ensure tsconfig paths are correct

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Firebase Rules Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Supertest Documentation](https://github.com/ladjs/supertest)

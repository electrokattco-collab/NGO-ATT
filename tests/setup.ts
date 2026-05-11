/**
 * Jest Test Setup
 * 
 * Global test configuration and utilities
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods during tests to reduce noise
// Uncomment if needed:
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: console.error,
// };

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});

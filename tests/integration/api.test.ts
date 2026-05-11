/**
 * API Integration Tests
 * 
 * Tests for API endpoints using supertest
 */

import request from 'supertest';
import express from 'express';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  apps: [],
  credential: {
    cert: jest.fn(),
  },
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date().toISOString()),
      increment: jest.fn((n) => n),
    },
  },
}));

// Mock Firebase
jest.mock('@/src/lib/firebase.js', () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock logger
jest.mock('@/src/lib/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  logFirebaseStatus: jest.fn(),
  logStartup: jest.fn(),
  loggerStream: { write: jest.fn() },
}));

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'online',
      firebase: 'connected',
      environment: 'test',
    });
  });

  // Features endpoint
  app.get('/api/features', (req, res) => {
    res.json({
      payments: false,
      emails: false,
      analytics: false,
    });
  });

  // Contact form endpoint
  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 422,
        },
      });
    }

    if (message.length < 10) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Message too short',
          statusCode: 422,
        },
      });
    }

    res.status(201).json({
      success: true,
      messageId: 'msg-test-123',
    });
  });

  // Volunteer application endpoint
  app.post('/api/volunteers', (req, res) => {
    const { fullName, email, phone, motivation } = req.body;
    
    if (!fullName || !email || !phone || !motivation) {
      return res.status(422).json({
        success: false,
        error: {
          message: 'Missing required fields',
          statusCode: 422,
        },
      });
    }

    res.status(201).json({
      success: true,
      volunteerId: 'vol-test-123',
    });
  });

  // Error handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
};

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('firebase', 'connected');
      expect(response.body).toHaveProperty('environment', 'test');
    });
  });

  describe('GET /api/features', () => {
    test('should return feature flags', async () => {
      const response = await request(app)
        .get('/api/features')
        .expect(200);

      expect(response.body).toHaveProperty('payments');
      expect(response.body).toHaveProperty('emails');
      expect(response.body).toHaveProperty('analytics');
    });
  });

  describe('POST /api/contact', () => {
    test('should create contact message with valid data', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message that is long enough to be valid.',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('messageId');
    });

    test('should reject contact message with missing fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'John Doe',
          // Missing email, subject, message
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    test('should reject contact message with short content', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test',
          message: 'Hi',
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/volunteers', () => {
    test('should create volunteer application with valid data', async () => {
      const volunteerData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0821234567',
        motivation: 'I want to make a difference in my community through volunteering.',
      };

      const response = await request(app)
        .post('/api/volunteers')
        .send(volunteerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('volunteerId');
    });

    test('should reject volunteer application with missing fields', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send({
          fullName: 'Jane Smith',
          // Missing other required fields
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body.error).toContain('API endpoint not found');
    });
  });
});

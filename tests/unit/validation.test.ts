/**
 * Validation Unit Tests
 * 
 * Tests for Zod validation schemas
 */

import {
  createDonationSchema,
  createVolunteerSchema,
  createBlogPostSchema,
  createContactMessageSchema,
  validate,
  validateOrThrow,
} from '@/src/lib/validation.js';

describe('Validation Schemas', () => {
  
  describe('Donation Schema', () => {
    test('should validate valid donation', () => {
      const donation = {
        donorName: 'John Doe',
        email: 'john@example.com',
        amount: 100,
        donationType: 'one-time' as const,
        isAnonymous: false,
      };

      const result = createDonationSchema.safeParse(donation);
      expect(result.success).toBe(true);
    });

    test('should reject negative amount', () => {
      const donation = {
        donorName: 'John Doe',
        email: 'john@example.com',
        amount: -100,
        donationType: 'one-time',
        isAnonymous: false,
      };

      const result = createDonationSchema.safeParse(donation);
      expect(result.success).toBe(false);
    });

    test('should reject amount exceeding maximum', () => {
      const donation = {
        donorName: 'John Doe',
        email: 'john@example.com',
        amount: 2000000, // Exceeds 1M limit
        donationType: 'one-time',
        isAnonymous: false,
      };

      const result = createDonationSchema.safeParse(donation);
      expect(result.success).toBe(false);
    });

    test('should reject invalid email', () => {
      const donation = {
        donorName: 'John Doe',
        email: 'invalid-email',
        amount: 100,
        donationType: 'one-time',
        isAnonymous: false,
      };

      const result = createDonationSchema.safeParse(donation);
      expect(result.success).toBe(false);
    });
  });

  describe('Volunteer Schema', () => {
    test('should validate valid volunteer application', () => {
      const volunteer = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0821234567',
        motivation: 'I want to make a difference in my community.',
      };

      const result = createVolunteerSchema.safeParse(volunteer);
      expect(result.success).toBe(true);
    });

    test('should reject short motivation', () => {
      const volunteer = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0821234567',
        motivation: 'Help',
      };

      const result = createVolunteerSchema.safeParse(volunteer);
      expect(result.success).toBe(false);
    });

    test('should reject invalid South African phone', () => {
      const volunteer = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890', // Invalid SA format
        motivation: 'I want to make a difference in my community.',
      };

      const result = createVolunteerSchema.safeParse(volunteer);
      expect(result.success).toBe(false);
    });

    test('should accept valid South African phone formats', () => {
      const validPhones = ['0821234567', '+27821234567', '0711234567', '+27711234567'];
      
      for (const phone of validPhones) {
        const volunteer = {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone,
          motivation: 'I want to make a difference in my community.',
        };

        const result = createVolunteerSchema.safeParse(volunteer);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Blog Post Schema', () => {
    test('should validate valid blog post', () => {
      const post = {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        content: 'This is the content of the blog post.',
        featuredImage: 'https://example.com/image.jpg',
        category: 'News',
        author: 'John Doe',
        authorId: 'user-123',
      };

      const result = createBlogPostSchema.safeParse(post);
      expect(result.success).toBe(true);
    });

    test('should reject invalid slug', () => {
      const post = {
        title: 'Test Blog Post',
        slug: 'Test Blog Post', // Invalid: contains spaces and uppercase
        content: 'Content',
        featuredImage: 'https://example.com/image.jpg',
        category: 'News',
        author: 'John Doe',
        authorId: 'user-123',
      };

      const result = createBlogPostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });

    test('should accept valid slug formats', () => {
      const validSlugs = ['my-blog-post', 'news-update-2024', 'mental-health-awareness'];
      
      for (const slug of validSlugs) {
        const post = {
          title: 'Test',
          slug,
          content: 'Content',
          featuredImage: 'https://example.com/image.jpg',
          category: 'News',
          author: 'John Doe',
          authorId: 'user-123',
        };

        const result = createBlogPostSchema.safeParse(post);
        expect(result.success).toBe(true);
      }
    });

    test('should reject empty title', () => {
      const post = {
        title: '',
        slug: 'test-post',
        content: 'Content',
        featuredImage: 'https://example.com/image.jpg',
        category: 'News',
        author: 'John Doe',
        authorId: 'user-123',
      };

      const result = createBlogPostSchema.safeParse(post);
      expect(result.success).toBe(false);
    });
  });

  describe('Contact Message Schema', () => {
    test('should validate valid contact message', () => {
      const message = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message that is long enough.',
      };

      const result = createContactMessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    test('should reject short message', () => {
      const message = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Hi',
      };

      const result = createContactMessageSchema.safeParse(message);
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation Helpers', () => {
  describe('validate', () => {
    test('should return success for valid data', () => {
      const result = validate(createDonationSchema, {
        donorName: 'John',
        amount: 100,
        donationType: 'one-time',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.donorName).toBe('John');
      }
    });

    test('should return errors for invalid data', () => {
      const result = validate(createDonationSchema, {
        donorName: '',
        amount: -100,
        donationType: 'invalid',
      });

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateOrThrow', () => {
    test('should return data for valid input', () => {
      const data = validateOrThrow(createDonationSchema, {
        donorName: 'John',
        amount: 100,
        donationType: 'one-time',
      });

      expect(data.donorName).toBe('John');
    });

    test('should throw for invalid input', () => {
      expect(() => {
        validateOrThrow(createDonationSchema, {
          donorName: '',
          amount: -100,
          donationType: 'invalid',
        });
      }).toThrow('Validation failed');
    });
  });
});

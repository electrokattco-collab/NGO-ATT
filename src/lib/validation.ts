/**
 * Zod Validation Schemas
 * 
 * Type-safe validation for all API inputs
 * Syncs with firebase-blueprint.json entity definitions
 */

import { z } from 'zod';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates a South African phone number
 */
const isValidSouthAfricanPhone = (phone: string): boolean => {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Check for +27 or 0 prefix followed by 9 digits
  return /^((\+27)|0)[6-8][0-9]{8}$/.test(cleaned);
};

/**
 * Validates a URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates an email address
 */
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ============================================================================
// Common Schemas
// ============================================================================

export const idSchema = z.string()
  .min(1, 'ID is required')
  .max(128, 'ID must be less than 128 characters')
  .regex(/^[a-zA-Z0-9_\-]+$/, 'ID must contain only alphanumeric characters, underscores, and hyphens');

export const emailSchema = z.string()
  .min(1, 'Email is required')
  .max(100, 'Email must be less than 100 characters')
  .refine(isValidEmail, 'Invalid email format');

export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .max(20, 'Phone number must be less than 20 characters')
  .refine(isValidSouthAfricanPhone, 'Invalid South African phone number');

export const urlSchema = z.string()
  .refine(isValidUrl, 'Invalid URL format');

export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(200, 'Slug must be less than 200 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens (e.g., my-blog-post)');

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * User schema
 */
export const userSchema = z.object({
  id: idSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  role: z.enum(['super_admin', 'admin', 'editor', 'volunteer_manager', 'donor_manager', 'user']),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateUserSchema = createUserSchema.partial();

/**
 * Volunteer application schema
 */
export const volunteerSchema = z.object({
  id: idSchema.optional(),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  phone: phoneSchema,
  skills: z.string().max(500, 'Skills must be less than 500 characters').optional(),
  availability: z.string().max(200, 'Availability must be less than 200 characters').optional(),
  motivation: z.string().min(10, 'Motivation must be at least 10 characters').max(2000, 'Motivation must be less than 2000 characters'),
  cvPath: z.string().optional(),
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']).default('pending'),
  createdAt: z.string().datetime().optional(),
});

export const createVolunteerSchema = volunteerSchema.omit({ id: true, createdAt: true, status: true });
export const updateVolunteerStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

/**
 * Donation schema
 */
export const donationSchema = z.object({
  id: idSchema.optional(),
  donorName: z.string().min(1, 'Donor name is required').max(100, 'Name must be less than 100 characters'),
  donorEmail: emailSchema.optional(),
  amount: z.number().positive('Amount must be greater than 0').max(1000000, 'Amount exceeds maximum limit'),
  donationType: z.enum(['one-time', 'monthly']),
  paymentMethod: z.enum(['yoco', 'payfast', 'eft', 'other']).optional(),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  isAnonymous: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

export const createDonationSchema = donationSchema.omit({ 
  id: true, 
  createdAt: true, 
  transactionReference: true, 
  status: true,
  paymentMethod: true,
});

/**
 * Blog post schema
 */
export const blogPostSchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: slugSchema,
  content: z.string().min(1, 'Content is required').max(50000, 'Content must be less than 50,000 characters'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  featuredImage: urlSchema.optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  author: z.string().min(1, 'Author is required').max(100, 'Author must be less than 100 characters'),
  authorId: idSchema,
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  viewCount: z.number().default(0),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createBlogPostSchema = blogPostSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  viewCount: true,
  publishedAt: true,
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

/**
 * Program schema
 */
export const programSchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  imageUrl: urlSchema,
  pdfUrl: urlSchema.optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createProgramSchema = programSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateProgramSchema = createProgramSchema.partial();

/**
 * Event schema
 */
export const eventSchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  imageUrl: urlSchema.optional(),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  eventDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  registrationRequired: z.boolean().default(false),
  maxAttendees: z.number().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
  isPublic: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createEventSchema = eventSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateEventSchema = createEventSchema.partial();

/**
 * Contact message schema
 */
export const contactMessageSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

export const createContactMessageSchema = contactMessageSchema.omit({ id: true, isRead: true, createdAt: true });

/**
 * Sponsor schema
 */
export const sponsorSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  logoUrl: urlSchema,
  website: urlSchema.optional(),
  tier: z.enum(['platinum', 'gold', 'silver', 'bronze']).default('bronze'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
});

export const createSponsorSchema = sponsorSchema.omit({ id: true, createdAt: true });
export const updateSponsorSchema = createSponsorSchema.partial();

/**
 * Gallery image schema
 */
export const gallerySchema = z.object({
  id: idSchema.optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  imageUrl: urlSchema,
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
});

export const createGallerySchema = gallerySchema.omit({ id: true, createdAt: true });
export const updateGallerySchema = createGallerySchema.partial();

// ============================================================================
// Payment Schemas
// ============================================================================

/**
 * Yoco payment intent
 */
export const yocoPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.literal('ZAR'),
  metadata: z.object({
    donorEmail: emailSchema.optional(),
    donorName: z.string().max(100).optional(),
    donationType: z.enum(['one-time', 'monthly']),
    programId: idSchema.optional(),
    message: z.string().max(500).optional(),
    isAnonymous: z.boolean().optional(),
  }),
});

/**
 * PayFast payment payload
 */
export const payfastPaymentSchema = z.object({
  amount: z.number().positive(),
  item_name: z.string().min(1),
  name_first: z.string().optional(),
  name_last: z.string().optional(),
  email_address: emailSchema.optional(),
  cell_number: phoneSchema.optional(),
  m_payment_id: z.string(),
  custom_str1: z.string().optional(), // donationType
  custom_str2: z.string().optional(), // isAnonymous
  custom_str3: z.string().max(500).optional(), // message
});

/**
 * Payment webhook payload (generic)
 */
export const paymentWebhookSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['success', 'failed', 'pending', 'cancelled']),
  amount: z.number(),
  currency: z.string(),
  timestamp: z.string().datetime(),
  signature: z.string(), // For webhook verification
  metadata: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// Role Assignment Schema
// ============================================================================

export const assignRoleSchema = z.object({
  targetUid: idSchema,
  role: z.enum(['super_admin', 'admin', 'editor', 'volunteer_manager', 'donor_manager', 'user']),
});

// ============================================================================
// Type Exports
// ============================================================================

export type UserInput = z.infer<typeof createUserSchema>;
export type VolunteerInput = z.infer<typeof createVolunteerSchema>;
export type DonationInput = z.infer<typeof createDonationSchema>;
export type BlogPostInput = z.infer<typeof createBlogPostSchema>;
export type ProgramInput = z.infer<typeof createProgramSchema>;
export type EventInput = z.infer<typeof createEventSchema>;
export type ContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type SponsorInput = z.infer<typeof createSponsorSchema>;
export type GalleryInput = z.infer<typeof createGallerySchema>;
export type YocoPaymentIntent = z.infer<typeof yocoPaymentIntentSchema>;
export type PayfastPayment = z.infer<typeof payfastPaymentSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates data against a schema and returns result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error.issues.map((issue: any) => ({ field: issue.path.join('.'), message: issue.message })) };
  }
}

/**
 * Validates data and throws ValidationError on failure
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    
    throw new Error(`Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }
  
  return result.data;
}

export default {
  user: userSchema,
  volunteer: volunteerSchema,
  donation: donationSchema,
  blogPost: blogPostSchema,
  program: programSchema,
  event: eventSchema,
  contactMessage: contactMessageSchema,
  sponsor: sponsorSchema,
  gallery: gallerySchema,
  yocoPayment: yocoPaymentIntentSchema,
  payfastPayment: payfastPaymentSchema,
  paymentWebhook: paymentWebhookSchema,
  assignRole: assignRoleSchema,
};

/**
 * Email Service
 * 
 * Handles all email communications using SendGrid
 * Includes templates for donations, volunteers, contacts, and admin notifications
 */

import sgMail from '@sendgrid/mail';
import { env } from '@/src/lib/env.js';
import { logger } from '@/src/lib/logger.js';
import { BadRequestError } from '@/src/middleware/errorHandler.js';

// ============================================================================
// Configuration
// ============================================================================

const SENDGRID_API_KEY = env.SENDGRID_API_KEY;
const FROM_EMAIL = env.EMAIL_FROM;
const FROM_NAME = env.EMAIL_FROM_NAME;

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// ============================================================================
// Types
// ============================================================================

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html: string;
  from?: { email: string; name: string };
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export interface DonationEmailData {
  donorName: string;
  donorEmail: string;
  amount: number;
  donationType: string;
  transactionReference: string;
  isAnonymous: boolean;
  message?: string;
}

export interface VolunteerEmailData {
  fullName: string;
  email: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  notes?: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if email service is configured
 */
export const isEmailConfigured = (): boolean => {
  return !!(SENDGRID_API_KEY && FROM_EMAIL);
};

/**
 * Sends an email using SendGrid
 */
export const sendEmail = async (data: EmailData): Promise<void> => {
  if (!isEmailConfigured()) {
    if (env.NODE_ENV === 'development') {
      logger.info('Email would be sent (emails disabled):', { to: data.to, subject: data.subject });
      return;
    }
    throw new BadRequestError('Email service is not configured');
  }

  // Skip sending if emails are disabled
  if (!env.ENABLE_EMAILS && env.NODE_ENV !== 'production') {
    logger.info('Email skipped (ENABLE_EMAILS=false):', { to: data.to, subject: data.subject });
    return;
  }

  try {
    const msg = {
      to: data.to,
      from: data.from || { email: FROM_EMAIL, name: FROM_NAME },
      subject: data.subject,
      text: data.text,
      html: data.html,
      replyTo: data.replyTo,
      attachments: data.attachments,
    };

    await sgMail.send(msg);
    
    logger.info('Email sent successfully', {
      to: data.to,
      subject: data.subject,
    });
  } catch (error) {
    logger.error('Email send failed', {
      error: (error as Error).message,
      to: data.to,
      subject: data.subject,
    });
    throw new BadRequestError('Failed to send email. Please try again later.');
  }
};

// ============================================================================
// Email Templates
// ============================================================================

const getBaseTemplate = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ATT NGO</h1>
      <p>Awaken. Thrive. Transform.</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ATT NGO. All rights reserved.</p>
      <p>Empowering learners through mental health support.</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================================================
// Donation Emails
// ============================================================================

/**
 * Sends donation receipt to donor
 */
export const sendDonationReceipt = async (data: DonationEmailData): Promise<void> => {
  const amountFormatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(data.amount);

  const content = `
    <h2>Thank You for Your Donation!</h2>
    <p>Dear ${data.donorName},</p>
    <p>We are deeply grateful for your generous contribution to ATT NGO. Your support helps us continue our mission of empowering learners through mental health programs.</p>
    
    <h3>Donation Details:</h3>
    <ul>
      <li><strong>Amount:</strong> ${amountFormatted}</li>
      <li><strong>Donation Type:</strong> ${data.donationType === 'monthly' ? 'Monthly Recurring' : 'One-time'}</li>
      <li><strong>Transaction Reference:</strong> ${data.transactionReference}</li>
      <li><strong>Date:</strong> ${new Date().toLocaleDateString('en-ZA')}</li>
    </ul>
    
    ${data.message ? `<p><strong>Your Message:</strong> "${data.message}"</p>` : ''}
    
    <p>A tax-deductible receipt has been attached to this email for your records.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${env.CORS_ORIGIN[0]}/impact" class="button">See Your Impact</a>
    </p>
    
    <p>With heartfelt appreciation,<br><strong>The ATT NGO Team</strong></p>
  `;

  await sendEmail({
    to: data.donorEmail,
    subject: 'Thank You for Your Donation - ATT NGO',
    html: getBaseTemplate(content),
    text: `Thank you for your donation of ${amountFormatted}. Transaction Reference: ${data.transactionReference}`,
  });
};

/**
 * Notifies admin of new donation
 */
export const sendDonationNotification = async (data: DonationEmailData): Promise<void> => {
  const amountFormatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(data.amount);

  const content = `
    <h2>New Donation Received</h2>
    <p>A new donation has been received through the website.</p>
    
    <h3>Donation Details:</h3>
    <ul>
      <li><strong>Donor:</strong> ${data.isAnonymous ? 'Anonymous' : data.donorName}</li>
      ${!data.isAnonymous ? `<li><strong>Email:</strong> ${data.donorEmail}</li>` : ''}
      <li><strong>Amount:</strong> ${amountFormatted}</li>
      <li><strong>Type:</strong> ${data.donationType}</li>
      <li><strong>Reference:</strong> ${data.transactionReference}</li>
    </ul>
    
    ${data.message ? `<p><strong>Donor Message:</strong> "${data.message}"</p>` : ''}
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${env.CORS_ORIGIN[0]}/admin/donations" class="button">View in Admin</a>
    </p>
  `;

  await sendEmail({
    to: FROM_EMAIL,
    subject: `New Donation: ${amountFormatted} ${data.isAnonymous ? '(Anonymous)' : `from ${data.donorName}`}`,
    html: getBaseTemplate(content),
    text: `New donation received: ${amountFormatted} from ${data.isAnonymous ? 'Anonymous' : data.donorName}`,
  });
};

// ============================================================================
// Volunteer Emails
// ============================================================================

/**
 * Sends application confirmation to volunteer
 */
export const sendVolunteerConfirmation = async (data: VolunteerEmailData): Promise<void> => {
  const content = `
    <h2>Volunteer Application Received</h2>
    <p>Dear ${data.fullName},</p>
    <p>Thank you for your interest in volunteering with ATT NGO. We have received your application and our team will review it shortly.</p>
    
    <h3>What Happens Next?</h3>
    <ol>
      <li>Our volunteer coordinator will review your application</li>
      <li>We may contact you for additional information or an interview</li>
      <li>You will receive a decision within 5-7 business days</li>
    </ol>
    
    <p>In the meantime, learn more about our programs:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${env.CORS_ORIGIN[0]}/programs" class="button">Our Programs</a>
    </p>
    
    <p>Thank you for your willingness to serve!<br><strong>The ATT NGO Team</strong></p>
  `;

  await sendEmail({
    to: data.email,
    subject: 'Volunteer Application Received - ATT NGO',
    html: getBaseTemplate(content),
    text: `Thank you for applying to volunteer with ATT NGO. We will review your application and respond within 5-7 business days.`,
  });
};

/**
 * Sends status update to volunteer
 */
export const sendVolunteerStatusUpdate = async (data: VolunteerEmailData): Promise<void> => {
  const statusMessages = {
    pending: 'Your application is pending review.',
    reviewed: 'Your application is being reviewed by our team.',
    accepted: 'Congratulations! Your application has been accepted.',
    rejected: 'We regret to inform you that we cannot accommodate your application at this time.',
  };

  const content = `
    <h2>Volunteer Application Update</h2>
    <p>Dear ${data.fullName},</p>
    <p>${statusMessages[data.status]}</p>
    
    ${data.notes ? `<p><strong>Additional Notes:</strong></p><p>${data.notes}</p>` : ''}
    
    ${data.status === 'accepted' ? `
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>You will receive orientation materials via email</li>
        <li>Please complete the required background check form</li>
        <li>Our volunteer coordinator will contact you to schedule your first shift</li>
      </ul>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${env.CORS_ORIGIN[0]}/volunteer/resources" class="button">Volunteer Resources</a>
      </p>
    ` : ''}
    
    <p>Thank you for your interest in making a difference.<br><strong>The ATT NGO Team</strong></p>
  `;

  const subjects = {
    pending: 'Volunteer Application Pending - ATT NGO',
    reviewed: 'Volunteer Application Under Review - ATT NGO',
    accepted: 'Volunteer Application Accepted - ATT NGO',
    rejected: 'Volunteer Application Update - ATT NGO',
  };

  await sendEmail({
    to: data.email,
    subject: subjects[data.status],
    html: getBaseTemplate(content),
    text: `Your volunteer application status has been updated to: ${data.status}`,
  });
};

/**
 * Notifies admin of new volunteer application
 */
export const sendVolunteerNotification = async (data: Omit<VolunteerEmailData, 'status' | 'notes'> & { skills?: string }): Promise<void> => {
  const content = `
    <h2>New Volunteer Application</h2>
    <p>A new volunteer application has been submitted.</p>
    
    <h3>Applicant Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${data.fullName}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      ${data.skills ? `<li><strong>Skills:</strong> ${data.skills}</li>` : ''}
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${env.CORS_ORIGIN[0]}/admin/volunteers" class="button">Review Application</a>
    </p>
  `;

  await sendEmail({
    to: FROM_EMAIL,
    subject: `New Volunteer Application: ${data.fullName}`,
    html: getBaseTemplate(content),
    text: `New volunteer application from ${data.fullName}. Email: ${data.email}`,
  });
};

// ============================================================================
// Contact Form Emails
// ============================================================================

/**
 * Sends contact form confirmation to sender
 */
export const sendContactConfirmation = async (data: ContactEmailData): Promise<void> => {
  const content = `
    <h2>Message Received</h2>
    <p>Dear ${data.name},</p>
    <p>Thank you for contacting ATT NGO. We have received your message and will respond as soon as possible.</p>
    
    <h3>Your Message:</h3>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #dc2626;">
      ${data.message.replace(/\n/g, '<br>')}
    </blockquote>
    
    <p>We typically respond within 24-48 hours during business days.</p>
    
    <p>Best regards,<br><strong>The ATT NGO Team</strong></p>
  `;

  await sendEmail({
    to: data.email,
    subject: 'We Received Your Message - ATT NGO',
    html: getBaseTemplate(content),
    text: `Thank you for contacting ATT NGO. We have received your message: "${data.subject}" and will respond soon.`,
  });
};

/**
 * Forwards contact form to admin
 */
export const sendContactNotification = async (data: ContactEmailData): Promise<void> => {
  const content = `
    <h2>New Contact Form Submission</h2>
    
    <h3>From:</h3>
    <ul>
      <li><strong>Name:</strong> ${data.name}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      <li><strong>Subject:</strong> ${data.subject}</li>
    </ul>
    
    <h3>Message:</h3>
    <blockquote style="background: #f3f4f6; padding: 15px; border-left: 4px solid #dc2626;">
      ${data.message.replace(/\n/g, '<br>')}
    </blockquote>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${env.CORS_ORIGIN[0]}/admin/messages" class="button">View in Admin</a>
    </p>
  `;

  await sendEmail({
    to: FROM_EMAIL,
    replyTo: data.email,
    subject: `Contact Form: ${data.subject}`,
    html: getBaseTemplate(content),
    text: `New message from ${data.name} (${data.email}): ${data.subject}\n\n${data.message}`,
  });
};

// ============================================================================
// Admin Notification Emails
// ============================================================================

/**
 * Sends security alert to admin
 */
export const sendSecurityAlert = async (alert: {
  type: string;
  message: string;
  details: Record<string, any>;
}): Promise<void> => {
  const content = `
    <h2 style="color: #dc2626;">⚠️ Security Alert</h2>
    <p><strong>Type:</strong> ${alert.type}</p>
    <p><strong>Message:</strong> ${alert.message}</p>
    
    <h3>Details:</h3>
    <pre style="background: #f3f4f6; padding: 15px; overflow-x: auto;">${JSON.stringify(alert.details, null, 2)}</pre>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${env.CORS_ORIGIN[0]}/admin" class="button">View Admin Panel</a>
    </p>
  `;

  await sendEmail({
    to: FROM_EMAIL,
    subject: `🚨 Security Alert: ${alert.type}`,
    html: getBaseTemplate(content),
    text: `Security Alert: ${alert.type}\n${alert.message}\n${JSON.stringify(alert.details)}`,
  });
};

// ============================================================================
// Export Service
// ============================================================================

export const emailService = {
  sendEmail,
  isConfigured: isEmailConfigured,
  // Donation emails
  sendDonationReceipt,
  sendDonationNotification,
  // Volunteer emails
  sendVolunteerConfirmation,
  sendVolunteerStatusUpdate,
  sendVolunteerNotification,
  // Contact emails
  sendContactConfirmation,
  sendContactNotification,
  // Admin emails
  sendSecurityAlert,
};

export default emailService;

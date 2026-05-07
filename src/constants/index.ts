export const APP_NAME = 'Awaken Thrive Transform';
export const APP_SHORT_NAME = 'ATT NGO';

export const COLLECTIONS = {
  USERS: 'users',
  VOLUNTEERS: 'volunteers',
  DONATIONS: 'donations',
  BLOG_POSTS: 'blogPosts',
  EVENTS: 'events',
  PROGRAMS: 'programs',
  SPONSORS: 'sponsors',
  GALLERY: 'gallery',
  CONTACT_MESSAGES: 'contactMessages',
  ANALYTICS: 'analytics',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
} as const;

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PROGRAMS: '/programs',
  VOLUNTEER: '/volunteer',
  DONATIONS: '/donations',
  CONTACT: '/contact',
  BLOG: '/blog',
  ADMIN: {
    DASHBOARD: '/admin',
    VOLUNTEERS: '/admin/volunteers',
    MESSAGES: '/admin/messages',
    DONATIONS: '/admin/donations',
    BLOG: '/admin/blog',
    EVENTS: '/admin/events',
    GALLERY: '/admin/gallery',
    SETTINGS: '/admin/settings',
  }
} as const;

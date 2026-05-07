import { Timestamp } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'volunteer_manager' | 'donor_manager' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills?: string;
  availability?: string;
  motivation: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

export interface Donation {
  id: string;
  donorName?: string;
  amount: number;
  donationType: 'one-time' | 'monthly';
  transactionReference: string;
  createdAt: Timestamp;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  category: string;
  author: string;
  tags?: string[];
  status: 'draft' | 'published';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  eventDate: Timestamp;
  createdAt: Timestamp;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: Timestamp;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
  status: 'new' | 'read' | 'archived';
}

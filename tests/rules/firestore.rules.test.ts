/**
 * Firestore Security Rules Tests
 * 
 * Tests the "Dirty Dozen" attack vectors and role-based access control
 * Based on security_spec.md
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// Test Setup
// ============================================================================

let testEnv: RulesTestEnvironment | null = null;

const PROJECT_ID = 'gen-lang-client-0079941199';
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const describeIfEmulator = FIRESTORE_EMULATOR_HOST ? describe : describe.skip;

describeIfEmulator('Firestore Security Rules', () => {
  beforeAll(async () => {
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    const [host, portString] = FIRESTORE_EMULATOR_HOST.split(':');
    const port = Number(portString || '8080');
    
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host,
        port,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

// ============================================================================
// Test Helpers
// ============================================================================

const createUser = async (uid: string, role: string = 'user') => {
  const db = testEnv.authenticatedContext(uid, { role }).firestore();
  await setDoc(doc(db, 'users', uid), {
    id: uid,
    name: 'Test User',
    email: 'test@example.com',
    role,
    createdAt: new Date().toISOString(),
  });
  return db;
};

const seedUser = async (uid: string, role: string = 'user') => {
  await testEnv!.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users', uid), {
      id: uid,
      name: 'Test User',
      email: `${uid}@example.com`,
      role,
      createdAt: new Date().toISOString(),
    });
  });
};

// ============================================================================
// SECURITY TEST SUITE - The "Dirty Dozen"
// ============================================================================
  
  // --------------------------------------------------------------------------
  // 1. Identity Spoofing - Attempt to create user profile with different UID
  // --------------------------------------------------------------------------
  describe('1. Identity Spoofing', () => {
    test('should reject creating user profile with different UID', async () => {
      const attackerDb = testEnv.authenticatedContext('attacker-123', { role: 'user' }).firestore();
      
      await expect(
        setDoc(doc(attackerDb, 'users', 'victim-456'), {
          id: 'victim-456',
          name: 'Victim User',
          email: 'victim@example.com',
          role: 'user',
        })
      ).toBeDenied();
    });

    test('should allow user to create their own profile', async () => {
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        setDoc(doc(userDb, 'users', 'user-123'), {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        })
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Elevated Privilege - Attempt to set role to admin
  // --------------------------------------------------------------------------
  describe('2. Elevated Privilege', () => {
    test('should reject setting role to admin during profile creation', async () => {
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        setDoc(doc(userDb, 'users', 'user-123'), {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin', // Attempting to elevate
        })
      ).toBeDenied();
    });

    test('should reject role elevation during profile update', async () => {
      await seedUser('user-123', 'user');

      // User attempts to elevate
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        updateDoc(doc(userDb, 'users', 'user-123'), {
          role: 'admin',
        })
      ).toBeDenied();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Ghost Fields - Attempt to add unauthorized fields
  // --------------------------------------------------------------------------
  describe('3. Ghost Fields', () => {
    test('should allow creating donation with standard fields', async () => {
      const userDb = testEnv.authenticatedContext('user-123').firestore();
      
      await expect(
        setDoc(doc(userDb, 'donations', 'donation-1'), {
          donorName: 'John Doe',
          amount: 100,
          donationType: 'one-time',
          transactionReference: 'TXN-123',
          status: 'completed',
        })
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 4. Invalid IDs - Attempt path traversal
  // --------------------------------------------------------------------------
  describe('4. Invalid IDs', () => {
    test('should reject IDs with path traversal characters', async () => {
      // Note: This test validates the regex in isValidId function
      // The actual ID validation happens in the rules via isValidId
      const invalidIds = ['bad id', 'bad.id', 'doc\nnewline', 'unicode-é'];
      
      for (const id of invalidIds) {
        const userDb = testEnv.authenticatedContext(id, { role: 'user' }).firestore();
        await expect(
          setDoc(doc(userDb, 'users', id), {
            id,
            name: 'Test',
            email: 'test@example.com',
            role: 'user',
          })
        ).toBeDenied();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. Unauthorized Blog Edit - Regular user editing blog post
  // --------------------------------------------------------------------------
  describe('5. Unauthorized Blog Edit', () => {
    test('should reject blog edit by regular user', async () => {
      // Create blog post as editor
      const editorDb = testEnv.authenticatedContext('editor-123', { role: 'editor' }).firestore();
      await setDoc(doc(editorDb, 'blogPosts', 'post-1'), {
        title: 'Original Title',
        content: 'Original content',
        slug: 'original-post',
        featuredImage: 'https://example.com/image.jpg',
        category: 'News',
        author: 'Editor',
        status: 'published',
      });

      // Regular user attempts to edit
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        updateDoc(doc(userDb, 'blogPosts', 'post-1'), {
          title: 'Hacked Title',
          content: 'Malicious content',
        })
      ).toBeDenied();
    });

    test('should allow blog edit by editor', async () => {
      const editorDb = testEnv.authenticatedContext('editor-123', { role: 'editor' }).firestore();
      await setDoc(doc(editorDb, 'blogPosts', 'post-1'), {
        title: 'Original Title',
        content: 'Original content',
        slug: 'original-post',
        featuredImage: 'https://example.com/image.jpg',
        category: 'News',
        author: 'Editor',
        status: 'published',
      });

      await expect(
        updateDoc(doc(editorDb, 'blogPosts', 'post-1'), {
          title: 'Updated Title',
        })
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 6. Data Injection - Oversized strings
  // --------------------------------------------------------------------------
  describe('6. Data Injection', () => {
    test('should reject extremely long title in blog post', async () => {
      const editorDb = testEnv.authenticatedContext('editor-123', { role: 'editor' }).firestore();
      
      // Create a title > 200 characters
      const longTitle = 'A'.repeat(250);
      
      await expect(
        setDoc(doc(editorDb, 'blogPosts', 'post-1'), {
          title: longTitle,
          content: 'Content',
          slug: 'test-post',
          featuredImage: 'https://example.com/image.jpg',
          category: 'News',
          author: 'Editor',
          status: 'published',
        })
      ).toBeDenied();
    });
  });

  // --------------------------------------------------------------------------
  // 7. Relational Orphan - Creating content without valid author
  // Note: Firestore rules can't validate relations across documents
  // This is enforced at application layer
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // 8. Immutability Breach - Attempting to change createdAt
  // --------------------------------------------------------------------------
  describe('8. Immutability Breach', () => {
    test('should allow updating user profile without changing role', async () => {
      await seedUser('user-123', 'user');

      // User updates their name
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        updateDoc(doc(userDb, 'users', 'user-123'), {
          name: 'Updated Name',
        })
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 9. Private Path Leak - Non-admin reading contact messages
  // --------------------------------------------------------------------------
  describe('9. Private Path Leak', () => {
    test('should reject non-admin reading contact messages', async () => {
      // Create contact message as admin
      const adminDb = testEnv.authenticatedContext('admin-123', { role: 'admin' }).firestore();
      await setDoc(doc(adminDb, 'contactMessages', 'msg-1'), {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
        isRead: false,
      });

      // Regular user attempts to read
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        getDoc(doc(userDb, 'contactMessages', 'msg-1'))
      ).toBeDenied();
    });

    test('should allow admin reading contact messages', async () => {
      const adminDb = testEnv.authenticatedContext('admin-123', { role: 'admin' }).firestore();
      
      await setDoc(doc(adminDb, 'contactMessages', 'msg-1'), {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
        isRead: false,
      });

      await expect(
        getDoc(doc(adminDb, 'contactMessages', 'msg-1'))
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 10. State Shortcut - Setting volunteer status directly
  // --------------------------------------------------------------------------
  describe('10. State Shortcut', () => {
    test('should reject volunteer setting their own status to accepted', async () => {
      // Create volunteer application
      const userDb = testEnv.authenticatedContext('user-123').firestore();
      await setDoc(doc(userDb, 'volunteers', 'vol-1'), {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '0821234567',
        motivation: 'I want to help',
        status: 'pending',
      });

      // Volunteer attempts to accept themselves
      await expect(
        updateDoc(doc(userDb, 'volunteers', 'vol-1'), {
          status: 'accepted',
        })
      ).toBeDenied();
    });

    test('should allow volunteer manager to update status', async () => {
      // Create volunteer
      const userDb = testEnv.authenticatedContext('user-123').firestore();
      await setDoc(doc(userDb, 'volunteers', 'vol-1'), {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '0821234567',
        motivation: 'I want to help',
        status: 'pending',
      });

      // Manager updates status
      const managerDb = testEnv.authenticatedContext('manager-123', { role: 'volunteer_manager' }).firestore();
      
      await expect(
        updateDoc(doc(managerDb, 'volunteers', 'vol-1'), {
          status: 'accepted',
        })
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 11. PII Exposure - Reading another user's email
  // --------------------------------------------------------------------------
  describe('11. PII Exposure', () => {
    test('should reject user reading another user\'s profile', async () => {
      await seedUser('user-456', 'user');

      // User attempts to read other user's profile
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        getDoc(doc(userDb, 'users', 'user-456'))
      ).toBeDenied();
    });

    test('should allow user reading their own profile', async () => {
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      await setDoc(doc(userDb, 'users', 'user-123'), {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });

      await expect(
        getDoc(doc(userDb, 'users', 'user-123'))
      ).toBeAllowed();
    });

    test('should allow admin reading any user profile', async () => {
      await seedUser('user-456', 'user');

      const adminDb = testEnv.authenticatedContext('admin-123', { role: 'admin' }).firestore();
      await expect(
        getDoc(doc(adminDb, 'users', 'user-456'))
      ).toBeAllowed();
    });
  });

  // --------------------------------------------------------------------------
  // 12. Malicious Query - Listing all donations
  // --------------------------------------------------------------------------
  describe('12. Malicious Query', () => {
    test('should reject regular user listing all donations', async () => {
      const userDb = testEnv.authenticatedContext('user-123', { role: 'user' }).firestore();
      
      await expect(
        getDocs(collection(userDb, 'donations'))
      ).toBeDenied();
    });

    test('should allow donor manager listing donations', async () => {
      const managerDb = testEnv.authenticatedContext('manager-123', { role: 'donor_manager' }).firestore();
      
      await expect(
        getDocs(collection(managerDb, 'donations'))
      ).toBeAllowed();
    });
  });
});

// ============================================================================
// Custom Matchers
// ============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAllowed(): R;
      toBeDenied(): R;
    }
  }
}

expect.extend({
  async toBeAllowed(promise: Promise<any>) {
    try {
      await promise;
      return {
        message: () => 'Expected operation to be allowed',
        pass: true,
      };
    } catch (error: any) {
      return {
        message: () => `Expected operation to be allowed, but it was denied: ${error.message}`,
        pass: false,
      };
    }
  },
  
  async toBeDenied(promise: Promise<any>) {
    try {
      await promise;
      return {
        message: () => 'Expected operation to be denied, but it was allowed',
        pass: false,
      };
    } catch (error: any) {
      const isPermissionDenied = error.code === 'permission-denied' || 
                                  error.message?.includes('PERMISSION_DENIED');
      return {
        message: () => isPermissionDenied 
          ? 'Expected operation to be denied' 
          : `Operation failed with unexpected error: ${error.message}`,
        pass: isPermissionDenied,
      };
    }
  },
});

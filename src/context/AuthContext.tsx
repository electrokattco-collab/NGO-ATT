import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null,
  isAdmin: false, 
  isSuperAdmin: false,
  loading: true,
  refreshRole: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (firebaseUser: User) => {
    try {
      // Force refresh token to get latest claims
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const userRole = idTokenResult.claims.role as string || null;
      
      // If no role in claims, try to sync with backend
      if (!userRole) {
        const token = await firebaseUser.getIdToken();
        const response = await fetch('/api/auth/sync-profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        // Re-fetch token if backend just set custom claims
        if (data.status === 'created' && data.role !== 'user') {
          const newResult = await firebaseUser.getIdTokenResult(true);
          setRole(newResult.claims.role as string || 'user');
        } else {
          setRole(data.role || 'user');
        }
      } else {
        setRole(userRole);
      }
    } catch (error) {
      console.error("Auth sync error:", error);
      setRole('user');
    }
  };

  const refreshRole = async () => {
    if (user) {
      await fetchRole(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchRole(firebaseUser);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, isSuperAdmin, loading, refreshRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

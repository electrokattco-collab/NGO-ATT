import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  QueryConstraint, 
  onSnapshot,
  limit,
  orderBy,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface UseCollectionOptions {
  constraints?: QueryConstraint[];
  realtime?: boolean;
}

export function useCollection<T>(collectionPath: string, options: UseCollectionOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionPath), ...(options.constraints || []));

    if (options.realtime) {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
        setData(items);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setLoading(false);
      }, (err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      getDocs(q).then((snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
        setData(items);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setLoading(false);
      }).catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
    }
  }, [collectionPath, JSON.stringify(options.constraints)]);

  return { data, loading, error, lastVisible };
}

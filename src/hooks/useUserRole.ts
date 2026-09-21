"use client"

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const isIsolatedMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('mock') ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-isolated';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isIsolatedMode) {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('mock_user_session');
        if (raw && document.cookie.includes('firebaseAuthToken=')) {
          try {
            const parsed = JSON.parse(raw);
            setRole(parsed.role || 'admin');
          } catch {
            setRole('admin');
          }
        } else {
          setRole(null);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setRole(snap.data().role);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { role, loading };
}

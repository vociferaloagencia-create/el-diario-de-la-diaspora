"use client"

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBVbDSMJmqG2-ULAtxROw-1tM6TSOvN5Ho";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "el-diario-de-la-diaspora";
const isIsolatedMode = !apiKey || 
  apiKey.includes('mock') ||
  projectId === 'demo-isolated';

function withTimeout<T>(promise: Promise<T>, ms: number = 1800): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

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
            setRole(parsed.role || 'user');
          } catch {
            setRole('user');
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

      try {
        const isExplicitAdmin = currentUser.email?.toLowerCase() === 'admin@eldiariodeladiaspora.com';
        const ref = doc(db, "users", currentUser.uid);
        const snap = await withTimeout(getDoc(ref), 1800);

        if (snap.exists()) {
          const data = snap.data();
          const userRole = (data.role === 'admin' && !isExplicitAdmin) ? 'user' : (data.role || (isExplicitAdmin ? 'admin' : 'user'));
          setRole(userRole);
        } else {
          setRole(isExplicitAdmin ? 'admin' : 'user');
        }
      } catch {
        const isExplicitAdmin = currentUser.email?.toLowerCase() === 'admin@eldiariodeladiaspora.com';
        setRole(isExplicitAdmin ? 'admin' : 'user');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { role, loading };
}

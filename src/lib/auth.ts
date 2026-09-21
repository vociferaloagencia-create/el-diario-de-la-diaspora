"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, collection, query, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { AppUser } from './types';

const isIsolatedMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('mock') ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-isolated';

const mockAuthListeners: Array<(user: User | null, profile: AppUser | null) => void> = [];

function notifyMockAuthListeners(user: User | null, profile: AppUser | null) {
  mockAuthListeners.forEach(listener => {
    try {
      listener(user, profile);
    } catch (err) {
      console.error(err);
    }
  });
}

function getStoredMockSession(): { user: User; profile: AppUser } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('mock_user_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const user: User = {
      uid: parsed.uid || 'admin-diaspora-1',
      email: parsed.email || 'admin@eldiariodeladiaspora.com',
      displayName: parsed.name || 'Director Editorial',
      photoURL: parsed.photoUrl || '/images/opinion_editorial.jpg',
      getIdToken: async () => 'mock-jwt-token-diaspora',
    } as unknown as User;
    const profile: AppUser = {
      uid: parsed.uid || 'admin-diaspora-1',
      email: parsed.email || 'admin@eldiariodeladiaspora.com',
      role: parsed.role || 'admin',
      name: parsed.name || 'Director Editorial',
      photoUrl: parsed.photoUrl || '/images/opinion_editorial.jpg',
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
    return { user, profile };
  } catch {
    return null;
  }
}

// This function should now only be called from an admin context
export async function createAccount(email: string, password: string): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Creación de cuenta en modo aislado simulada localmente.");
    return "mock-user-uid";
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: 'editor', // Default role for new sign-ups
        createdAt: serverTimestamp(),
    });
    
    await firebaseSignOut(auth);
    return user.uid;
  } catch (error: any) {
    console.error("Error creating user account:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  if (isIsolatedMode) {
    const defaultEmail = email && email.includes('@') ? email : 'admin@eldiariodeladiaspora.com';
    const mockUser: User = {
      uid: 'admin-diaspora-1',
      email: defaultEmail,
      displayName: 'Director Editorial',
      photoURL: '/images/opinion_editorial.jpg',
      getIdToken: async () => 'mock-jwt-token-diaspora',
    } as unknown as User;

    const mockProfile: AppUser = {
      uid: 'admin-diaspora-1',
      email: defaultEmail,
      role: 'admin',
      name: 'Director Editorial',
      photoUrl: '/images/opinion_editorial.jpg',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user_session', JSON.stringify(mockProfile));
      document.cookie = `firebaseAuthToken=mock-jwt-token-diaspora; path=/; max-age=${60 * 60 * 24 * 7}`;
    }

    notifyMockAuthListeners(mockUser, mockProfile);
    return mockUser;
  }
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOut(): Promise<void> {
  if (!isIsolatedMode) {
    await firebaseSignOut(auth);
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user_session');
    }
    notifyMockAuthListeners(null, null);
  }
  document.cookie = 'firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Envío de correo en modo aislado.");
    return;
  }
  return firebaseSendPasswordResetEmail(auth, email);
}

export function onAuthUserChanged(
  callback: (authUser: User | null, userProfile: AppUser | null) => void
): () => void {
  if (isIsolatedMode) {
    mockAuthListeners.push(callback);
    const session = getStoredMockSession();
    if (session && typeof document !== 'undefined' && document.cookie.includes('firebaseAuthToken=')) {
      callback(session.user, session.profile);
    } else {
      callback(null, null);
    }
    return () => {
      const idx = mockAuthListeners.indexOf(callback);
      if (idx !== -1) mockAuthListeners.splice(idx, 1);
    };
  }

  let currentUid: string | null = null;
  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (authUser?.uid === currentUid && authUser) return;
    currentUid = authUser ? authUser.uid : null;

    if (authUser) {
      const token = await authUser.getIdToken();
      document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      const userProfile = await getUserProfile(authUser.uid);
      callback(authUser, userProfile);
    } else {
      document.cookie = 'firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      callback(null, null);
    }
  });
  return unsubscribe;
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  if (isIsolatedMode) {
    const session = getStoredMockSession();
    return session ? session.profile : null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
          uid,
          email: data.email,
          role: data.role,
          photoUrl: data.photoUrl,
          name: data.name,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as AppUser;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function getAllUsers(): Promise<AppUser[]> {
  if (isIsolatedMode) return [];
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('email'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        return {
            uid: doc.id,
            email: data.email,
            role: data.role,
            createdAt: createdAt instanceof Timestamp 
                ? createdAt.toDate().toISOString() 
                : (createdAt || new Date(0).toISOString()),
        } as AppUser;
    });
  } catch (e) {
    return [];
  }
}

export async function updateUserRole(uid: string, newRole: 'admin' | 'editor'): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Cambio de rol bloqueado en modo aislado.");
    return;
  }
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role: newRole });
}


"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, collection, query, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { AppUser } from './types';

const isIsolatedMode = false;

export function withTimeout<T>(promise: Promise<T>, ms: number = 1800, fallbackValue?: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (fallbackValue !== undefined) {
        resolve(fallbackValue);
      } else {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }
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

export async function syncAuthCookies(user: User, role?: string): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    const token = await user.getIdToken().catch(() => 'mock-jwt-token-diaspora');
    document.cookie = `firebaseAuthToken=${token}; path=/; max-age=604800; SameSite=Lax`;
    if (role) {
      document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
    }
  } catch (e) {
    document.cookie = `firebaseAuthToken=mock-jwt-token-diaspora; path=/; max-age=604800; SameSite=Lax`;
    if (role) {
      document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
    }
  }
}

export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

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
    const isExplicitAdmin = parsed.email?.toLowerCase() === 'admin@eldiariodeladiaspora.com';
    const role: AppUser['role'] = isExplicitAdmin ? 'superadmin' : 'user';
    const name = isExplicitAdmin ? (parsed.name || 'Director Editorial') : (parsed.name && parsed.name !== 'Director Editorial' ? parsed.name : 'Usuario Lector');
    const email = parsed.email || 'lector@eldiariodeladiaspora.com';

    const user: User = {
      uid: parsed.uid || `user-${Date.now()}`,
      email: email,
      displayName: name,
      photoURL: parsed.photoUrl || '/images/opinion_editorial.jpg',
      getIdToken: async () => 'mock-jwt-token-diaspora',
    } as unknown as User;
    const profile: AppUser = {
      uid: parsed.uid || `user-${Date.now()}`,
      email: email,
      role: role,
      name: name,
      photoUrl: parsed.photoUrl || '/images/opinion_editorial.jpg',
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
    return { user, profile };
  } catch {
    return null;
  }
}

// This function should now only be called from an admin context
export async function createAccount(
  email: string, 
  password: string, 
  username?: string, 
  role: AppUser['role'] = 'editor',
  name?: string
): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Creación de cuenta en modo aislado simulada localmente.");
    return "mock-user-uid";
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user profile in Firestore with 1.8s timeout
    const userRef = doc(db, 'users', user.uid);
    await withTimeout(setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: name || null,
        username: username ? username.trim().toLowerCase() : null,
        role: role || 'editor',
        createdAt: serverTimestamp(),
    }), 1800);
    
    await firebaseSignOut(auth);
    return user.uid;
  } catch (error: any) {
    console.error("Error creating user account:", error);
    throw error;
  }
}


export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower === 'admin@eldiariodeladiaspora.com' ||
    lower === 'eldiariodiaspora@eldiariodeladiaspora.com' ||
    lower === 'sharleen@eldiariodeladiaspora.com' ||
    lower === 'cliente@eldiariodeladiaspora.com'
  );
}

export async function resolveLoginIdentifier(identifier: string): Promise<string> {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@')) {
    return clean;
  }
  if (clean === 'eldiariodeladiasporanews' || clean === 'eldiariodiaspora' || clean === 'cliente') {
    return 'eldiariodiaspora@eldiariodeladiaspora.com';
  }
  if (clean === 'admin' || clean === 'superadmin' || clean === 'director') {
    return 'admin@eldiariodeladiaspora.com';
  }
  if (clean === 'sharleen') {
    return 'sharleen@eldiariodeladiaspora.com';
  }
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', clean), limit(1));
    const snap = await withTimeout(getDocs(q), 1800);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data.email) return data.email;
    }
  } catch (err) {
    console.warn('[Autenticación] Búsqueda de username omitida:', err);
  }
  return `${clean}@eldiariodeladiaspora.com`;
}

export async function signIn(identifier: string, password: string): Promise<User> {
  clearAuthCookies();
  if (typeof window !== "undefined") {
    localStorage.removeItem("mock_user_session");
  }
  const email = await resolveLoginIdentifier(identifier);

  const isExplicitAdmin = isSuperAdminEmail(email);
  const assignedRole: AppUser['role'] = isExplicitAdmin ? 'superadmin' : 'user';

  if (isIsolatedMode) {
    const userEmail = email && email.includes('@') ? email : 'usuario@eldiariodeladiaspora.com';
    const userName = isExplicitAdmin ? 'Director Editorial' : (userEmail.split('@')[0] || 'Usuario Lector');

    const mockUser: User = {
      uid: isExplicitAdmin ? 'admin-diaspora-1' : `user-${Date.now()}`,
      email: userEmail,
      displayName: userName,
      photoURL: '/images/opinion_editorial.jpg',
      getIdToken: async () => 'mock-jwt-token-diaspora',
    } as unknown as User;

    const mockProfile: AppUser = {
      uid: mockUser.uid,
      email: userEmail,
      role: assignedRole,
      name: userName,
      photoUrl: '/images/opinion_editorial.jpg',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user_session', JSON.stringify(mockProfile));
    }
    await syncAuthCookies(mockUser, assignedRole);
    notifyMockAuthListeners(mockUser, mockProfile);
    return mockUser;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user profile non-blockingly with 1800ms timeout
    let role: string = assignedRole;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile?.role) {
        role = profile.role;
      }
    } catch {
      // Keep assignedRole
    }

    await syncAuthCookies(user, role);
    return user;
  } catch (error: any) {
    console.error("[Autenticación] Error real en signIn:", error);
    throw error;
  }
}

export async function signUp(name: string, email: string, password: string, username?: string): Promise<User> {
  clearAuthCookies();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_user_session');
  }

  const isExplicitAdmin = isSuperAdminEmail(email);
  const assignedRole: AppUser['role'] = isExplicitAdmin ? 'superadmin' : 'user';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user doc in Firestore (non-blocking with strict 1.8s timeout)
    try {
      const userRef = doc(db, 'users', user.uid);
      await withTimeout(setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: name,
        username: username ? username.trim().toLowerCase() : null,
        role: assignedRole,
        createdAt: serverTimestamp(),
      }), 1800);
    } catch (err) {
      console.warn("[Autenticación] Escritura de perfil en Firestore no bloqueante:", err);
    }

    await syncAuthCookies(user, assignedRole);
    return user;
  } catch (error: any) {
    console.error("[Autenticación] Error real en signUp:", error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<User> {
  clearAuthCookies();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_user_session');
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const isExplicitAdmin = isSuperAdminEmail(user.email);
    let assignedRole: AppUser['role'] = isExplicitAdmin ? 'superadmin' : 'user';

    // Ensure user profile in Firestore (non-blocking attempt with 1800ms timeout)
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await withTimeout(getDoc(userRef), 1800);

      if (!docSnap.exists()) {
        await withTimeout(setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'Usuario Lector',
          photoUrl: user.photoURL || '',
          role: assignedRole,
          createdAt: serverTimestamp(),
        }), 1800);
      } else {
        const data = docSnap.data();
        if (data.role) {
          assignedRole = data.role;
        }
      }
    } catch (e) {
      console.warn("[Autenticación] Sincronización de perfil de Google omitida por timeout/error:", e);
    }

    await syncAuthCookies(user, assignedRole);
    return user;
  } catch (error: any) {
    console.warn("Firebase Google Auth popup attempt error:", error);

    // If popup cancelled or user closed explicitly, throw error so UI displays toast
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw error;
    }

    throw error;
  }
}

export async function signOut(): Promise<void> {
  clearAuthCookies();
  if (!isIsolatedMode) {
    await firebaseSignOut(auth).catch(() => {});
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user_session');
    }
    notifyMockAuthListeners(null, null);
  }
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

  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      const isExplicitAdmin = isSuperAdminEmail(authUser.email);
      const fallbackProfile: AppUser = {
        uid: authUser.uid,
        email: authUser.email || '',
        role: isExplicitAdmin ? 'superadmin' : 'user',
        name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario Lector',
        photoUrl: authUser.photoURL || '',
        createdAt: new Date().toISOString(),
      };

      try {
        const userProfile = await getUserProfile(authUser.uid);
        const effectiveProfile = userProfile || fallbackProfile;
        await syncAuthCookies(authUser, effectiveProfile.role);
        callback(authUser, effectiveProfile);
      } catch (e) {
        console.warn("[Autenticación] AdBlocker o error detectado, usando perfil directo:", e);
        await syncAuthCookies(authUser, fallbackProfile.role);
        callback(authUser, fallbackProfile);
      }
    } else {
      clearAuthCookies();
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

  const currentFirebaseUser = auth.currentUser;
  const isExplicitAdmin = isSuperAdminEmail(currentFirebaseUser?.email);
  const fallbackProfile: AppUser = {
    uid,
    email: currentFirebaseUser?.email || '',
    role: isExplicitAdmin ? 'superadmin' : 'user',
    name: currentFirebaseUser?.displayName || currentFirebaseUser?.email?.split('@')[0] || 'Usuario Lector',
    photoUrl: currentFirebaseUser?.photoURL || '',
    createdAt: new Date().toISOString(),
  };

  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await withTimeout(getDoc(userRef), 1800);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const effectiveRole = data.role || (isSuperAdminEmail(data.email) ? 'superadmin' : 'user');
      return {
          uid,
          email: data.email || '',
          username: data.username || undefined,
          role: effectiveRole,
          photoUrl: data.photoUrl || '',
          name: data.name || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
      } as AppUser;
    }

    // Auto-recovery: Create missing profile document in Firestore (non-blocking with 1.8s timeout)
    if (currentFirebaseUser && currentFirebaseUser.uid === uid) {
      withTimeout(setDoc(userRef, {
        uid,
        email: fallbackProfile.email,
        role: fallbackProfile.role,
        name: fallbackProfile.name,
        photoUrl: fallbackProfile.photoUrl,
        createdAt: serverTimestamp(),
      }), 1800).catch(e => console.warn("[Autenticación] Escritura en Firestore omitida:", e));
    }

    return fallbackProfile;
  } catch (e) {
    console.warn("[Autenticación] Error o timeout obteniendo perfil de usuario, usando fallback de sesión:", e);
    return fallbackProfile;
  }
}

export async function getAllUsers(): Promise<AppUser[]> {
  if (isIsolatedMode) return [];
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('email'));
    const querySnapshot = await withTimeout(getDocs(q), 1800);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        return {
            uid: doc.id,
            email: data.email,
            name: data.name || '',
            username: data.username || undefined,
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

export async function updateUserRole(uid: string, newRole: 'superadmin' | 'admin' | 'editor' | 'user'): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Cambio de rol bloqueado en modo aislado.");
    return;
  }
  const userRef = doc(db, 'users', uid);
  await withTimeout(updateDoc(userRef, { role: newRole }), 1800);
}

export async function updateUserProfileData(uid: string, data: { name?: string; photoUrl?: string }): Promise<void> {
  if (isIsolatedMode) return;
  const userRef = doc(db, 'users', uid);
  await withTimeout(setDoc(userRef, data, { merge: true }), 2500);
}


'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthUserChanged } from '@/lib/auth';
import type { AppUser } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  authUser: User | null;
  userProfile: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((authUser, profile) => {
      setAuthUser(authUser);
      setUserProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

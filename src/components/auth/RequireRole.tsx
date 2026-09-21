'use client';

import { useAuth } from '@/hooks/use-auth';
import { ReactNode } from 'react';

interface RequireRoleProps {
  role: 'admin' | 'editor' | Array<'admin' | 'editor'>;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!userProfile) {
    return null;
  }

  const rolesToCheck = Array.isArray(role) ? role : [role];

  if (!rolesToCheck.includes(userProfile.role)) {
      return null;
  }

  return <>{children}</>;
}

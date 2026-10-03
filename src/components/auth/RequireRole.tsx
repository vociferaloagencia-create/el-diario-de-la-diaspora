'use client';

import { useAuth } from '@/hooks/use-auth';
import { ReactNode } from 'react';

interface RequireRoleProps {
  role: 'superadmin' | 'admin' | 'editor' | 'user' | Array<'superadmin' | 'admin' | 'editor' | 'user'>;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return null;
  }

  // Superadmin has absolute access to all administrative/editor sections
  if (userProfile.role === 'superadmin') {
    return <>{children}</>;
  }

  const rolesToCheck = Array.isArray(role) ? role : [role];

  // Admin has access to editor sections
  if (userProfile.role === 'admin' && rolesToCheck.includes('editor')) {
    return <>{children}</>;
  }

  if (!rolesToCheck.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}

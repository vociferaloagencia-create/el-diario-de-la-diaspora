'use client';

import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

export function DashboardHeader() {
  const { authUser, userProfile, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const isStaff = userProfile?.role === 'admin' || userProfile?.role === 'editor' || userProfile?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-white dark:bg-slate-900 px-4 sm:px-6 shadow-xs">
      {isStaff && <SidebarTrigger className="h-9 w-9 text-slate-700 dark:text-slate-200" />}
      <div className="flex-1" />
       <div className="flex items-center gap-4">
        {loading ? (
          <>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </>
        ) : authUser ? (
          <>
            <Link href="/dashboard/profile" className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-semibold text-sm">{userProfile?.name || userProfile?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
                </div>
                <Avatar>
                    <AvatarImage src={userProfile?.photoUrl || ''} alt={userProfile?.name || userProfile?.email || 'User'} />
                    <AvatarFallback>{getInitials(userProfile?.email)}</AvatarFallback>
                </Avatar>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}

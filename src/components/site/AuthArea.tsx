"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { RequireRole } from "../auth/RequireRole";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface AuthAreaProps {
  context: 'header' | 'footer';
}

export function AuthArea({ context }: AuthAreaProps) {
    const { authUser, userProfile, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    const getInitials = (email: string | null | undefined) => {
        if (!email) return 'U';
        return email.substring(0, 2).toUpperCase();
    };

    if (loading) {
        if (context === 'header') {
            return <Skeleton className="h-10 w-10 rounded-full" />;
        }
        return null;
    }

    if (!authUser) {
      if (context === 'footer') {
        return (
          <Button variant="link" asChild className="text-slate-400 hover:text-white p-0 h-auto font-normal">
              <Link href="/login">
                  Iniciar Sesión
              </Link>
          </Button>
        );
      }
      // In header context, render user icon linking to login
      return (
        <Link
          href="/login"
          className="p-1.5 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Iniciar Sesión / Cuenta"
          aria-label="Cuenta"
        >
          <User className="h-5 w-5" />
        </Link>
      );
    }

    
    // If user is logged in
    if (context === 'header') {
        return (
             <div>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="overflow-hidden rounded-full hover:bg-white/20">
                    <Avatar>
                        <AvatarImage src={userProfile?.photoUrl || ''} alt={userProfile?.name || userProfile?.email || 'User'} />
                        <AvatarFallback className="bg-white/20 text-white">{getInitials(userProfile?.email)}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{userProfile?.name || userProfile?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                    </Link>
                    </DropdownMenuItem>
                    <RequireRole role={['admin', 'editor']}>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Panel
                            </Link>
                        </DropdownMenuItem>
                    </RequireRole>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
             </div>
        );
    }

    // In footer context, render nothing if logged in
    return null;
}

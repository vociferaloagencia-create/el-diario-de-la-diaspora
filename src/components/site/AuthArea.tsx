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

    if (loading && !authUser) {
        if (context === 'footer') {
            return null;
        }
        return (
          <div className="h-9 w-24 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse shrink-0" />
        );
    }

    if (!authUser) {
      if (context === 'footer') {
        return (
          <div className="flex items-center gap-3 text-xs">
            <Button variant="link" asChild className="text-slate-400 hover:text-white p-0 h-auto font-normal">
              <Link href="/login">
                <span className="fr-acceder-hide">Acceder</span>
                <span className="fr-acceder-show notranslate">Se connecter</span>
              </Link>
            </Button>
          </div>
        );
      }
      // In header context, render explicit Acceder matching Suscribete pill geometry
      return (
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-full px-4 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 hover:text-primary hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-all gap-1.5 shadow-xs"
          >
            <Link
              href="/login"
              title="Acceder"
              aria-label="Acceder"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span>
                <span className="fr-acceder-hide">Acceder</span>
                <span className="fr-acceder-show notranslate">Se connecter</span>
              </span>
            </Link>
          </Button>
        </div>
      );
    }

    
    // If user is logged in
    if (context === 'header') {
        return (
             <div>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={userProfile?.photoUrl || ''} alt={userProfile?.name || userProfile?.email || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">{getInitials(userProfile?.name || userProfile?.email)}</AvatarFallback>
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

    return null;
}

'use client';
import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { usePathname, redirect } from 'next/navigation';

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
    const { role, loading } = useUserRole();
    const pathname = usePathname();
    
    if (loading) {
        return (
             <div className="flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        );
    }
    
    // El editor solo puede acceder a artículos y su perfil
    if (role === 'editor' && !pathname.startsWith('/dashboard/articles') && pathname !== '/dashboard/profile') {
        return (
            <div className="flex-grow flex items-center justify-center">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Acceso Restringido</AlertTitle>
                    <AlertDescription>
                        No tienes los permisos necesarios para ver esta sección.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Los administradores pueden ver todo
    if (role === 'admin') {
      return <>{children}</>;
    }

    // Si es un editor y está en una página permitida
    if (role === 'editor' && (pathname.startsWith('/dashboard/articles') || pathname === '/dashboard/profile')) {
        return <>{children}</>;
    }
    
    // Redirigir a la página de no-acceso para cualquier otro caso
    redirect('/no-access');
}

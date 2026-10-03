"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { signInWithGoogle, updateUserRole, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const { authUser, userProfile, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleActivate = async () => {
    setIsSubmitting(true);
    try {
      if (!authUser) {
        // Needs to login first
        const user = await signInWithGoogle();
        await updateUserRole(user.uid, 'superadmin');
        toast({ title: 'Éxito', description: 'Permisos de Super Administrador activados.' });
        window.location.href = '/dashboard';
      } else {
        await updateUserRole(authUser.uid, 'superadmin');
        toast({ title: 'Éxito', description: 'Tus permisos han sido elevados a Super Administrador.' });
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Error al activar', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    await signOut();
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl border-red-900 bg-slate-900 text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-500">Acceso Restringido</CardTitle>
          <CardDescription className="text-slate-400">Portal de activación de Super Administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-center">
          {authUser ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Estás conectado como: <br />
                <strong className="text-white">{authUser.email}</strong>
              </p>
              {userProfile?.role === 'superadmin' ? (
                <div className="p-3 bg-green-900/30 text-green-400 rounded-lg text-sm font-semibold border border-green-900/50">
                  Ya eres Super Administrador.
                </div>
              ) : (
                <Button 
                  onClick={handleActivate} 
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  Conceder Permisos a esta cuenta
                </Button>
              )}
              
              <Button variant="ghost" onClick={handleLogout} disabled={isSubmitting} className="text-slate-400 hover:text-white">
                Cerrar sesión y usar otra cuenta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Para activar el acceso maestro, inicia sesión con Google. El sistema elevará inmediatamente los privilegios de la cuenta seleccionada.
              </p>
              <Button 
                onClick={handleActivate} 
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                Activar usando Google
              </Button>
            </div>
          )}

          <div className="pt-4">
            <Button variant="link" onClick={() => router.push('/')} className="text-slate-500 hover:text-slate-300">
              ← Volver a la portada
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

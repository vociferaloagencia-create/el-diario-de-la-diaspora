'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Shield, Calendar, Mail, Fingerprint } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, loading } = useAuth();

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (date: any) => {
      if (!date) return 'N/A';
      if (date.toDate) {
          return date.toDate().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (loading) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No se pudo cargar el perfil del usuario.</p>
      </div>
    );
  }

  const details = [
    { label: "Correo electrónico", value: userProfile.email, icon: Mail },
    { label: "ID de usuario", value: userProfile.uid, icon: Fingerprint },
    { label: "Miembro desde", value: formatDate(userProfile.createdAt), icon: Calendar },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Información de tu cuenta y acceso.</p>
        </div>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                <AvatarImage src={userProfile.photoUrl || ''} />
                <AvatarFallback className="text-lg font-semibold">{getInitials(userProfile.email)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <h2 className="text-2xl font-bold">{userProfile.name || 'Perfil de Usuario'}</h2>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <Badge variant={userProfile.role === 'admin' || userProfile.role === 'superadmin' ? 'default' : 'secondary'} className="mt-1 capitalize gap-1.5">
                  <Shield className="h-3 w-3" />
                  {userProfile.role === 'admin' ? 'Administrador' : userProfile.role === 'editor' ? 'Editor' : userProfile.role === 'superadmin' ? 'Super Administrador' : 'Lector'}
                </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Detalles de la cuenta</h3>
          <div className="space-y-4">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <detail.icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{detail.label}</p>
                  <p className="text-sm font-medium break-all">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

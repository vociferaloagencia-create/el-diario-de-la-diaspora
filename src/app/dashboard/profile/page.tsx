'use client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Shield, Calendar, Mail, Fingerprint, Camera, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/firestore';
import { updateUserProfileData } from '@/lib/auth';

export default function ProfilePage() {
  const { userProfile, loading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.name || '');
      setPhotoUrl(userProfile.photoUrl || '');
    }
  }, [userProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    toast({ title: "Subiendo foto...", description: "Por favor espera un momento." });
    try {
      const url = await uploadImage(file);
      setPhotoUrl(url);
      toast({ title: "Foto subida", description: "Haz clic en 'Guardar Cambios' para confirmar." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo subir la foto.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setIsSaving(true);
    try {
      await updateUserProfileData(userProfile.uid, {
        name: displayName.trim(),
        photoUrl: photoUrl.trim(),
      });
      toast({ title: "Perfil actualizado", description: "Tus datos se guardaron correctamente." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
          <p className="text-sm text-muted-foreground">Información de tu cuenta y firma de autor.</p>
        </div>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 sm:p-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                <AvatarImage src={photoUrl || userProfile.photoUrl || ''} />
                <AvatarFallback className="text-lg font-semibold">{getInitials(userProfile.email)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
                <h2 className="text-2xl font-bold">{displayName || userProfile.name || 'Perfil de Usuario'}</h2>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <Badge variant={userProfile.role === 'admin' || userProfile.role === 'superadmin' ? 'default' : 'secondary'} className="mt-1 capitalize gap-1.5">
                  <Shield className="h-3 w-3" />
                  {userProfile.role === 'admin' ? 'Administrador' : userProfile.role === 'editor' ? 'Editor' : userProfile.role === 'superadmin' ? 'Super Administrador' : 'Lector'}
                </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-4 p-4 rounded-xl border bg-muted/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Camera className="w-4 h-4" /> Editar Datos de Redactor / Firma
            </h3>
            <p className="text-xs text-muted-foreground">
              Esta foto y nombre aparecerán automáticamente en el círculo superior de los artículos que redactes.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Nombre del Periodista / Autor</label>
              <Input
                placeholder="ej. Eustache Sanon o Tu Nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Foto de Perfil (Círculo)</label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  className="text-xs file:text-xs"
                />
                {photoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive h-8 px-2"
                    onClick={() => setPhotoUrl('')}
                  >
                    Quitar
                  </Button>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSaving || isUploading} className="gap-2 w-full sm:w-auto">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>

          <div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { authUser, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && authUser) {
      const isExplicitAdmin = authUser.email?.toLowerCase() === 'admin@eldiariodeladiaspora.com';
      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'editor' || isExplicitAdmin;
      const defaultTarget = isAdmin ? '/dashboard' : '/dashboard/profile';
      const target = searchParams.get('redirect') || defaultTarget;
      router.push(target);
    }
  }, [loading, authUser, userProfile, router, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user_session');
    }
  }, []);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: typeof window !== 'undefined' ? (localStorage.getItem('remember_user_login') || '') : '',
      password: '',
      rememberMe: false,
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function handleGoogleLogin() {
    setIsGoogleSubmitting(true);
    try {
      const user = await signInWithGoogle();
      toast({
        title: 'Acceso con Google Exitoso',
        description: `¡Bienvenido ${user.displayName || 'Usuario'}!`,
      });
      const isExplicitAdmin = user.email?.toLowerCase() === 'admin@eldiariodeladiaspora.com';
      const defaultTarget = isExplicitAdmin ? '/dashboard' : '/dashboard/profile';
      const redirectUrl = searchParams.get('redirect') || defaultTarget;
      window.location.href = redirectUrl;
    } catch (error: any) {
      let description = error.message || 'Error al iniciar sesión con Google.';
      if (error.code === 'auth/popup-closed-by-user') {
        description = 'El inicio de sesión fue cancelado.';
      }
      toast({
        title: 'Error de Autenticación',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      if (typeof window !== 'undefined' && values.rememberMe) {
        localStorage.setItem('remember_user_login', values.email);
      }
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: "¡Bienvenido de vuelta!",
      });
      const isExplicitAdmin = values.email.toLowerCase() === 'admin@eldiariodeladiaspora.com';
      const redirectUrl = searchParams.get('redirect') || (isExplicitAdmin ? '/dashboard' : '/dashboard/profile');
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error(error);
      let desc = error.message || 'Ocurrió un error inesperado.';
      let alertTitle = 'Fallo el Inicio de Sesión';
      let alertVariant: 'default' | 'destructive' = 'destructive';

      if (error.code === 'auth/invalid-credential' || desc.includes('auth/invalid-credential')) {
        alertTitle = 'Verifica tus datos de acceso';
        desc = 'La contraseña o el correo no coinciden. Si es tu primera vez aquí, usa la pestaña "Registrarse". Si tu cuenta es de Google, presiona "Acceder con Google" más abajo.';
        alertVariant = 'default'; // Elegante, color neutro en lugar de rojo
      } else if (error.code === 'auth/too-many-requests' || desc.includes('too-many-requests')) {
        desc = 'Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.';
      }
      
      toast({
        title: alertTitle,
        description: desc,
        variant: alertVariant,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSignUpSubmit(values: z.infer<typeof signUpSchema>) {
    setIsSubmitting(true);
    try {
      await signUp(values.name, values.email, values.password);
      toast({
        title: '¡Cuenta Creada Exitosamente!',
        description: `¡Bienvenido ${values.name}! Tu cuenta de lector ha sido creada.`,
      });
      const isExplicitAdmin = values.email.toLowerCase() === 'admin@eldiariodeladiaspora.com';
      const redirectUrl = searchParams.get('redirect') || (isExplicitAdmin ? '/dashboard' : '/dashboard/profile');
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error al Crear Cuenta',
        description: error.message || 'No se pudo completar el registro.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold font-headline">El Diario de la Diáspora</CardTitle>
        <CardDescription>Accede o crea tu cuenta para disfrutar del periódico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="font-bold uppercase tracking-wider text-xs">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register" className="font-bold uppercase tracking-wider text-xs">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} className="h-11 text-sm bg-slate-50 dark:bg-slate-900/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Contraseña</FormLabel>
                        <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="h-11 text-sm bg-slate-50 dark:bg-slate-900/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 pt-1">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                        Recordarme en este dispositivo
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full font-bold h-11 bg-primary hover:bg-primary/90 text-white uppercase tracking-wider text-sm mt-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} className="h-11 text-sm bg-slate-50 dark:bg-slate-900/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} className="h-11 text-sm bg-slate-50 dark:bg-slate-900/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="h-11 text-sm bg-slate-50 dark:bg-slate-900/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} className="h-11 text-sm bg-slate-50 dark:bg-slate-900/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold h-11 bg-primary hover:bg-primary/90 text-white uppercase tracking-wider text-sm mt-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <UserPlus className="mr-2 h-4 w-4" /> Crear Cuenta
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-card px-3 text-slate-400">O Ingresa Rápidamente</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 h-11 text-sm shadow-sm"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isGoogleSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Acceder con Google
          </Button>
          
          
        </div>

        <div className="mt-4 text-center">
          <Link href="/">
            <Button variant="link" className="text-xs text-slate-500 hover:text-primary font-medium">← Volver a la portada</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}

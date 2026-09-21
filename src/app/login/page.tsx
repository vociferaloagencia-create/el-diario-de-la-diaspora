'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'admin@eldiariodeladiaspora.com',
      password: 'admin123456',
    },
  });

  async function handleQuickAdminLogin() {
    setIsSubmitting(true);
    try {
      await signIn('admin@eldiariodeladiaspora.com', 'admin123456');
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: '¡Bienvenido como Administrador!',
      });
      const redirectUrl = searchParams.get('redirect') || '/dashboard/articles';
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al iniciar sesión.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: "¡Bienvenido de vuelta!",
      });
      const redirectUrl = searchParams.get('redirect') || '/dashboard/articles';
      router.push(redirectUrl);
      router.refresh(); // Force a refresh to update server-side session state
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Fallo el Inicio de Sesión',
        description: error.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
      <Card className="w-full max-w-sm shadow-md border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold font-headline">Bienvenido de Vuelta</CardTitle>
          <CardDescription>Accede con tu cuenta editorial de El Diario de la Diáspora</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@eldiariodeladiaspora.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O acceso directo</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full font-semibold border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            onClick={handleQuickAdminLogin}
            disabled={isSubmitting}
          >
            Acceder como Administrador (Demo)
          </Button>

          <div className="mt-4 text-center text-sm">
            <Link href="/" passHref>
              <Button variant="link" className="text-xs text-muted-foreground hover:text-primary">← Volver a la portada</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
  )
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

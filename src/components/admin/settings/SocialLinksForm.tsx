"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { SocialLinksSettings } from "@/lib/types";
import { updateSiteSettings } from "@/lib/firestore";
import { useState } from "react";
import { Loader2, Share2, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const socialMediaSchema = z.object({
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  tiktokUrl: z.string().url().optional().or(z.literal('')),
});

type SocialMediaFormValues = z.infer<typeof socialMediaSchema>;

interface SocialLinksFormProps {
  initialData: SocialLinksSettings;
}

export function SocialLinksForm({ initialData }: SocialLinksFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<SocialMediaFormValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      facebookUrl: initialData.facebookUrl || "",
      twitterUrl: initialData.twitterUrl || "",
      instagramUrl: initialData.instagramUrl || "",
      tiktokUrl: initialData.tiktokUrl || "",
    },
  });

  async function onSubmit(values: SocialMediaFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ socialLinks: values });
      toast({
        title: '¡Ajustes actualizados!',
        description: `Tus enlaces de redes sociales han sido guardados.`,
      });
    } catch (error) {
      console.error(`Error actualizando redes sociales:`, error);
      toast({
        title: 'Fallo al actualizar',
        description: `Hubo un error al guardar tus ajustes.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Redes Sociales</h2>
          <p className="text-sm text-muted-foreground">Añade los enlaces a tus perfiles de redes sociales.</p>
        </div>
      </div>

    <Card className="w-full overflow-hidden">
        <CardContent className="pt-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-600" /> Facebook</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} placeholder="https://facebook.com/TuPagina" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-sky-500" /> Twitter / X</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} placeholder="https://twitter.com/TuUsuario"/></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-pink-600" /> Instagram</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} placeholder="https://instagram.com/TuUsuario" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-800 dark:text-gray-200" /> TikTok</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} placeholder="https://www.tiktok.com/@TuUsuario" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormDescription className="text-sm text-muted-foreground">
                  Estas direcciones se usarán para mostrar los iconos de redes sociales en tu sitio.
                </FormDescription>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar Enlaces
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
    </div>
  );
}

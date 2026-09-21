
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BrandingSettings } from "@/lib/types";
import { updateSiteSettings, uploadImage } from "@/lib/firestore";
import { useState } from "react";
import { Loader2, Palette } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const brandingSchema = z.object({
  siteName: z.string().min(1, "El nombre del sitio es obligatorio"),
  tagline: z.string().optional(),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  logoWidth: z.coerce.number().min(10, "El ancho debe ser al menos 10").optional(),
  logoHeight: z.coerce.number().min(10, "La altura debe ser al menos 10").optional(),
  logoFooterUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  logoFooterWidth: z.coerce.number().min(10, "El ancho debe ser al menos 10").optional(),
  logoFooterHeight: z.coerce.number().min(10, "La altura debe ser al menos 10").optional(),
  showSiteNameInHeader: z.boolean().default(true),
  showSiteNameInFooter: z.boolean().default(true),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface BrandingFormProps {
  initialData: BrandingSettings;
}

export function BrandingForm({ initialData }: BrandingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFooter, setIsUploadingFooter] = useState(false);
  const { toast } = useToast();

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      siteName: initialData.siteName || "",
      tagline: initialData.tagline || "",
      logoUrl: initialData.logoUrl || "",
      logoWidth: initialData.logoWidth || 150,
      logoHeight: initialData.logoHeight || 40,
      logoFooterUrl: initialData.logoFooterUrl || "",
      logoFooterWidth: initialData.logoFooterWidth || 150,
      logoFooterHeight: initialData.logoFooterHeight || 40,
      showSiteNameInHeader: initialData.showSiteNameInHeader === undefined ? true : initialData.showSiteNameInHeader,
      showSiteNameInFooter: initialData.showSiteNameInFooter === undefined ? true : initialData.showSiteNameInFooter,
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const downloadURL = await uploadImage(file);
      form.setValue('logoUrl', downloadURL);
    } catch (error) {
      console.error('Error al subir el logo:', error);
      form.setError('logoUrl', { message: 'La subida falló. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFooterLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFooter(true);
    try {
      const downloadURL = await uploadImage(file);
      form.setValue('logoFooterUrl', downloadURL);
    } catch (error) {
      console.error('Error al subir el logo del footer:', error);
      form.setError('logoFooterUrl', { message: 'La subida falló. Por favor, inténtalo de nuevo.' });
    } finally {
      setIsUploadingFooter(false);
    }
  };

  async function onSubmit(values: BrandingFormValues) {
    setIsSubmitting(true);
    try {
      const settingsToUpdate = { branding: values };
      await updateSiteSettings(settingsToUpdate);
      toast({
        title: '¡Ajustes actualizados!',
        description: `Tus ajustes de marca han sido guardados.`,
      });
    } catch (error) {
      console.error(`Error actualizando la marca:`, error);
      toast({
        title: 'Fallo al actualizar',
        description: `Hubo un error al guardar tus ajustes de marca.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isWorking = isSubmitting || isUploading || isUploadingFooter;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Palette className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Marca e Identidad</h2>
          <p className="text-sm text-muted-foreground">Gestiona el nombre, eslogan y logos de tu sitio.</p>
        </div>
      </div>

    <Card className="w-full overflow-hidden">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Sitio</FormLabel>
                  <FormControl>
                    <Input placeholder="NewsFlash" {...field} />
                  </FormControl>
                  <FormDescription>Este es el nombre que aparece en el encabezado y en la pestaña del navegador.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eslogan</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu dosis diaria de noticias" {...field} value={field.value || ''}/>
                  </FormControl>
                   <FormDescription>Una frase corta y pegadiza que describe tu sitio.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <h3 className="text-lg font-medium">Logo de la Cabecera</h3>
            <div className="space-y-2">
                {form.watch('logoUrl') && (
                    <div className="mt-2">
                        <FormLabel>Vista Previa del Logo</FormLabel>
                        <div className="relative w-64 h-32 bg-slate-100 dark:bg-slate-800 rounded-md mt-1 overflow-hidden">
                            <Image src={form.watch('logoUrl')} alt="Logo actual" fill className="object-contain p-2"/>
                        </div>
                    </div>
                )}
                <FormItem>
                    <FormLabel>Subir Logo</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Input type="file" onChange={handleLogoUpload} accept="image/png, image/jpeg, image/svg+xml" className="max-w-xs" disabled={isWorking} />
                            {isUploading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="logoWidth"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ancho del Logo (px)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="logoHeight"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Alto del Logo (px)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <Separator />

            <h3 className="text-lg font-medium">Logo del Pie de Página</h3>
            <div className="space-y-2">
                {form.watch('logoFooterUrl') && (
                    <div className="mt-2">
                        <FormLabel>Vista Previa del Logo del Pie de Página</FormLabel>
                        <div className="relative w-64 h-32 bg-slate-100 dark:bg-slate-800 rounded-md mt-1 overflow-hidden">
                            <Image src={form.watch('logoFooterUrl')} alt="Logo actual del pie de página" fill className="object-contain p-2"/>
                        </div>
                    </div>
                )}
                <FormItem>
                    <FormLabel>Subir Logo para el Pie de Página</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Input type="file" onChange={handleFooterLogoUpload} accept="image/png, image/jpeg, image/svg+xml" className="max-w-xs" disabled={isWorking} />
                            {isUploadingFooter && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                        </div>
                    </FormControl>
                    <FormDescription>Si se deja en blanco, se usará el logo de la cabecera.</FormDescription>
                    <FormMessage />
                </FormItem>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="logoFooterWidth"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ancho del Logo del Pie de Página (px)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="logoFooterHeight"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Alto del Logo del Pie de Página (px)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <Separator />
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="showSiteNameInHeader" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Mostrar nombre en cabecera</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="showSiteNameInFooter" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Mostrar nombre en pie de página</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isWorking} size="lg">
                {isWorking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Guardando..." : (isUploading || isUploadingFooter) ? "Subiendo..." : "Guardar Marca"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}

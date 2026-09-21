"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AdsSettings } from "@/lib/types";
import { updateSiteSettings, uploadImage } from "@/lib/firestore";
import { useState } from "react";
import { Loader2, Monitor, PanelRight, RectangleVertical, FileText, ExternalLink, Upload } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

const adSlotSchema = z.object({
    enabled: z.boolean(),
    imageUrl: z.string().optional().or(z.literal('')),
    linkUrl: z.string().optional().or(z.literal('')),
});

const popupAdSchema = adSlotSchema.extend({
  duration: z.coerce.number().min(0).optional(),
});

const adsSchema = z.object({
  homeHeroSide: adSlotSchema.optional(),
  sidebarMiddle: adSlotSchema.optional(),
  sidebarBottom: adSlotSchema.optional(),
  homeHorizontal: adSlotSchema.optional(),
  articleBottom: adSlotSchema.optional(),
  popup: popupAdSchema.optional(),
  footerHorizontal: adSlotSchema.optional(),
  homeVerticalLeft: adSlotSchema.optional(),
  homeVerticalLeftBottom: adSlotSchema.optional(),
  inArticle: adSlotSchema.optional(),
});

type AdsFormValues = z.infer<typeof adsSchema>;

interface AdsSettingsFormProps {
  initialData: AdsSettings;
}

const defaultAdSettings = {
    enabled: false,
    imageUrl: '',
    linkUrl: '',
}

const defaultPopupSettings = {
    ...defaultAdSettings,
    duration: 5,
}

const AdSlotFields = ({ form, fieldName, label, description }: { form: any, fieldName: `homeHeroSide` | `sidebarMiddle` | `sidebarBottom` | `homeHorizontal` | `articleBottom` | `popup` | `footerHorizontal` | `homeVerticalLeft` | `homeVerticalLeftBottom` | `inArticle`, label: string, description: string }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const downloadURL = await uploadImage(file);
      form.setValue(`${fieldName}.imageUrl`, downloadURL);
    } catch (error) {
      console.error(`Error al subir la imagen del anuncio:`, error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-medium">{label}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <FormField control={form.control} name={`${fieldName}.enabled`} render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormLabel className="text-sm cursor-pointer">Activo</FormLabel>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />
      </div>

      {form.watch(`${fieldName}.imageUrl`) && (
        <div className="relative w-full h-28 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border">
          <Image src={form.watch(`${fieldName}.imageUrl`)} alt="Vista previa" fill className="object-contain" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FormLabel className="text-xs text-muted-foreground mb-1 block">Imagen del anuncio</FormLabel>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="relative" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Subiendo...' : 'Subir imagen'}
              <Input type="file" onChange={handleImageUpload} accept="image/png, image/jpeg, image/gif, image/svg+xml" className="absolute inset-0 opacity-0 cursor-pointer" />
            </Button>
            {isUploading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
          </div>
        </div>
        <FormField control={form.control} name={`${fieldName}.linkUrl`} render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">Enlace de destino (opcional)</FormLabel>
            <FormControl>
              <div className="relative">
                <ExternalLink className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input {...field} value={field.value || ''} placeholder="https://ejemplo.com/anuncio" className="pl-7 text-xs" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      {fieldName === 'popup' && (
        <FormField control={form.control} name="popup.duration" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">Duración visible (segundos)</FormLabel>
            <FormControl><Input type="number" {...field} value={field.value || 5} placeholder="5" className="max-w-[120px]" /></FormControl>
          </FormItem>
        )} />
      )}
    </div>
  );
};

function AdGroupCard({ title, description, icon: Icon, children }: { title: string; description: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/30">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-6">
        {children}
      </div>
    </div>
  );
}

function AdSlotDivider() {
  return <hr className="border-dashed" />;
}

export function AdsSettingsForm({ initialData }: AdsSettingsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
  const form = useForm<AdsFormValues>({
    resolver: zodResolver(adsSchema),
    defaultValues: {
        homeHeroSide: initialData.homeHeroSide || defaultAdSettings,
        sidebarMiddle: initialData.sidebarMiddle || defaultAdSettings,
        sidebarBottom: initialData.sidebarBottom || defaultAdSettings,
        homeHorizontal: initialData.homeHorizontal || defaultAdSettings,
        articleBottom: initialData.articleBottom || defaultAdSettings,
        popup: initialData.popup || defaultPopupSettings,
        footerHorizontal: initialData.footerHorizontal || defaultAdSettings,
        homeVerticalLeft: initialData.homeVerticalLeft || defaultAdSettings,
        homeVerticalLeftBottom: initialData.homeVerticalLeftBottom || defaultAdSettings,
        inArticle: initialData.inArticle || defaultAdSettings,
    },
  });


  async function onSubmit(values: AdsFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ ads: values });
      toast({
        title: '!Ajustes actualizados!',
        description: 'Tus anuncios han sido guardados correctamente.',
      });
    } catch (error) {
      console.error('Error actualizando anuncios:', error);
      toast({
        title: 'Fallo al actualizar',
        description: 'Hubo un error al guardar tus anuncios.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Anuncios</h2>
          <p className="text-sm text-muted-foreground">Gestiona todos los espacios publicitarios de tu sitio.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AdGroupCard title="Anuncio Pop-up" description="Ventana emergente que aparece al cargar el sitio" icon={Monitor}>
            <AdSlotFields form={form} fieldName="popup" label="Pop-up" description="Aparece automaticamente al visitar el sitio" />
          </AdGroupCard>

          <AdGroupCard title="Barra Lateral" description="Anuncios en la columna lateral derecha del sitio" icon={PanelRight}>
            <AdSlotFields form={form} fieldName="homeHeroSide" label="Superior" description="Aparece en la parte superior de la barra lateral en la pagina de inicio" />
            <AdSlotDivider />
            <AdSlotFields form={form} fieldName="sidebarMiddle" label="Medio" description="Aparece en medio de la barra lateral" />
            <AdSlotDivider />
            <AdSlotFields form={form} fieldName="sidebarBottom" label="Inferior" description="Aparece al final de la barra lateral" />
          </AdGroupCard>

          <AdGroupCard title="Anuncios Verticales" description="Banners verticales en el lado izquierdo del sitio" icon={RectangleVertical}>
            <AdSlotFields form={form} fieldName="homeVerticalLeft" label="Superior izquierdo" description="Banner vertical en la parte superior izquierda" />
            <AdSlotDivider />
            <AdSlotFields form={form} fieldName="homeVerticalLeftBottom" label="Inferior izquierdo" description="Banner vertical en la parte inferior izquierda" />
          </AdGroupCard>

          <AdGroupCard title="Banners Horizontales" description="Banners anchos distribuidos en el sitio" icon={Monitor}>
            <AdSlotFields form={form} fieldName="homeHorizontal" label="Inicio" description="Banner horizontal en la pagina de inicio" />
            <AdSlotDivider />
            <AdSlotFields form={form} fieldName="articleBottom" label="Final del articulo" description="Banner que aparece al final de cada articulo" />
            <AdSlotDivider />
            <AdSlotFields form={form} fieldName="footerHorizontal" label="Sobre el pie de pagina" description="Banner horizontal justo antes del footer" />
          </AdGroupCard>

          <AdGroupCard title="Dentro del Articulo" description="Anuncio insertado entre el contenido del articulo" icon={FileText}>
            <AdSlotFields form={form} fieldName="inArticle" label="In-Article (700x350)" description="Se inserta automaticamente en medio de articulos largos" />
          </AdGroupCard>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : 'Guardar Anuncios'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

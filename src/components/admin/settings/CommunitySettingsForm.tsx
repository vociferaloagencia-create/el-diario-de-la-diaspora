"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, PlusCircle, Trash2, Image as ImageIcon, Sparkles, Upload } from "lucide-react";
import { updateSiteSettings, uploadImage } from "@/lib/firestore";
import { revalidateHomepage } from "@/app/actions";
import type { CommunitySettings } from "@/lib/types";

const communitySchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  subtitle: z.string().min(1, "El subtítulo es obligatorio"),
  bannerImage: z.string().min(1, "La imagen de portada es obligatoria"),
  logoUrl: z.string().optional(),
  logoHeight: z.coerce.number().min(30).max(250).optional(),
  values: z.array(
    z.object({
      title: z.string().min(1, "Título obligatorio"),
      desc: z.string().min(1, "Descripción obligatoria"),
    })
  ),
  gallery: z.array(
    z.object({
      title: z.string().min(1, "Título de la foto obligatorio"),
      imageUrl: z.string().min(1, "Imagen obligatoria"),
    })
  ),
});

type CommunityFormValues = z.infer<typeof communitySchema>;

interface CommunitySettingsFormProps {
  initialData?: CommunitySettings;
}

const defaultGallery = [
  { title: "Reunión Editorial", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" },
  { title: "Nuestra Sala de Redacción", imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" },
  { title: "Celebrando Metas Juntos", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" },
  { title: "El equipo completo de Diáspora", imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop" },
  { title: "Fraternidad y Unidad", imageUrl: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070&auto=format&fit=crop" },
];

export function CommunitySettingsForm({ initialData }: CommunitySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      title: initialData?.title || "Nuestra Comunidad",
      subtitle: initialData?.subtitle || "Más que un medio de comunicación, somos una familia comprometida con llevarte la mejor información todos los días.",
      bannerImage: initialData?.bannerImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
      logoUrl: initialData?.logoUrl || "/logo-footer-white.png",
      logoHeight: initialData?.logoHeight ?? 110,
      values: initialData?.values && initialData.values.length > 0 ? initialData.values : [
        { title: "Unidad", desc: "Trabajamos juntos como una familia para traer la verdad a nuestra gente." },
        { title: "Pasión", desc: "Cada historia se cuenta con el corazón y el respeto que merece la diáspora." },
        { title: "Compromiso", desc: "Nuestra meta diaria es informar con objetividad, rapidez y precisión." },
        { title: "Vocación", desc: "El periodismo no es solo un trabajo para nosotros, es nuestro estilo de vida." },
      ],
      gallery: initialData?.gallery && initialData.gallery.length > 0 ? initialData.gallery : defaultGallery,
    },
  });

  const { fields: valueFields, append: appendValue, remove: removeValue } = useFieldArray({
    control: form.control,
    name: "values",
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "gallery",
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImage(file);
      form.setValue("logoUrl", url);
      toast({ title: "Logo de comunidad subido con éxito" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al subir el logo", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const url = await uploadImage(file);
      form.setValue("bannerImage", url);
      toast({ title: "Imagen de portada subida con éxito" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al subir la imagen", variant: "destructive" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleGalleryPhotoUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingGalleryIndex(index);
    try {
      const url = await uploadImage(file);
      form.setValue(`gallery.${index}.imageUrl`, url);
      toast({ title: "Foto subida con éxito" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error al subir la foto", variant: "destructive" });
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  async function onSubmit(values: CommunityFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ community: values });
      await revalidateHomepage();
      toast({
        title: "Página de Comunidad actualizada",
        description: "Los cambios se guardaron y se reflejan en el portal.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios en la comunidad.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isWorking = isSubmitting || uploadingLogo || uploadingBanner || uploadingGalleryIndex !== null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo de la Comunidad con Barra Deslizante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Logo de Nuestra Comunidad
            </CardTitle>
            <CardDescription>
              Configura el logo oficial y su tamaño proporcional mediante la barra deslizante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {form.watch("logoUrl") && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="text-white text-xs font-semibold uppercase tracking-wider">Vista Previa del Logo</FormLabel>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono font-bold">
                    {form.watch("logoHeight") || 110}px de altura
                  </span>
                </div>
                <div className="flex items-center justify-center min-h-[110px] p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 overflow-x-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.watch("logoUrl")}
                    alt="Logo comunidad"
                    style={{ height: `${form.watch("logoHeight") || 110}px` }}
                    className="w-auto object-contain transition-all duration-100 drop-shadow-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                  <Upload className="h-4 w-4" />
                  Subir Nuevo Logo desde PC
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isWorking}
                  className="hidden"
                />
              </label>
              {uploadingLogo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Subiendo logo...
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="logoHeight"
              render={({ field }) => (
                <FormItem className="space-y-3 bg-muted/30 p-4 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel className="font-semibold text-base">Tamaño del Logo (Barra Deslizante)</FormLabel>
                      <FormDescription>Arrastra la barra para agrandar o achicar el logo proporcionalmente.</FormDescription>
                    </div>
                    <span className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full font-mono">
                      {field.value || 110} px
                    </span>
                  </div>
                  <FormControl>
                    <input
                      type="range"
                      min="50"
                      max="220"
                      step="2"
                      value={field.value || 110}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>50px (Pequeño)</span>
                    <span>110px (Recomendado)</span>
                    <span>220px (Extra Grande)</span>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Encabezado y Portada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Textos y Fondo de Portada</CardTitle>
            <CardDescription>
              Configura el título, subtítulo e imagen de fondo para la sección /comunidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Principal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nuestra Comunidad" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo o Misión</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Descripción breve del equipo..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 pt-2">
              <FormLabel>Foto de Fondo de Portada</FormLabel>
              {form.watch("bannerImage") && (
                <div className="relative w-full max-w-md h-36 rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.watch("bannerImage")}
                    alt="Vista previa de portada"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-xs hover:opacity-90 transition-opacity">
                    <Upload className="h-3.5 w-3.5" />
                    Cambiar Fondo desde tu PC
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={isWorking}
                    className="hidden"
                  />
                </label>
                {uploadingBanner && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Subiendo imagen...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pilares y Valores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Valores del Equipo
              </CardTitle>
              <CardDescription>Tarjetas con los principios de la redacción.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendValue({ title: "", desc: "" })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Valor
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {valueFields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex-1 space-y-2">
                  <Input
                    {...form.register(`values.${index}.title` as const)}
                    placeholder="Título del valor (ej: Compromiso)"
                    className="font-medium"
                  />
                  <Input
                    {...form.register(`values.${index}.desc` as const)}
                    placeholder="Descripción breve..."
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => removeValue(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Galería Fotográfica Completa (5 Fotos) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                Galería Fotográfica ({galleryFields.length} Fotos)
              </CardTitle>
              <CardDescription>Sube fotografías reales directamente desde tu computadora.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendGallery({ title: "", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Foto
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {galleryFields.map((fieldItem, index) => {
              const currentImg = form.watch(`gallery.${index}.imageUrl`);
              const isUploadingThis = uploadingGalleryIndex === index;

              return (
                <div key={fieldItem.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border bg-muted/20">
                  {currentImg && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border shrink-0 bg-slate-100 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentImg}
                        alt="Foto de galería"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-3 w-full">
                    <Input
                      {...form.register(`gallery.${index}.title` as const)}
                      placeholder="Título o pie de foto (ej: Sala de redacción)"
                      className="font-medium"
                    />

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors">
                          <Upload className="h-3.5 w-3.5" />
                          Cambiar Foto desde PC
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleGalleryPhotoUpload(index, e)}
                          disabled={isWorking}
                          className="hidden"
                        />
                      </label>
                      {isUploadingThis && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          Subiendo...
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 shrink-0 self-start sm:self-center"
                    onClick={() => removeGallery(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isWorking} className="min-w-[160px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

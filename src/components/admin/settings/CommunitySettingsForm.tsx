"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, PlusCircle, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { updateSiteSettings } from "@/lib/firestore";
import { revalidateHomepage } from "@/app/actions";
import type { CommunitySettings } from "@/lib/types";
import Image from "next/image";

const communitySchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  subtitle: z.string().min(1, "El subtítulo es obligatorio"),
  bannerImage: z.string().min(1, "La imagen de portada es obligatoria"),
  values: z.array(
    z.object({
      title: z.string().min(1, "Título obligatorio"),
      desc: z.string().min(1, "Descripción obligatoria"),
    })
  ),
  gallery: z.array(
    z.object({
      title: z.string().min(1, "Título de la foto obligatorio"),
      imageUrl: z.string().min(1, "URL de la imagen obligatoria"),
    })
  ),
});

type CommunityFormValues = z.infer<typeof communitySchema>;

interface CommunitySettingsFormProps {
  initialData?: CommunitySettings;
}

export function CommunitySettingsForm({ initialData }: CommunitySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      title: initialData?.title || "Nuestra Comunidad",
      subtitle: initialData?.subtitle || "Más que un medio de comunicación, somos una familia comprometida con llevarte la mejor información todos los días.",
      bannerImage: initialData?.bannerImage || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
      values: initialData?.values && initialData.values.length > 0 ? initialData.values : [
        { title: "Unidad", desc: "Trabajamos juntos como una familia para traer la verdad a nuestra gente." },
        { title: "Pasión", desc: "Cada historia se cuenta con el corazón y el respeto que merece la diáspora." },
        { title: "Compromiso", desc: "Nuestra meta diaria es informar con objetividad, rapidez y precisión." },
        { title: "Vocación", desc: "El periodismo no es solo un trabajo para nosotros, es nuestro estilo de vida." },
      ],
      gallery: initialData?.gallery && initialData.gallery.length > 0 ? initialData.gallery : [
        { title: "Reunión Editorial", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" },
        { title: "Nuestra Sala de Redacción", imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" },
        { title: "Celebrando Metas Juntos", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" },
      ],
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Encabezado Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Cabecera y Portada de Nuestra Comunidad
            </CardTitle>
            <CardDescription>
              Configura el título, la descripción y la imagen principal de fondo para la página /comunidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <FormField
              control={form.control}
              name="bannerImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Imagen de Fondo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://ejemplo.com/fondo.jpg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

        {/* Galería Fotográfica */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                Galería Corporativa de Fotos
              </CardTitle>
              <CardDescription>Fotografías que muestran el equipo y los hitos.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendGallery({ title: "", imageUrl: "" })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Foto
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {galleryFields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex-1 space-y-2">
                  <Input
                    {...form.register(`gallery.${index}.title` as const)}
                    placeholder="Pie de foto / Título"
                    className="font-medium"
                  />
                  <Input
                    {...form.register(`gallery.${index}.imageUrl` as const)}
                    placeholder="URL de la imagen (https://...)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => removeGallery(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
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

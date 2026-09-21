
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { addArticle, uploadImage } from "@/lib/firestore";
import type { Category, Article } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";


const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(10, {
    message: "El título debe tener al menos 10 caracteres.",
  }).max(100, {
    message: "El título no debe exceder los 100 caracteres.",
  }),
  category: z.string().optional(),
  content: z.string().min(50, {
    message: "El contenido debe tener al menos 50 caracteres.",
  }),
  imageUrl: z.string().optional(),
});

interface SubmitFormProps {
  categories: Category[];
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authUser, userProfile } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (imageFile) {
      const handleUpload = async () => {
        setIsUploading(true);
        toast({ title: "Subiendo imagen...", description: "Por favor, espera." });
        try {
          const downloadURL = await uploadImage(imageFile);
          form.setValue('imageUrl', downloadURL, { shouldValidate: true });
          toast({ title: "Imagen subida", description: "La imagen se ha subido correctamente." });
        } catch (error) {
          toast({ variant: 'destructive', title: "Error", description: "No se pudo subir la imagen." });
          console.error(error);
        } finally {
          setIsUploading(false);
          setImageFile(null);
        }
      };
      handleUpload();
    }
  }, [imageFile, form, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!authUser || !userProfile) {
        toast({ title: "Error de Autenticación", description: "Debes iniciar sesión para enviar un artículo.", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    try {
      const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const categoryId = values.category || 'sin-categoria';

      const newArticle: Omit<Article, '_id' | 'id'> = {
        title: values.title,
        slug: slug,
        summary: values.content.substring(0, 150),
        content: values.content,
        categoryId: categoryId,
        subCategoryId: null,
        authorId: userProfile.uid,
        heroImageUrl: values.imageUrl || '',
        thumbnailUrl: values.imageUrl || '',
        status: "published",
        publishedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        readingTimeMinutes: Math.ceil(values.content.split(' ').length / 200),
        tags: values.category ? [values.category] : [],
        allowComments: true,
        showOnMostRead: false,
        mostReadOrder: null,
        isMainHero: false,
        heroOrder: undefined,
      };

      toast({ title: "Publicando artículo...", description: "Esto tardará solo un momento." });
      await addArticle(newArticle);

      toast({
        title: "¡Artículo Enviado!",
        description: "Tu artículo ha sido publicado con éxito.",
      });
      
      router.push('/');
      router.refresh();

    } catch (error) {
      console.error("Error al enviar el artículo: ", error);
      toast({
        title: "Envío Fallido",
        description: "Hubo un error al enviar tu artículo. Revisa la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!authUser) {
      return (
          <Alert variant="destructive">
              <AlertTitle>Autenticación Requerida</AlertTitle>
              <AlertDescription>
                  Debes iniciar sesión para enviar un artículo. Por favor,{' '}
                   <Link href="/login" className="font-bold underline">
                      Inicia Sesión
                   </Link>
                   .
              </AlertDescription>
          </Alert>
      )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Escribe un título atractivo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.filter(c => c.isVisible).map(cat => (
                        <SelectItem key={cat._id} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe tu artículo aquí..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Imagen Destacada (Opcional)</FormLabel>
              {form.watch('imageUrl') && (
                  <div className="mt-2">
                      <img src={form.watch('imageUrl')} alt="Vista previa" className="w-full h-auto rounded-md" />
                  </div>
              )}
              <FormControl>
                <Input 
                  type="file" 
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                  disabled={isUploading}
                />
              </FormControl>
              <FormDescription>
                Solo se admiten formatos .jpg, .png y .webp.
              </FormDescription>
              <FormMessage />
            </FormItem>


            <Button type="submit" disabled={isSubmitting || isUploading} className="w-full">
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Enviando...' : isUploading ? 'Subiendo...' : 'Enviar Artículo'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

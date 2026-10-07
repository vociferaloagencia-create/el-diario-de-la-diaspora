
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Loader2, PlusCircle, Settings, Image as ImageIcon, Video, Info, Tag, X, User, Calendar, Edit2, Check } from "lucide-react";
import { addArticle, updateArticle, uploadImage, uploadVideo, addCategory, getAllArticles } from "@/lib/firestore";
import { revalidateHomepage } from "@/app/actions";
import type { Category, Article } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Editor } from "@/components/ui/editor";


const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres.").max(300, "El título no debe exceder los 300 caracteres."),
  summary: z.string().min(5, "El resumen debe tener al menos 5 caracteres.").max(1000, "El resumen no debe exceder los 1000 caracteres."),
  categoryId: z.string({ required_error: "Debes seleccionar una categoría." }),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string().optional(),
  authorName: z.string().optional().or(z.literal('')),
  authorRole: z.string().optional().or(z.literal('')),
  authorPhotoUrl: z.string().optional().or(z.literal('')),
  heroImageUrl: z.string().optional().or(z.literal('')),
  imageCaption: z.string().optional().or(z.literal('')),
  heroVideoUrl: z.string().optional().or(z.literal('')),
  allowComments: z.boolean(),
  isMainHero: z.boolean(),
});

type ArticleFormValues = z.infer<typeof formSchema>;

const formatDatetimeForInput = (val: any): string => {
  if (!val) {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  }
  let date: Date;
  if (val && typeof val.toDate === 'function') {
    date = val.toDate();
  } else if (val instanceof Date) {
    date = val;
  } else if (typeof val === 'number') {
    date = new Date(val);
  } else if (typeof val === 'string') {
    date = new Date(val);
  } else {
    date = new Date();
  }
  if (isNaN(date.getTime())) date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

interface ArticleFormProps {
  article: Partial<Article>;
  categories: Category[];
}

export function ArticleForm({ article, categories: initialCategories }: ArticleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile } = useAuth();
  const [categories, setCategories] = useState(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  const isEditing = !!article._id;

  // Función inteligente para separar y limpiar etiquetas (elimina dobles almohadillas ## y separa bloques)
  const cleanAndExtractTags = (input: string | string[]): string[] => {
    const rawList = Array.isArray(input) ? input : [input];
    const result: string[] = [];
    for (const item of rawList) {
      if (!item) continue;
      // Separa por comas, puntos y comas, espacios y símbolos de hashtag #
      const pieces = item.split(/[,;\s#]+/);
      for (const piece of pieces) {
        const cleaned = piece
          .trim()
          .toLowerCase()
          .replace(/^#+/, '')
          .replace(/[^\w-áéíóúñ]/gi, '')
          .replace(/^-+|-+$/g, '');
        if (cleaned.length >= 2 && !result.includes(cleaned)) {
          result.push(cleaned);
        }
      }
    }
    return result;
  };

  const [tags, setTags] = useState<string[]>(() => {
    if (!article.tags) return [];
    const extracted = cleanAndExtractTags(article.tags);
    return extracted.filter(t => t !== article.categoryId);
  });
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");

  const addTagsFromInput = (value: string) => {
    const newTags = cleanAndExtractTags(value);
    if (newTags.length > 0) {
      setTags(prev => {
        const merged = [...prev];
        for (const t of newTags) {
          if (!merged.includes(t)) merged.push(t);
        }
        return merged;
      });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    if (editingTagIndex !== null) {
      setEditingTagIndex(null);
      setEditingTagValue("");
    }
  };

  const startEditTag = (index: number) => {
    setEditingTagIndex(index);
    setEditingTagValue(tags[index] || "");
  };

  const saveEditTag = () => {
    if (editingTagIndex === null) return;
    const cleaned = cleanAndExtractTags(editingTagValue);
    if (cleaned.length > 0) {
      setTags(prev => {
        const next = [...prev];
        next[editingTagIndex] = cleaned[0];
        for (let i = 1; i < cleaned.length; i++) {
          if (!next.includes(cleaned[i])) next.push(cleaned[i]);
        }
        return next;
      });
    } else {
      setTags(prev => prev.filter((_, i) => i !== editingTagIndex));
    }
    setEditingTagIndex(null);
    setEditingTagValue("");
  };

  const cancelEditTag = () => {
    setEditingTagIndex(null);
    setEditingTagValue("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTagsFromInput(tagInput);
    }
    // No borramos con Backspace en vacío para evitar borrado accidental en dispositivos móviles
  };

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article.title || '',
      summary: article.summary || '',
      categoryId: article.categoryId || '',
      content: article.content || '',
      status: article.status || 'draft',
      publishedAt: formatDatetimeForInput(article.publishedAt),
      authorName: article.authorName || '',
      authorRole: article.authorRole || '',
      authorPhotoUrl: article.authorPhotoUrl || '',
      heroImageUrl: article.heroImageUrl || '',
      imageCaption: article.imageCaption || '',
      heroVideoUrl: article.heroVideoUrl || '',
      allowComments: article.allowComments === undefined ? true : article.allowComments,
      isMainHero: article.isMainHero || false,
    },
  });

  useEffect(() => {
    if (!isEditing && userProfile) {
      if (!form.getValues('authorName')) {
        form.setValue('authorName', userProfile.name || 'Redacción El Diario de la Diáspora');
      }
      if (!form.getValues('authorRole')) {
        form.setValue('authorRole', userProfile.authorRole || 'Redactor');
      }
      if (!form.getValues('authorPhotoUrl') && userProfile.photoUrl) {
        form.setValue('authorPhotoUrl', userProfile.photoUrl);
      }
    }
  }, [userProfile, isEditing, form]);

  const handleAuthorPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      toast({ title: "Subiendo foto del autor...", description: "Por favor, espera." });
      try {
        const downloadURL = await uploadImage(file);
        form.setValue('authorPhotoUrl', downloadURL, { shouldValidate: true });
        toast({ title: "Foto de autor subida", description: "La foto se ha subido correctamente." });
      } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "No se pudo subir la foto del autor." });
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      toast({ title: "Subiendo imagen...", description: "Por favor, espera." });
      try {
        const downloadURL = await uploadImage(file);
        form.setValue('heroImageUrl', downloadURL, { shouldValidate: true });
        toast({ title: "Imagen subida", description: "La imagen se ha subido correctamente." });
      } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "No se pudo subir la imagen." });
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleHeroVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      toast({ title: "Subiendo video...", description: "Esto puede tardar un momento." });
      try {
          const downloadURL = await uploadVideo(file);
          form.setValue('heroVideoUrl', downloadURL, { shouldValidate: true });
          toast({ title: "Video subido", description: "El video se ha subido correctamente." });
      } catch (error) {
          toast({ variant: 'destructive', title: "Error", description: "No se pudo subir el video." });
          console.error(error);
      } finally {
          setIsUploading(false);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
        toast({ title: "Nombre inválido", description: "El nombre de la categoría no puede estar vacío.", variant: "destructive"});
        return;
    }
    setIsAddingCategory(true);
    try {
        const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const newCategoryData: Omit<Category, '_id'> = {
            name: newCategoryName,
            slug,
            description: "",
            order: categories.length + 1,
            isVisible: true,
            parentCategoryId: null,
            defaultHeroImageUrl: null,
        }
        const newId = await addCategory(newCategoryData);
        const newCategory: Category = { _id: newId, ...newCategoryData };
        
        setCategories(prev => [...prev, newCategory]);
        form.setValue('categoryId', newCategory.slug);
        toast({ title: "Categoría Creada", description: `"${newCategoryName}" ha sido añadida.` });
        setNewCategoryName("");
        setAddCategoryDialogOpen(false);
    } catch (error) {
        console.error("Error al añadir categoría: ", error);
        toast({ title: "Error", description: "No se pudo crear la categoría.", variant: "destructive"});
    } finally {
        setIsAddingCategory(false);
    }
  }

  async function onSubmit(values: ArticleFormValues) {
    if (!userProfile) {
        toast({ title: "Error de Autenticación", description: "Debes iniciar sesión para guardar un artículo.", variant: "destructive"});
        return;
    }

    setIsSubmitting(true);
    try {
      const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      const contentWithParagraphs = values.content; // Already HTML from editor
      
      const articleData: Omit<Article, '_id' | 'id'> = {
        title: values.title,
        slug: slug,
        summary: values.summary,
        content: contentWithParagraphs,
        categoryId: values.categoryId,
        subCategoryId: null,
        authorId: userProfile.uid,
        authorName: values.authorName?.trim() || userProfile.name || 'Redacción El Diario de la Diáspora',
        authorRole: values.authorRole?.trim() || 'Redactor',
        authorPhotoUrl: values.authorPhotoUrl || '',
        heroImageUrl: values.heroImageUrl || "",
        imageCaption: values.imageCaption || "",
        heroVideoUrl: values.heroVideoUrl || "",
        thumbnailUrl: values.heroImageUrl || "",
        status: values.status,
        publishedAt: values.publishedAt ? Timestamp.fromDate(new Date(values.publishedAt)) : (article.publishedAt || Timestamp.now()),
        updatedAt: Timestamp.now(),
        createdAt: article.createdAt || Timestamp.now(),
        readingTimeMinutes: (() => {
          const cleanText = (contentWithParagraphs || values.content || "").replace(/<[^>]*>/g, " ").trim();
          const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
          return Math.max(1, Math.ceil(words / 200));
        })(),
        tags: tags,
        allowComments: values.allowComments,
        isMainHero: values.isMainHero,
        showOnMostRead: article.showOnMostRead || false, // Retain existing value
        mostReadOrder: article.mostReadOrder || null, // Retain existing value
      };

      if (values.isMainHero) {
        if (!article.isMainHero) {
          // Only bump existing heroes when newly promoted (not when editing an existing hero)
          const allArticles = await getAllArticles();
          const currentHeroes = allArticles.filter(
            a => a.isMainHero && a._id !== (isEditing ? article._id : undefined)
          );
          await Promise.all(
            currentHeroes.map(h => updateArticle(h._id!, { heroOrder: (h.heroOrder ?? 0) + 1 }))
          );
          articleData.heroOrder = 0;
        }
        // If already a hero, keep the existing heroOrder (don't overwrite drag-and-drop order)
      } else {
        // When unchecking hero, keep isMainHero: false but don't touch heroOrder
      }

      if (isEditing) {
        await updateArticle(article._id!, articleData);
        toast({ title: "¡Artículo Actualizado!", description: "Tu artículo ha sido guardado exitosamente." });
      } else {
        await addArticle(articleData);
        toast({ title: "¡Artículo Creado!", description: "Tu nuevo artículo ha sido publicado." });
      }

      await revalidateHomepage();
      router.push('/dashboard/articles');
      router.refresh();

    } catch (error) {
      console.error("Error al guardar el artículo: ", error);
      toast({ title: "Guardado Fallido", description: "Hubo un error al guardar tu artículo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
    const firstKey = Object.keys(errors)[0];
    const message = errors[firstKey]?.message || `El campo ${firstKey} no es válido.`;
    toast({
      title: "Revisa el formulario",
      description: message,
      variant: "destructive"
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-headline">{isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}</h2>
          <Button type="submit" disabled={isSubmitting || isUploading} size="lg">
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : isUploading ? 'Subiendo...' : (isEditing ? 'Guardar Cambios' : 'Publicar Artículo')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenido Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl><Input placeholder="Escribe un título atractivo y claro" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="summary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumen</FormLabel>
                    <FormControl><Input placeholder="Un breve resumen que enganche al lector" className="min-h-[100px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido Completo</FormLabel>
                    <FormControl>
                        <Editor {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/> Ajustes de Publicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del artículo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="draft">En edición (No publicado / Guardado privado)</SelectItem>
                          <SelectItem value="published">Publicado (Visible a todos los lectores)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="publishedAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 font-semibold">
                        <Calendar className="h-4 w-4 text-primary" />
                        Fecha y hora de publicación
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="w-full bg-background font-medium"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Permite cambiar libremente el día y la hora de publicación de esta noticia.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="allowComments" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Permitir Comentarios</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                    </FormItem>
                )} />
                 <FormField control={form.control} name="isMainHero" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <FormLabel>Artículo Principal (Héroe)</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                    </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Información</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <div className="flex gap-2">
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger></FormControl>
                                <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat._id} value={cat.slug}>{cat.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <Dialog open={isAddCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon"><PlusCircle className="h-4 w-4"/></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Crear Nueva Categoría</DialogTitle>
                                        <DialogDescription>
                                            Esta categoría estará disponible para todos los artículos.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nombre de la nueva categoría"/>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setAddCategoryDialogOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleAddCategory} disabled={isAddingCategory}>
                                            {isAddingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                            Añadir
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Firma del Autor / Periodista</CardTitle>
                <CardDescription>Personaliza la foto, nombre y cargo que se mostrarán en la cabecera de la noticia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/40 bg-muted shrink-0 flex items-center justify-center shadow-xs">
                    {form.watch('authorPhotoUrl') ? (
                      <img src={form.watch('authorPhotoUrl')} alt="Foto autor" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <FormLabel className="text-xs font-semibold">Foto en el Círculo</FormLabel>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAuthorPhotoUpload}
                      disabled={isUploading}
                      className="text-xs h-8 file:text-xs"
                    />
                    {form.watch('authorPhotoUrl') && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-destructive hover:text-destructive h-5 px-1 py-0"
                        onClick={() => form.setValue('authorPhotoUrl', '')}
                      >
                        Quitar foto
                      </Button>
                    )}
                  </div>
                </div>

                <FormField control={form.control} name="authorName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. Eustache Sanon o Redacción El Diario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="authorRole" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo o Especialidad</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. Internacionalista/Analista político o Redactor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5"/> Etiquetas</CardTitle>
                <p className="text-xs text-muted-foreground">Palabras clave para que Google encuentre el artículo. Escribe y presiona Enter o coma.</p>
              </CardHeader>
              <CardContent>
                <div
                  className="flex flex-wrap gap-1.5 min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 cursor-text"
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {tags.map((tag, idx) => {
                    const isEditing = editingTagIndex === idx;

                    if (isEditing) {
                      return (
                        <div
                          key={`edit-${idx}`}
                          className="flex items-center gap-1 bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/50 shadow-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-primary font-bold">#</span>
                          <input
                            type="text"
                            autoFocus
                            value={editingTagValue}
                            onChange={(e) => setEditingTagValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveEditTag();
                              } else if (e.key === 'Escape') {
                                cancelEditTag();
                              }
                            }}
                            onBlur={saveEditTag}
                            className="bg-transparent border-b border-primary text-xs outline-none w-28 text-primary font-bold"
                          />
                          <button
                            type="button"
                            title="Guardar cambio"
                            onClick={(e) => { e.stopPropagation(); saveEditTag(); }}
                            className="p-1 hover:text-green-600 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold pl-3 pr-1 py-1 rounded-full group transition-colors hover:bg-primary/20 shadow-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => startEditTag(idx)}
                          className="flex items-center gap-1 hover:underline cursor-pointer focus:outline-none text-left"
                          title="Toca para editar esta etiqueta"
                        >
                          <span>#{tag}</span>
                          <Edit2 className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Eliminar etiqueta #${tag}`}
                          title="Eliminar esta etiqueta"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-primary/70 hover:text-white hover:bg-destructive transition-colors touch-manipulation ml-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    );
                  })}
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text');
                      addTagsFromInput(pasted);
                    }}
                    onBlur={() => { if (tagInput.trim()) addTagsFromInput(tagInput); }}
                    placeholder={tags.length === 0 ? "deportes, concacaf, copa de oro..." : "Añadir otra etiqueta..."}
                    className="flex-1 min-w-[140px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5"/> Imagen Destacada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch('heroImageUrl') && <img src={form.watch('heroImageUrl')} alt="Hero actual" className="w-full h-auto rounded-md mb-4" />}
                <FormItem>
                  <FormLabel>Subir Imagen</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleHeroImageUpload}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name="imageCaption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pie de Foto / Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: El presidente en el evento..." {...field} />
                      </FormControl>
                      <FormDescription>Texto descriptivo que aparecerá justo debajo de la imagen principal.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5"/> Video Destacado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch('heroVideoUrl') && <video src={form.watch('heroVideoUrl')} controls className="w-full h-auto rounded-md mb-4" />}
                <FormDescription>Si subes un video, este reemplazará a la imagen destacada.</FormDescription>
                 <FormItem>
                    <FormLabel>Subir Video</FormLabel>
                    <FormControl>
                        <Input 
                            type="file" 
                            accept="video/mp4,video/quicktime" 
                            onChange={handleHeroVideoUpload}
                            disabled={isUploading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Tag, Link, FileText, Hash, Eye, EyeOff, PlusCircle } from "lucide-react";
import { addCategory } from "@/lib/firestore";
import type { Category } from "@/lib/types";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  slug: z.string().min(2, { message: "El slug debe tener al menos 2 caracteres." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "El slug solo puede contener letras minúsculas, números y guiones." }),
  description: z.string().optional(),
  order: z.coerce.number().min(0),
  isVisible: z.boolean().default(true),
});

interface AddCategoryFormProps {
  onCategoryAdded: (newCategory: Category) => void;
  existingCategories: Category[];
}

export function AddCategoryForm({ onCategoryAdded, existingCategories }: AddCategoryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      order: existingCategories.length > 0 ? Math.max(...existingCategories.map(c => c.order)) + 1 : 1,
      isVisible: true,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    form.setValue('slug', slug);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const newCategoryData: Omit<Category, '_id'> = {
        ...values,
        description: values.description || '',
        parentCategoryId: null,
        defaultHeroImageUrl: null,
      }

      const newId = await addCategory(newCategoryData);
      const newCategory: Category = {
        _id: newId,
        ...newCategoryData
      }

      toast({
        title: "¡Categoría creada!",
        description: `La categoría "${values.name}" ha sido añadida.`,
      });

      onCategoryAdded(newCategory);
      form.reset({
        name: "",
        slug: "",
        description: "",
        order: existingCategories.length > 0 ? Math.max(...existingCategories.map(c => c.order), 0) + 2 : 1,
        isVisible: true,
      });

    } catch (error) {
      console.error("Error al añadir categoría: ", error);
      toast({
        title: "Creación fallida",
        description: "Hubo un error al crear la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Nombre</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Ej: Tecnología" className="pl-9" {...field} onChange={handleNameChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Ej: tecnologia" className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Se genera automáticamente desde el nombre.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Descripción</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea placeholder="Una breve descripción de la categoría." className="pl-9 min-h-[80px]" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Orden</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Número más bajo = aparece primero.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-full">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    {field.value ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    Visible en menú
                  </FormLabel>
                  <FormDescription className="text-xs">
                    {field.value ? "Aparece en la navegación" : "Oculta del menú público"}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full gap-2 h-11">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {isSubmitting ? 'Creando categoría...' : 'Crear Categoría'}
        </Button>
      </form>
    </Form>
  );
}

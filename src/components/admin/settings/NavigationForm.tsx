"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Loader2, PlusCircle, Menu, Tag, Link, Eye, EyeOff, GripVertical } from "lucide-react";
import type { NavItem } from "@/lib/types";
import { useState } from "react";
import { updateSiteSettings } from "@/lib/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const navItemSchema = z.object({
    id: z.string(),
    label: z.string().min(1, "El nombre es obligatorio"),
    slug: z.string().min(1, "La URL/Slug es obligatoria"),
    order: z.coerce.number(),
    isVisible: z.boolean(),
});

const navigationSchema = z.object({
  items: z.array(navItemSchema),
});

type NavigationFormValues = z.infer<typeof navigationSchema>;

interface NavigationFormProps {
  initialData: { items: NavItem[] };
}

export function NavigationForm({ initialData }: NavigationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<NavigationFormValues>({
    resolver: zodResolver(navigationSchema),
    defaultValues: {
      items: initialData?.items || []
    },
  });


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: NavigationFormValues) {
    setIsSubmitting(true);
    try {
      const sortedItems = [...values.items].sort((a, b) => a.order - b.order);
      await updateSiteSettings({ navigation: { items: sortedItems } });
      toast({
        title: '¡Ajustes actualizados!',
        description: `Tus ajustes de navegación han sido guardados.`,
      });
    } catch (error) {
      console.error(`Error actualizando la navegación:`, error);
      toast({
        title: 'Fallo al actualizar',
        description: `Hubo un error al guardar tus ajustes de navegación.`,
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
          <Menu className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Navegación Principal</h2>
          <p className="text-sm text-muted-foreground">Gestiona los enlaces del menú principal de tu sitio.</p>
        </div>
      </div>

    <Card className="w-full overflow-hidden">
        <CardContent className="pt-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className={`grid grid-cols-12 items-end gap-3 p-4 rounded-lg border transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
                      <div className="col-span-1 flex items-center justify-center self-center pt-6">
                        <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-mono">
                          {index + 1}
                        </Badge>
                      </div>
                      <FormField
                        control={form.control}
                        name={`items.${index}.label`}
                        render={({ field }) => (
                        <FormItem className="col-span-4">
                            <FormLabel className="text-xs flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              Nombre
                            </FormLabel>
                            <FormControl>
                            <Input {...field} placeholder="Ej: Política" className="h-9 text-sm" />
                            </FormControl>
                        </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.slug`}
                        render={({ field }) => (
                        <FormItem className="col-span-3">
                            <FormLabel className="text-xs flex items-center gap-1">
                              <Link className="h-3 w-3" />
                              URL
                            </FormLabel>
                            <FormControl>
                            <Input {...field} placeholder="Ej: /politica" className="h-9 text-sm" />
                            </FormControl>
                        </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.order`}
                        render={({ field }) => (
                        <FormItem className="col-span-1">
                            <FormLabel className="text-xs">Orden</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} className="h-9 text-sm text-center" />
                            </FormControl>
                        </FormItem>
                        )}
                      />
                        <FormField
                        control={form.control}
                        name={`items.${index}.isVisible`}
                        render={({ field }) => (
                            <FormItem className="col-span-2 flex flex-row items-center justify-center gap-2 pt-5">
                                <FormLabel className="text-xs cursor-pointer">
                                  {field.value ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                </FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="col-span-1 h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                ))}
                </div>
                {fields.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Menu className="h-8 w-8 opacity-30 mb-1" />
                    <p className="text-sm">No hay enlaces de navegación</p>
                    <p className="text-xs">Agrega el primero con el botón de abajo</p>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => append({ id: `nav_${Date.now()}`, label: "", slug: "", order: fields.length, isVisible: true })}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Añadir enlace
                  </Button>
                  <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar Navegación
                  </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
    </div>
  );
}

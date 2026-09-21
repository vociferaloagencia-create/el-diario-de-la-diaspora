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
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { ArticlePageSettings } from "@/lib/types";
import { updateSiteSettings } from "@/lib/firestore";
import { useState } from "react";
import { Loader2, FileText, User, Calendar, Clock, MessageSquare, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const articlePageSettingsSchema = z.object({
  showBreadcrumbs: z.boolean(),
  showAuthor: z.boolean(),
  showPublishDate: z.boolean(),
  showReadTime: z.boolean(),
  showRelatedArticles: z.boolean(),
  relatedLimit: z.coerce.number().min(1).max(10),
  commentsEnabled: z.boolean(),
});

type ArticlePageSettingsFormValues = z.infer<typeof articlePageSettingsSchema>;

interface ArticlePageSettingsFormProps {
  initialData: ArticlePageSettings;
}

export function ArticlePageSettingsForm({ initialData }: ArticlePageSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<ArticlePageSettingsFormValues>({
    resolver: zodResolver(articlePageSettingsSchema),
    defaultValues: {
      showBreadcrumbs: initialData?.showBreadcrumbs ?? true,
      showAuthor: initialData?.showAuthor ?? true,
      showPublishDate: initialData?.showPublishDate ?? true,
      showReadTime: initialData?.showReadTime ?? true,
      showRelatedArticles: initialData?.showRelatedArticles ?? true,
      relatedLimit: initialData?.relatedLimit ?? 3,
      commentsEnabled: initialData?.commentsEnabled ?? true,
    },
  });

  async function onSubmit(values: ArticlePageSettingsFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ articlePage: values });
      toast({
        title: '¡Ajustes actualizados!',
        description: `Tus ajustes de página de artículo han sido guardados.`,
      });
    } catch (error) {
      console.error(`Error actualizando ajustes de página de artículo:`, error);
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
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Página de Artículo</h2>
          <p className="text-sm text-muted-foreground">Configura los elementos que aparecen en tus artículos.</p>
        </div>
      </div>

     <Card className="w-full overflow-hidden">
        <CardContent className="pt-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Elementos del artículo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField control={form.control} name="showAuthor" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Autor</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="showPublishDate" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Fecha de publicación</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="showReadTime" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Tiempo de lectura</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )} />
                         <FormField control={form.control} name="commentsEnabled" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /> Comentarios globales</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )} />
                    </div>
                </div>
                
                <div className="space-y-4 rounded-lg border p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Artículos relacionados</h3>
                    <FormField control={form.control} name="showRelatedArticles" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between"><FormLabel className="flex items-center gap-2"><Layers className="h-4 w-4 text-muted-foreground" /> Mostrar sección de relacionados</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )} />
                    <FormField
                        control={form.control}
                        name="relatedLimit"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cantidad de artículos a mostrar</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} className="max-w-[120px]" />
                            </FormControl>
                            <FormDescription>Elige cuántos artículos relacionados mostrar (1-10).</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar Ajustes
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
    </div>
  );
}

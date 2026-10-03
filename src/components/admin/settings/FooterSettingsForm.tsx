"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { FooterSettings, FooterLink } from "@/lib/types";
import { updateSiteSettings } from "@/lib/firestore";
import { revalidateHomepage } from "@/app/actions";
import { useState } from "react";
import { Loader2, Trash2, ArrowDownToLine, Copyright, Link2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";


const footerLinkSchema = z.object({
    id: z.string(),
    label: z.string().min(1, "El nombre es obligatorio"),
    href: z.string().min(1, "El enlace es obligatorio"),
    order: z.coerce.number(),
    isVisible: z.boolean(),
});

const footerSettingsSchema = z.object({
  copyrightText: z.string().optional(),
  showCopyright: z.boolean(),
  links: z.array(footerLinkSchema).optional(),
});

type FooterSettingsFormValues = z.infer<typeof footerSettingsSchema>;

interface FooterSettingsFormProps {
  initialData: FooterSettings;
}

export function FooterSettingsForm({ initialData }: FooterSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FooterSettingsFormValues>({
    resolver: zodResolver(footerSettingsSchema),
    defaultValues: {
        copyrightText: initialData.copyrightText || "",
        showCopyright: initialData.showCopyright === undefined ? true : initialData.showCopyright,
        links: initialData.links || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  async function onSubmit(values: FooterSettingsFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ footer: values });
      await revalidateHomepage();
      toast({
        title: '¡Ajustes actualizados!',
        description: `Tus ajustes del pie de página han sido guardados.`,
      });
    } catch (error) {
      console.error(`Error actualizando pie de página:`, error);
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
          <ArrowDownToLine className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pie de Página</h2>
          <p className="text-sm text-muted-foreground">Gestiona el contenido que aparece en el pie de página de tu sitio.</p>
        </div>
      </div>

    <Card className="w-full overflow-hidden">
        <CardContent className="pt-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Copyright className="h-4 w-4" /> Copyright</h3>
                    <FormField
                    control={form.control}
                    name="copyrightText"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Texto de Copyright</FormLabel>
                        <FormControl>
                            <Input placeholder="© 2024 NewsFlash. Todos los derechos reservados." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="showCopyright"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><FormLabel>Mostrar copyright en el sitio</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )}
                    />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4"><Link2 className="h-4 w-4" /> Enlaces del pie</h3>
                    <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 items-end gap-3 p-4 border rounded-lg">
                        <FormField control={form.control} name={`links.${index}.label`} render={({ field }) => (
                            <FormItem className="col-span-4"><FormLabel>Nombre</FormLabel><FormControl><Input {...field} placeholder="Ej: Privacidad" /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name={`links.${index}.href`} render={({ field }) => (
                            <FormItem className="col-span-3"><FormLabel>Enlace</FormLabel><FormControl><Input {...field} placeholder="/privacidad" /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name={`links.${index}.order`} render={({ field }) => (
                            <FormItem className="col-span-1"><FormLabel>Orden</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name={`links.${index}.isVisible`} render={({ field }) => (
                            <FormItem className="col-span-2 flex flex-col items-center justify-center"><FormLabel>Visible</FormLabel><FormControl className="mt-2"><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )} />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="col-span-1"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4 gap-2"
                        onClick={() => append({ id: `footer_link_${Date.now()}`, label: "", href: "/", order: fields.length, isVisible: true })}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Añadir enlace
                    </Button>
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

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flame, Clock, Sparkles } from "lucide-react";
import { updateSiteSettings } from "@/lib/firestore";
import { revalidateHomepage } from "@/app/actions";
import type { TickerSettings } from "@/lib/types";

const tickerSchema = z.object({
  enabled: z.boolean(),
  hoursLimit: z.coerce.number().min(1, "Mínimo 1 hora").max(168, "Máximo 168 horas (1 semana)"),
  customText: z.string().optional(),
  customUrl: z.string().optional(),
});

type TickerFormValues = z.infer<typeof tickerSchema>;

interface TickerSettingsFormProps {
  initialData?: TickerSettings;
}

export function TickerSettingsForm({ initialData }: TickerSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TickerFormValues>({
    resolver: zodResolver(tickerSchema),
    defaultValues: {
      enabled: initialData?.enabled ?? true,
      hoursLimit: initialData?.hoursLimit ?? 24,
      customText: initialData?.customText || "",
      customUrl: initialData?.customUrl || "",
    },
  });

  async function onSubmit(values: TickerFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ ticker: values });
      await revalidateHomepage();
      toast({
        title: "Barra de Última Hora actualizada",
        description: "La configuración se ha guardado y aplicado en la cabecera.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error al guardar",
        description: "No se pudo actualizar la configuración de última hora.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-red-600" />
              Barra Roja de Última Hora
            </CardTitle>
            <CardDescription>
              Controla la visibilidad y el comportamiento de la marquesina roja de noticias urgentes situada debajo de la barra azul.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-xs">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-semibold">
                      Activar Barra de Última Hora
                    </FormLabel>
                    <FormDescription>
                      Si está activa, mostrará la noticia más reciente o el texto fijado.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hoursLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Vigencia de la noticia (Horas)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="24"
                    />
                  </FormControl>
                  <FormDescription>
                    Por defecto: <strong>24 horas</strong>. Si transcurre este tiempo sin una nueva publicación, la barra roja se oculta automáticamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Sobrescribir con texto manual (Opcional)
              </div>

              <FormField
                control={form.control}
                name="customText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titular Personalizado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Déjalo vacío para tomar la última noticia automáticamente"
                      />
                    </FormControl>
                    <FormDescription>
                      Si escribes algo aquí, este texto reemplazará el titular del último artículo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enlace de Destino Personalizado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ejemplo: /articles/cumbre-internacional o https://..."
                      />
                    </FormControl>
                    <FormDescription>
                      Ruta a la que dirigirá al hacer clic en la barra.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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

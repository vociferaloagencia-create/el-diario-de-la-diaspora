"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { WeatherSettings } from "@/lib/types";
import { updateSiteSettings } from "@/lib/firestore";
import { useState } from "react";
import { Loader2, CloudSun, Key, MapPin, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";


const weatherSettingsSchema = z.object({
  enabled: z.boolean(),
  apiKey: z.string().optional(),
  defaultLocation: z.string().optional(),
});

type WeatherSettingsFormValues = z.infer<typeof weatherSettingsSchema>;

interface WeatherSettingsFormProps {
  initialData: WeatherSettings;
}

export function WeatherSettingsForm({ initialData }: WeatherSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<WeatherSettingsFormValues>({
    resolver: zodResolver(weatherSettingsSchema),
    defaultValues: {
        enabled: initialData.enabled || false,
        apiKey: initialData.apiKey || "",
        defaultLocation: initialData.defaultLocation || "Santo Domingo, DO",
    },
  });


  async function onSubmit(values: WeatherSettingsFormValues) {
    setIsSubmitting(true);
    try {
      await updateSiteSettings({ weather: values });
      toast({
        title: '¡Ajustes actualizados!',
        description: `Tus ajustes del clima han sido guardados.`,
      });
    } catch (error) {
      console.error(`Error actualizando el clima:`, error);
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
          <CloudSun className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Widget del Clima</h2>
          <p className="text-sm text-muted-foreground">Configura el widget de clima que aparece en tu sitio.</p>
        </div>
      </div>

    <Card className="w-full overflow-hidden">
        <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm text-muted-foreground">
              <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" />
              <p>El widget usará la ubicación del navegador del usuario. Si no hay permiso, se usará la ubicación por defecto.</p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Habilitar widget de clima</FormLabel>
                        <FormDescription className="text-xs">Muestra el clima actual en el sitio.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />

                <div className="space-y-4">
                  <FormField control={form.control} name="apiKey" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Clave de API</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} value={field.value || ''} placeholder="Introduce tu clave de API" className="pl-9" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Necesitas una clave gratuita de <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">WeatherAPI.com</a>.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                  )} />

                  <FormField control={form.control} name="defaultLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Ubicación por defecto</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} value={field.value || ''} placeholder="Ej: Santo Domingo, DO" className="pl-9" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">Formato: "Ciudad, CódigoPaís".</FormDescription>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isSubmitting} size="lg" className="gap-2 mt-4">
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

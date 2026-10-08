"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MailCheck, User, Phone, Mail, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }).max(100, {
    message: "El nombre no debe exceder los 100 caracteres.",
  }),
  email: z.string().email({
    message: "Debes ingresar un correo electrónico válido.",
  }),
  phone: z.string().optional(),
  frequency: z.enum(["diario", "semanal"]).default("diario"),
  preferredDay: z.string().default("lunes"),
});

export function SubmitForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      frequency: "diario",
      preferredDay: "lunes",
    },
  });

  const selectedFrequency = form.watch("frequency");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Guardar el registro en Firebase Firestore con sus preferencias
      await addDoc(collection(db, 'subscribers'), {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        frequency: values.frequency,
        preferredDay: values.frequency === 'semanal' ? values.preferredDay : 'Todos los días',
        subscribedAt: serverTimestamp(),
        source: 'subscription_page'
      });

      toast({
        title: "¡Suscripción Exitosa!",
        description: "Te hemos añadido a nuestra lista de noticias.",
      });
      
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error al suscribirse: ", error);
      toast({
        title: "Suscripción Fallida",
        description: "Hubo un error al procesar tu solicitud. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-green-100 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30">
        <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
            <MailCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-headline font-bold text-slate-800 dark:text-slate-100">
            ¡Gracias por suscribirte!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm">
            Tus datos han sido registrados correctamente. Pronto comenzarás a recibir nuestras mejores noticias.
          </p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => setIsSuccess(false)}
          >
            Suscribir a otra persona
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">Nombre Completo <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input placeholder="Ej. Juan Pérez" className="pl-10 h-12" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">Correo Electrónico <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input placeholder="tu@correo.com" type="email" className="pl-10 h-12" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Nunca compartiremos tu correo con nadie más.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">Teléfono <span className="text-slate-400 font-normal text-sm">(Opcional)</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input placeholder="+1 (555) 000-0000" type="tel" className="pl-10 h-12" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferencias de entrega: Frecuencia y Día */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                      <Clock className="w-4 h-4 text-primary" />
                      Frecuencia de noticias
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecciona la frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="diario">Diario (Todos los días)</SelectItem>
                        <SelectItem value="semanal">Semanal (Una vez por semana)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                      <Calendar className="w-4 h-4 text-primary" />
                      Día preferido
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={selectedFrequency === 'diario'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecciona el día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lunes">Lunes</SelectItem>
                        <SelectItem value="martes">Martes</SelectItem>
                        <SelectItem value="miercoles">Miércoles</SelectItem>
                        <SelectItem value="jueves">Jueves</SelectItem>
                        <SelectItem value="viernes">Viernes</SelectItem>
                        <SelectItem value="sabado">Sábado</SelectItem>
                        <SelectItem value="domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[11px]">
                      {selectedFrequency === 'diario' ? 'Entrega activa todos los días.' : 'Elige qué día deseas recibir el boletín.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold uppercase tracking-wider">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isSubmitting ? 'Registrando...' : 'Suscribirme Ahora'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

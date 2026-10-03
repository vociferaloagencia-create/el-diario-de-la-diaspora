import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories } from "@/lib/firestore";
import { Mail, Send, Phone, MapPin, ShieldCheck, Newspaper, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contacto | El Diario de la Diáspora",
  description: "Contacta con la redacción y administración de El Diario de la Diáspora. Correos corporativos y atención al lector.",
};

const corporateEmails = [
  { address: "info@eldiariodeladiaspora.com", role: "Información General & Atención al Lector", icon: Mail },
  { address: "redaccion@eldiariodeladiaspora.com", role: "Redacción Principal & Envío de Notas de Prensa", icon: Newspaper },
];

export default async function ContactoPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header settings={settings} categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-white mb-4">
            Contacto Oficial & Redacción
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Estamos a tu disposición. Comunícate con nuestros departamentos editoriales e institucionales a través de nuestras líneas directas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Columna de Correos Corporativos */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xl font-bold text-primary font-headline mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Correos Corporativos
            </h2>

            <div className="space-y-3">
              {corporateEmails.map((email) => {
                const Icon = email.icon;
                return (
                  <div
                    key={email.address}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg mt-0.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <a
                          href={`mailto:${email.address}`}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block"
                        >
                          {email.address}
                        </a>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {email.role}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 mt-6">
              <h3 className="text-sm font-bold text-primary mb-1">
                ¿Tienes una noticia de última hora?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Escribe directamente a <span className="font-semibold text-primary">redaccion@eldiariodeladiaspora.com</span> para reportar sucesos o compartir comunicados de prensa.
              </p>
            </div>
          </div>

          {/* Formulario de Mensaje */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white mb-6">
              Envíanos un mensaje directo
            </h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Motivo del mensaje"
                  className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Escribe aquí tu mensaje..."
                  className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-wider gap-2 rounded-lg"
              >
                <Send className="h-4 w-4" />
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

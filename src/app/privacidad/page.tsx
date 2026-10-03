import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories } from "@/lib/firestore";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | El Diario de la Diáspora",
  description: "Política de privacidad y protección de datos personales de El Diario de la Diáspora.",
};

export default async function PrivacidadPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header settings={settings} categories={categories} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-primary mb-2">
            <ShieldCheck className="h-8 w-8" />
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-slate-900 dark:text-white">
              Política de Privacidad
            </h1>
          </div>

          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Última actualización: Septiembre 2026
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">
              1. Protección de Datos Personales
            </h2>
            <p>
              En <strong>El Diario de la Diáspora</strong> nos tomamos muy en serio la privacidad y la confidencialidad de nuestros lectores. Esta política describe cómo recopilamos, utilizamos y protegemos la información personal facilitada a través de nuestra plataforma web.
            </p>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">
              2. Información que Recopilamos
            </h2>
            <p>
              Podemos recopilar información técnica (como dirección IP, navegador y tipo de dispositivo) con fines analíticos y de seguridad, así como datos facilitados voluntariamente al suscribirte a nuestros boletines de noticias o notificaciones push (dirección de correo electrónico).
            </p>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">
              3. Uso de la Información
            </h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Enviar notificaciones de noticias de última hora e información de interés.</li>
              <li>Mejorar el rendimiento y la velocidad de carga de nuestro portal de noticias.</li>
              <li>Garantizar la seguridad de la infraestructura ante posibles picos de tráfico.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">
              4. Cookies y Publicidad
            </h2>
            <p>
              Utilizamos cookies propias y de terceros (incluyendo servicios como Google AdSense) para personalizar contenido publicitario y ofrecer una mejor experiencia de navegación. Puedes configurar tu navegador para rechazar o eliminar las cookies en cualquier momento.
            </p>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">
              5. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre nuestra política de privacidad, puedes contactarnos a través de nuestro correo oficial de privacidad: <span className="font-semibold text-primary">info@eldiariodeladiaspora.com</span>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

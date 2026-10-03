import { Header } from "@/components/site/Header";
import { SubmitForm } from "@/components/site/SubmitForm";
import { getCategories, getSiteSettings } from "@/lib/firestore";
import { Footer } from "@/components/site/Footer";
import { SiteSettings } from "@/lib/types";

export default async function SubmitArticlePage() {
  const categories = await getCategories();
  const settings = await getSiteSettings();

  const safeSettings = settings || {} as SiteSettings;
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header settings={settings} categories={categories.filter(c => c.isVisible).sort((a,b) => a.order - b.order)} />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-slate-900 dark:text-white mb-2">Suscríbete al Periódico</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Regístrate para recibir nuestras mejores noticias y notificaciones exclusivas directamente.</p>
          </div>
          <SubmitForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

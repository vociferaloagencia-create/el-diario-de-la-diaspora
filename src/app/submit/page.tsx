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
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={categories.filter(c => c.isVisible).sort((a,b) => a.order - b.order)} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Envía tu Historia</h2>
            <p className="text-muted-foreground">Comparte tus noticias con el mundo.</p>
          </div>
          <SubmitForm categories={categories} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

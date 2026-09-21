
import { getSiteSettings } from "@/lib/firestore";
import { ArticlePageSettingsForm } from "@/components/admin/settings/ArticlePageSettingsForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function ArticlePageSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Ajustes de Página de Artículo</h1>
        <p className="text-muted-foreground">Configura los elementos que aparecen en tus páginas de artículo.</p>
      </div>
      <ArticlePageSettingsForm
        initialData={siteSettings.articlePage}
      />
    </div>
  );
}

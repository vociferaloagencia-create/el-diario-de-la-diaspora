
import { getSiteSettings } from "@/lib/firestore";
import { FooterSettingsForm } from "@/components/admin/settings/FooterSettingsForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function FooterSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-4">
       <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Ajustes del Pie de Página</h1>
        <p className="text-muted-foreground">Gestiona el contenido que aparece en el pie de página de tu sitio.</p>
      </div>
      <FooterSettingsForm
        initialData={siteSettings.footer}
      />
    </div>
  );
}


import { getSiteSettings } from "@/lib/firestore";
import { AdsSettingsForm } from "@/components/admin/settings/AdsSettingsForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function AdsSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Anuncios</h1>
        <p className="text-muted-foreground">Gestiona los espacios publicitarios de tu sitio.</p>
      </div>
      <AdsSettingsForm 
        initialData={siteSettings.ads}
      />
    </div>
  );
}

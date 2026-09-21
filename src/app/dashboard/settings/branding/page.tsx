
import { getSiteSettings } from "@/lib/firestore";
import { BrandingForm } from "@/components/admin/settings/BrandingForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function BrandingSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();
  
  return (
    <div className="space-y-4">
       <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Marca e Identidad</h1>
        <p className="text-muted-foreground">Gestiona el nombre, eslogan y logos de tu sitio.</p>
      </div>
      <BrandingForm
        initialData={siteSettings.branding}
      />
    </div>
  );
}

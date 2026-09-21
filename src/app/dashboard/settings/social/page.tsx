
import { getSiteSettings } from "@/lib/firestore";
import { SocialLinksForm } from "@/components/admin/settings/SocialLinksForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function SocialLinksPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Redes Sociales</h1>
        <p className="text-muted-foreground">Añade los enlaces a tus perfiles de redes sociales.</p>
      </div>
      <SocialLinksForm
        initialData={siteSettings.socialLinks}
      />
    </div>
  );
}

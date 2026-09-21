
import { getSiteSettings } from "@/lib/firestore";
import { NavigationForm } from "@/components/admin/settings/NavigationForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function NavigationSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <NavigationForm
        initialData={siteSettings?.navigation || { items: [] }}
      />
    </div>
  );
}


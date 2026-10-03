import { getSiteSettings } from "@/lib/firestore";
import { CommunitySettingsForm } from "@/components/admin/settings/CommunitySettingsForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function ComunidadSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <CommunitySettingsForm initialData={siteSettings.community} />
    </div>
  );
}

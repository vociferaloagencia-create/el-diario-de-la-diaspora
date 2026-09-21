
import { getSiteSettings } from "@/lib/firestore";
import { HomeLayoutForm } from "@/components/admin/settings/HomeLayoutForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function HomePageSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <HomeLayoutForm
        initialData={siteSettings.homePage}
      />
    </div>
  );
}

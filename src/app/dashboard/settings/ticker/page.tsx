import { getSiteSettings } from "@/lib/firestore";
import { TickerSettingsForm } from "@/components/admin/settings/TickerSettingsForm";
import type { SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function TickerSettingsPage() {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <TickerSettingsForm initialData={siteSettings.ticker} />
    </div>
  );
}

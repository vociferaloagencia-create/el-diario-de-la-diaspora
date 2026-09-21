import { getAdClicks } from "@/lib/firestore";
import { StatisticsClient } from "@/components/admin/statistics/StatisticsClient";
import { BarChart3, MousePointerClick, Crosshair } from "lucide-react";

export default async function StatisticsPage() {
  const adClicks = await getAdClicks();
  const uniqueAds = [...new Set(adClicks.map(c => c.adName))];

  const stats = [
    { label: "Total de clics", value: adClicks.length, icon: MousePointerClick, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Anuncios activos", value: uniqueAds.length, icon: Crosshair, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">Métricas y rendimiento de tu sitio.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <StatisticsClient adClicks={adClicks} />
    </div>
  );
}

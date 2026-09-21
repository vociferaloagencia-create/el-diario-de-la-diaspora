import { getCategories } from "@/lib/firestore";
import type { Category } from "@/lib/types";
import { CategoryClient } from "@/components/admin/CategoryClient";
import { LayoutGrid, Eye, EyeOff } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories: Category[] = await getCategories();
  const visible = categories.filter(c => c.isVisible);

  const stats = [
    { label: "Total categorías", value: categories.length, icon: LayoutGrid, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Visibles", value: visible.length, icon: Eye, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    { label: "Ocultas", value: categories.length - visible.length, icon: EyeOff, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground">Organiza tus artículos. El menú de navegación se genera automáticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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

      <CategoryClient initialCategories={categories} />
    </div>
  );
}

import Link from "next/link";
import { Palette, Share2, Home, FileText, Megaphone, ArrowDownToLine, Menu, Settings } from "lucide-react";

const settingsSections = [
  { href: "/dashboard/settings/branding", label: "Marca", description: "Nombre, eslogan y logos del sitio", icon: Palette, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  { href: "/dashboard/settings/social", label: "Redes Sociales", description: "Enlaces a tus perfiles sociales", icon: Share2, color: "text-sky-600 bg-sky-100 dark:bg-sky-900/30" },
  { href: "/dashboard/settings/homepage", label: "Página de Inicio", description: "Configuración de la portada", icon: Home, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  { href: "/dashboard/settings/articlepage", label: "Artículo", description: "Elementos en las páginas de artículo", icon: FileText, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
  { href: "/dashboard/settings/ads", label: "Anuncios", description: "Espacios publicitarios del sitio", icon: Megaphone, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  { href: "/dashboard/settings/footer", label: "Pie de Página", description: "Copyright y enlaces del footer", icon: ArrowDownToLine, color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30" },
  { href: "/dashboard/settings/navigation", label: "Navegación", description: "Menú principal del sitio", icon: Menu, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajustes del Sitio</h1>
          <p className="text-sm text-muted-foreground">Configura todos los aspectos de tu portal.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <div className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${section.color} group-hover:scale-110 transition-transform`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{section.label}</h3>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

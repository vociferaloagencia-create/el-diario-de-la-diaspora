"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Newspaper, FileEdit, FileCheck, LayoutGrid, MousePointerClick, Star, PlusCircle, Settings, BarChart3, ArrowRight, PenLine, Megaphone, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article, Category, SiteSettings } from "@/lib/types";

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalAdClicks: number;
  totalUsers: number;
  heroArticles: number;
}

interface DashboardClientProps {
  stats: DashboardStats;
  recentArticles: Article[];
  categories: Category[];
  siteSettings: SiteSettings;
}

const quickActions = [
  { label: "Nuevo artículo", href: "/dashboard/articles/new", icon: PlusCircle, desc: "Crear una noticia", color: "from-blue-500 to-blue-600" },
  { label: "Mis borradores", href: "/dashboard/articles", icon: FileEdit, desc: `${0} artículo(s) sin publicar`, color: "from-amber-500 to-amber-600" },
  { label: "Gestionar anuncios", href: "/dashboard/settings/ads", icon: Megaphone, desc: "Configurar publicidad", color: "from-purple-500 to-purple-600" },
  { label: "Ver estadísticas", href: "/dashboard/statistics", icon: BarChart3, desc: "Rendimiento del sitio", color: "from-emerald-500 to-emerald-600" },
];

export function DashboardClient({ stats, recentArticles, categories, siteSettings }: DashboardClientProps) {
  const { userProfile } = useAuth();

  const statCards = [
    { label: "Publicados", value: stats.publishedArticles, icon: FileCheck, color: "text-green-600 bg-green-100 dark:bg-green-900/30", href: "/dashboard/articles" },
    { label: "Borradores", value: stats.draftArticles, icon: FileEdit, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30", href: "/dashboard/articles" },
    { label: "Categorías", value: stats.totalCategories, icon: LayoutGrid, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30", href: "/dashboard/categories" },
    { label: "Clics", value: stats.totalAdClicks, icon: MousePointerClick, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", href: "/dashboard/statistics" },
    { label: "Destacados", value: stats.heroArticles, icon: Star, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30", href: "/dashboard/settings/homepage" },
  ];

  const formatDate = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const drafts = recentArticles.filter(a => a.status === 'draft');
  const published = recentArticles.filter(a => a.status === 'published').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Panel Principal
          </h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido{userProfile?.name ? `, ${userProfile.name}` : ""}. {siteSettings.branding?.siteName || "La Cifra"} al día.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2 shadow-sm">
          <Link href="/dashboard/articles/new">
            <PlusCircle className="h-4 w-4" />
            Nuevo artículo
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.color} p-4 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
              <div className="relative z-10">
                <action.icon className="h-6 w-6 mb-3 opacity-90" />
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-white/70 mt-0.5">{action.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="rounded-xl border bg-card p-3.5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none mb-0.5">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              Últimos publicados
            </h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs h-7">
              <Link href="/dashboard/articles">
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {published.length > 0 ? published.map((article) => (
              <Link key={article._id} href={`/dashboard/articles/${article._id}/edit`} className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {article.heroImageUrl ? (
                    <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 bg-muted">
                      <img src={article.heroImageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-md shrink-0 bg-muted flex items-center justify-center">
                      <Newspaper className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium truncate">{article.title}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">{formatDate(article.publishedAt)}</span>
              </Link>
            )) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No hay artículos publicados.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/dashboard/articles/new">Crear primer artículo</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {drafts.length > 0 && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b bg-amber-50/50 dark:bg-amber-900/10">
                <h2 className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <FileEdit className="h-4 w-4" />
                  Borradores pendientes
                </h2>
              </div>
              <div className="divide-y">
                {drafts.slice(0, 4).map((article) => (
                  <Link key={article._id} href={`/dashboard/articles/${article._id}/edit`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
                    <PenLine className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="text-sm truncate">{article.title}</span>
                  </Link>
                ))}
              </div>
              <div className="px-5 py-2 border-t bg-muted/10">
                <Link href="/dashboard/articles" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                  Ver todos los borradores
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-muted/20">
              <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Configuración rápida</h2>
            </div>
            <div className="divide-y">
              {[
                { label: "Marca y logos", href: "/dashboard/settings/branding", icon: Settings },
                { label: "Portada (héroes)", href: "/dashboard/settings/homepage", icon: Star },
                { label: "Redes sociales", href: "/dashboard/settings/social", icon: Share2 },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

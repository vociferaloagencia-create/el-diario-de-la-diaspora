import { getAllArticles, getCategories } from "@/lib/firestore";
import { ArticlesClient } from "@/components/admin/articles/ArticlesClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Newspaper, FileCheck, FileEdit } from 'lucide-react';
import type { Article, Category } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const articles: Article[] = await getAllArticles();
  const categories: Category[] = await getCategories();
  const published = articles.filter(a => a.status === 'published');
  const drafts = articles.filter(a => a.status === 'draft');

  const stats = [
    { label: "Total artículos", value: articles.length, icon: Newspaper, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Publicados", value: published.length, icon: FileCheck, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    { label: "Borradores", value: drafts.length, icon: FileEdit, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
    { label: "Categorías", value: categories.length, icon: Newspaper, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  ];

  return (
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Artículos</h1>
              <p className="text-sm text-muted-foreground">Crea y administra las noticias de tu portal.</p>
            </div>
          </div>
          <Button asChild size="lg" className="gap-2 shrink-0">
            <Link href="/dashboard/articles/new">
              <PlusCircle className="h-4 w-4" />
              Nuevo artículo
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        <ArticlesClient initialArticles={articles} categories={categories} />
      </div>
  );
}

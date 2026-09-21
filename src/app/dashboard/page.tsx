import { getAllArticles, getCategories, getAdClicks, getSiteSettings } from "@/lib/firestore";
import { DashboardClient } from "./DashboardClient";
import type { Article, Category, AdClick, SiteSettings } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [articles, categories, adClicks, siteSettings] = await Promise.all([
    getAllArticles(),
    getCategories(),
    getAdClicks(),
    getSiteSettings(),
  ]);

  const stats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.status === 'published').length,
    draftArticles: articles.filter(a => a.status === 'draft').length,
    totalCategories: categories.length,
    totalAdClicks: adClicks.length,
    totalUsers: 0,
    heroArticles: articles.filter(a => a.isMainHero).length,
  };

  const recentArticles = articles
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt as any).getTime() - new Date(a.publishedAt as any).getTime())
    .slice(0, 8);

  return (
    <DashboardClient
      stats={stats}
      recentArticles={recentArticles}
      categories={categories}
      siteSettings={siteSettings}
    />
  );
}

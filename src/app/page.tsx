import { Header } from "@/components/site/Header";
import { HomePageClient } from "@/components/site/HomePageClient";
import { getHeroArticles, getLatestArticles, getMostReadArticles, getSiteSettings, getCategories } from "@/lib/firestore";
import type { Article, Category } from "@/lib/types";
import { Footer } from "@/components/site/Footer";

export const revalidate = 60;

export default async function Home() {
  const [settings, sortedHeroes, latestPublished, mostReadArticles, categories] = await Promise.all([
    getSiteSettings(),
    getHeroArticles(),
    getLatestArticles(50),
    getMostReadArticles(),
    getCategories(),
  ]) as [Awaited<ReturnType<typeof getSiteSettings>>, Article[], Article[], Article[], Category[]];

  let latestArticles: Article[] = [];

  let heroArticle: Article | undefined = sortedHeroes[0];
  if (!heroArticle && latestPublished.length > 0) {
    heroArticle = latestPublished[0];
  }

  const visibleCategories = categories.filter(c => c.isVisible).sort((a, b) => a.order - b.order).slice(0, 6);
  const categoryLatest: { [key: string]: Article } = {};

  for (const article of latestPublished) {
    const isVisibleCategory = visibleCategories.some(c => c.slug === article.categoryId);
    if (isVisibleCategory && !categoryLatest[article.categoryId]) {
      if (article._id !== heroArticle?._id) {
        categoryLatest[article.categoryId] = article;
      }
    }
  }
  latestArticles = Object.values(categoryLatest);

  const heroAndLatestIds = new Set([
      heroArticle?._id,
      ...latestArticles.map(a => a._id)
    ].filter(Boolean) as string[]
  );

  const remainingArticles = latestPublished.filter(a => !heroAndLatestIds.has(a._id!));
  
  const moreArticlesLimit = 6;
  const moreArticles = remainingArticles.slice(0, moreArticlesLimit);

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={categories.filter(c => c.isVisible).sort((a,b) => a.order - b.order)} />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        <HomePageClient 
          latestArticles={latestArticles} 
          moreArticles={moreArticles}
          heroArticle={heroArticle}
          mostReadArticles={mostReadArticles}
          settings={settings}
        />
      </div>
      <Footer />
    </div>
  );
}

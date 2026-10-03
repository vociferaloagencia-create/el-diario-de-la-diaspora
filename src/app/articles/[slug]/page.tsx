
import { getArticleBySlug, getSiteSettings, getAuthorById, getRelatedArticles, getCategories, getAllArticles } from "@/lib/firestore";
import { notFound } from "next/navigation";
import type { SiteSettings, Category } from "@/lib/types";
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArticlePageClient } from "@/components/site/ArticlePageClient";
import { AdBannerClient } from "@/components/site/AdBannerClient";

export const dynamic = 'force-dynamic';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const article = await getArticleBySlug(decodedSlug);
  if (!article) return {};
  const settings = await getSiteSettings();
  const siteName = settings.branding?.siteName || 'El Diario de la Diáspora';
  return {
    title: `${article.title} | ${siteName}`,
    description: article.summary,
    keywords: article.tags?.length ? article.tags.join(', ') : undefined,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.heroImageUrl ? [{ url: article.heroImageUrl }] : [],
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const article = await getArticleBySlug(decodedSlug);
  
  if (!article) {
    notFound();
  }

  const settings = await getSiteSettings();
  const categories = await getCategories();
  const author = article.authorId ? await getAuthorById(article.authorId) : null;
  
  const allArticles = await getAllArticles();
  
  // Get related articles from the same category
  const relatedArticles = settings.articlePage.showRelatedArticles 
    ? await getRelatedArticles(article.categoryId, article._id!)
    : [];
    
  const publishedArticles = allArticles.filter(a => a.status === 'published');
  
  // Get most read articles as a separate list
  const mostReadArticles = publishedArticles
    .filter(a => a.showOnMostRead)
    .sort((a, b) => (a.mostReadOrder || 99) - (b.mostReadOrder || 99))
    .slice(0, 4);
  
  const category = categories.find(c => c.slug === article.categoryId);

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={categories.filter(c => c.isVisible).sort((a,b) => a.order - b.order)} />
      <main className="mx-auto flex-grow py-6">
        <div className="px-4 sm:px-6 lg:px-8">
            <ArticlePageClient
              article={article}
              author={author}
              settings={settings}
              category={category}
              relatedArticles={relatedArticles}
              mostReadArticles={mostReadArticles}
            />
        </div>
      </main>
      
      {settings.ads?.articleBottom?.enabled && settings.ads.articleBottom.imageUrl && (
        <div className="px-4 sm:px-6 lg:px-8">
          <AdBannerClient
            ad={settings.ads.articleBottom} 
            adName="articleBottomBanner" 
            pageSlug={`article/${resolvedParams.slug}`}
            defaultSize="h-[120px]"
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

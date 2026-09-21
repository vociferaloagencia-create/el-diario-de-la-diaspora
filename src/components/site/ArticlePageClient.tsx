
'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import type { SiteSettings, Article, Author, Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ArticleBody } from "@/components/site/ArticleBody";
import { ArticleSidebar } from "@/components/site/ArticleSidebar";
import { ShareButtons } from "@/components/site/ShareButtons";
import { PopupAd } from './PopupAd';
import { trackAdClick } from '@/lib/firestore';
import Link from 'next/link';
import { ArticleComments } from "@/components/site/ArticleComments";

interface ArticlePageClientProps {
    article: Article;
    author: Author | null;
    settings: SiteSettings;
    category?: Category;
    relatedArticles: Article[];
    mostReadArticles: Article[];
}

export function ArticlePageClient({ article, author, settings, category, relatedArticles, mostReadArticles }: ArticlePageClientProps) {

  const handleAdClick = async (adName: string, adUrl: string) => {
    await trackAdClick(adName, article.slug, adUrl);
  };

  const hasVideo = article.heroVideoUrl && article.heroVideoUrl.length > 0;

  return (
    <>
      {settings.ads?.popup?.enabled && settings.ads.popup.imageUrl && (
        <PopupAd ad={settings.ads.popup} onAdClick={handleAdClick} />
      )}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <article>
                  <header className="mb-8">
                      {category && (
                      <Badge variant="secondary" className="mb-2">
                          {category.name}
                      </Badge>
                      )}
                      <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4">
                      {article.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
                          {settings.articlePage.showAuthor && author && <span>Por {author.name}</span>}
                          {settings.articlePage.showPublishDate && <span>Publicado el {format(new Date(article.publishedAt), 'd \'de\' MMMM, yyyy')}</span>}
                          {settings.articlePage.showReadTime && <span>{article.readingTimeMinutes} min de lectura</span>}
                      </div>
                  </header>

                  {hasVideo ? (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8 bg-black">
                      <video
                        src={article.heroVideoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : article.heroImageUrl && (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8">
                      <Image
                          src={article.heroImageUrl}
                          alt={article.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover"
                          priority
                      />
                      </div>
                  )}

                  <ArticleBody content={article.content} inArticleAd={settings.ads.inArticle} slug={article.slug} />

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                      {article.tags.map(tag => (
                        <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                          className="text-xs px-3 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <ShareButtons
                      url={`/articles/${article.slug}`}
                      title={article.title}
                  />

                  {/* Sección de Comentarios de Lectores (Solicitada por la clienta) */}
                  <ArticleComments articleSlug={article.slug} />
              </article>
          </div>

          <div className="col-span-12 lg:col-span-4 sticky top-24 h-fit">
              <ArticleSidebar 
                  ad_top={settings.ads.homeHeroSide}
                  ad_middle={settings.ads.sidebarMiddle}
                  relatedArticles={relatedArticles}
                  mostRead={mostReadArticles}
                  onAdClick={handleAdClick}
              />
          </div>
        </div>
      </div>
    </>
  );
}

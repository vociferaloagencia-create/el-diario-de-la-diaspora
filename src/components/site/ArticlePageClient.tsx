
'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import type { SiteSettings, Article, Author, Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ArticleBody } from "@/components/site/ArticleBody";
import { ArticleSidebar } from "@/components/site/ArticleSidebar";
import { TranslatedCategoryName } from "./TranslatedCategoryName";
import { ShareButtons } from "@/components/site/ShareButtons";
import { PopupAd } from './PopupAd';
import { trackAdClick } from '@/lib/firestore';
import Link from 'next/link';
import { ArticleComments } from "@/components/site/ArticleComments";
import { User, Printer, Share2, Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ArticlePageClientProps {
    article: Article;
    author: Author | null;
    settings: SiteSettings;
    category?: Category;
    relatedArticles: Article[];
    mostReadArticles: Article[];
}

export function ArticlePageClient({ article, author, settings, category, relatedArticles, mostReadArticles }: ArticlePageClientProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const canEdit = userProfile && ['superadmin', 'admin', 'editor'].includes(userProfile.role);

  const isTechnicalId = (val?: string) => !val || (val.length > 20 && !val.includes(' '));
  const authorDisplayName = (!isTechnicalId(article.authorName) && article.authorName?.trim())
    || (!isTechnicalId(author?.name) && author?.name?.trim())
    || 'Redacción El Diario de la Diáspora';
  const authorDisplayRole = article.authorRole || author?.role || 'Redactor';
  const authorDisplayAvatar = article.authorPhotoUrl || author?.avatarUrl || null;

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: article.title,
      text: article.summary || article.title,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn("navigator.share falló, probando portapapeles:", err);
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Enlace Copiado", description: "Se ha copiado el enlace de la noticia al portapapeles." });
      } catch (clipboardErr) {
        console.error("Error al copiar enlace:", clipboardErr);
      }
    }
  };

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
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-bold uppercase tracking-wider text-xs px-3 py-1">
                          Categoría: {category ? <TranslatedCategoryName name={category.name} /> : <TranslatedCategoryName name={article.categoryId ? article.categoryId.replace(/-/g, ' ') : 'Actualidad'} />}
                        </Badge>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4 text-slate-900 dark:text-white">
                        {article.title}
                      </h1>
                      {article.summary && (
                        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 mt-4">
                          {article.summary}
                        </p>
                      )}

                      
                      {/* Tarjeta de Metadatos del Periodista y Barra de Herramientas */}
                      <div className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 my-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Perfil del Periodista con Avatar Circular, Nombre y Rol */}
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
                            {authorDisplayAvatar ? (
                              <Image
                                src={authorDisplayAvatar}
                                alt={authorDisplayName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white font-headline flex items-center gap-1.5">
                              {authorDisplayName}
                              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                                {authorDisplayRole}
                              </span>
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                              {format(new Date(article.publishedAt), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>

                        {/* Barra de Herramientas: Compartir, Imprimir, Tiempo de Lectura */}
                        <div className="flex items-center gap-2 flex-wrap border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                            {/* Imprimir Noticia */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => typeof window !== 'undefined' && window.print()}
                              className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-primary gap-1.5"
                              title="Imprimir noticia"
                            >
                              <Printer className="w-3.5 h-3.5 text-primary" />
                              <span className="hidden md:inline font-semibold">Imprimir</span>
                            </Button>

                            {/* Botón Compartir Noticia */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleShare}
                              className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-primary gap-1.5"
                              title="Compartir noticia"
                            >
                              <Share2 className="w-3.5 h-3.5 text-primary" />
                              <span className="hidden md:inline font-semibold">Compartir</span>
                            </Button>

                            {canEdit && (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-white bg-blue-600 hover:bg-blue-700 hover:text-white gap-1.5 ml-1"
                                title="Editar noticia"
                              >
                                <Link href={`/dashboard/articles/${article._id}/edit`}>
                                  <Edit className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline font-semibold">Editar</span>
                                </Link>
                              </Button>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {(() => {
                              const cleanText = (article.content || "").replace(/<[^>]*>/g, " ").trim();
                              const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
                              return words > 0 ? Math.max(1, Math.ceil(words / 200)) : (article.readingTimeMinutes || 2);
                            })()} min de lectura
                          </span>
                        </div>
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
                      <figure className="mb-8">
                        <div className="relative aspect-video w-full rounded-t-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                          <Image
                              src={article.heroImageUrl}
                              alt={article.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 800px"
                              className="object-cover"
                              priority
                          />
                        </div>
                        {article.imageCaption && (
                          <figcaption className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 italic px-4 font-serif">
                            {article.imageCaption}
                          </figcaption>
                        )}
                      </figure>
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

"use client";

import type { Article, SiteSettings, Reel } from "@/lib/types";
import { ArticleList } from "@/components/site/ArticleList";
import { HeroPrincipal } from "./HeroPrincipal";
import { SideHighlightAd } from "./SideHighlightAd";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { PopupAd } from "./PopupAd";
import { WeatherWidget } from "./WeatherWidget";
import { MostReadList } from "./MostReadList";
import { trackAdClick, getAllReels } from "@/lib/firestore";
import { AdBannerClient } from "./AdBannerClient";

interface HomePageClientProps {
  latestArticles: Article[];
  moreArticles: Article[];
  heroArticle?: Article;
  mostReadArticles: Article[];
  settings: SiteSettings;
}

const ReelsWidget = ({ reels }: { reels: Reel[] }) => {
  return null;
};

export function HomePageClient({ 
  latestArticles, 
  moreArticles, 
  heroArticle, 
  mostReadArticles, 
  settings 
}: HomePageClientProps) {
  // Estado y consulta de reels pausados mientras la sección permanezca oculta
  const [reels] = useState<Reel[]>([]);

  const adTop = settings?.ads?.sidebarMiddle;
  const adBottom = settings?.ads?.sidebarBottom;

  const handleAdClick = async (adName: string, adUrl: string) => {
    await trackAdClick(adName, 'homepage', adUrl);
  };

  return (
    <>
      {settings?.ads?.popup?.enabled && settings.ads.popup.imageUrl && (
        <PopupAd ad={settings.ads.popup} onAdClick={handleAdClick} />
      )}
      
      {/* Portada limpia y amplia: sin columna izquierda fija ni barra de países en el home */}
      <main className="py-6">
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* 1. COLUMNA PRINCIPAL DE CONTENIDO (8 a 8.5 de 12 cols) */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-8.5 flex flex-col gap-6">
            
            {/* Reportaje Principal de Apertura */}
            <section className="grid grid-cols-1">
              {heroArticle && <HeroPrincipal article={heroArticle} />}
            </section>
            
            {/* Sección Últimas Noticias */}
            <div className="mt-2" id="ultimas">
              <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-primary">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-5 bg-primary rounded-sm inline-block" />
                  <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Últimas Noticias
                  </h2>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-blue-400">
                  Edición en vivo
                </span>
              </div>
              <ArticleList articles={latestArticles} />
            </div>
            
            {/* Banner Patrocinado Intermedio */}
            {settings?.ads?.homeHorizontal && (
              <AdBannerClient ad={settings.ads.homeHorizontal} defaultSize="h-[100px]" adName="homeHorizontal_2" pageSlug="homepage" />
            )}

            {/* Sección Más Noticias */}
            {moreArticles.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-slate-300 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-5 bg-slate-700 dark:bg-slate-400 rounded-sm inline-block" />
                    <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      Más Noticias
                    </h2>
                  </div>
                </div>
                <ArticleList articles={moreArticles} />
              </div>
            )}
          </div>

          {/* 2. COLUMNA LATERAL DERECHA (4 a 3.5 de 12 cols): Lo más leído, Reels, Anuncios y Clima */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3.5 flex flex-col gap-6 sticky top-24 h-fit">
            {mostReadArticles && mostReadArticles.length > 0 && (
              <MostReadList items={mostReadArticles.map(a => ({ title: a.title, href: `/articles/${a.slug}` }))} />
            )}

            {adTop?.enabled && adTop.imageUrl && (
              <SideHighlightAd
                title={adTop.label || 'Vuelos y Turismo en el Caribe'}
                imageUrl={adTop.imageUrl}
                linkUrl={adTop.linkUrl || '#'}
                onAdClick={() => handleAdClick('sidebarMiddle', adTop.linkUrl!)}
              />
            )}

            {/* Bloque de Reels destacado temporalmente oculto a solicitud del cliente */}

            <WeatherWidget />

            {adBottom?.enabled && adBottom.imageUrl && (
              <SideHighlightAd
                title={adBottom.label || 'Banca y Remesas Internacionales'}
                imageUrl={adBottom.imageUrl}
                linkUrl={adBottom.linkUrl || '#'}
                onAdClick={() => handleAdClick('sidebarBottom', adBottom.linkUrl!)}
              />
            )}
          </aside>
        </div>

        {/* Banner Inferior */}
        {settings?.ads?.footerHorizontal && (
          <div className="mt-8">
            <AdBannerClient ad={settings.ads.footerHorizontal} defaultSize="h-[110px]" adName="footerHorizontal" pageSlug="homepage" />
          </div>
        )}
      </main>
    </>
  );
}

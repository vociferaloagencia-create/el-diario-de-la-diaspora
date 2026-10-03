import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories, getCategoryBySlug, getArticlesByCategory, getMostReadArticles } from "@/lib/firestore";
import type { Article, SiteSettings } from "@/lib/types";
import { notFound } from "next/navigation";
import { MostReadList } from "@/components/site/MostReadList";
import { SideHighlightAd } from "@/components/site/SideHighlightAd";
import { trackAdClick } from "@/lib/firestore";
import { ArticleList } from "@/components/site/ArticleList";
import { AdBannerClient } from "@/components/site/AdBannerClient";
import { Pagination } from "@/components/ui/pagination";
import Link from "next/link";
import { Globe } from "lucide-react";
import { TranslatedCategoryName } from "@/components/site/TranslatedCategoryName";

export const dynamic = 'force-dynamic';

const ARTICLES_PER_PAGE = 9;

const DIASPORA_COUNTRIES = [
  'Todas',
  'República Dominicana',
  'México',
  'Brasil',
  'República de Chile',
  'Cuba',
  'Bahamas',
  'Venezuela',
  'EE.UU.',
  'Canadá',
  'Francia',
  'España',
  'Argentina',
  'Guayana Francesa',
  'Suiza'
];

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pais?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = decodeURIComponent(resolvedParams.slug);
  const page = Number(resolvedSearchParams?.page || 1);
  const selectedCountry = resolvedSearchParams?.pais;
  
  const settings = await getSiteSettings();
  const allCategories = await getCategories();
  const currentCategory = await getCategoryBySlug(slug);

  if (!currentCategory) {
    notFound();
  }

  const [allCategoryArticles, mostReadArticles] = await Promise.all([
    getArticlesByCategory(slug),
    getMostReadArticles(),
  ]);

  let allArticles = allCategoryArticles.filter(a => a.status === 'published');

    // Filtrado por país en La Diáspora si se especifica
  if (slug === 'la-diaspora' && selectedCountry && selectedCountry !== 'Todas') {
    let term = selectedCountry.toLowerCase();
    if (term === 'república de chile') {
        term = 'chile';
    }
    const filtered = allArticles.filter(a => 
      a.title?.toLowerCase().includes(term) ||
      a.summary?.toLowerCase().includes(term) ||
      a.tags?.some(t => t.toLowerCase().includes(term))
    );
    if (filtered.length > 0) {
      allArticles = filtered;
    }
  }
  
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = allArticles.slice(
    (page - 1) * ARTICLES_PER_PAGE,
    page * ARTICLES_PER_PAGE
  );

  const handleAdClick = async (adName: string, adUrl: string) => {
    'use server';
    await trackAdClick(adName, `category/${slug}`, adUrl);
  };

  const adTop = settings?.ads?.sidebarMiddle;
  const adBottom = settings?.ads?.sidebarBottom;

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={allCategories.filter(c => c.isVisible).sort((a,b) => a.order - b.order)} />
      
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-grow py-6">
        {settings?.ads?.homeHorizontal && (
          <AdBannerClient ad={settings.ads.homeHorizontal} defaultSize="h-[100px]" adName="categoryTop" pageSlug={`category/${slug}`} />
        )}
        
        <div className="grid grid-cols-12 gap-8 items-start">
            
            {/* Columna Principal de Artículos (8 a 8.5 de 12 cols) */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-8.5 flex flex-col gap-6">
              <section>
                <div className="pb-3 mb-5 border-b-2 border-primary flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-primary rounded-sm inline-block" />
                    <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      <TranslatedCategoryName name={currentCategory.name} />
                    </h1>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {allArticles.length} noticias
                  </span>
                </div>

                {/* FILTRO DE PAÍSES EXCLUSIVO PARA LA DIÁSPORA (Requerimiento de la clienta) */}
                {slug === 'la-diaspora' && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 mb-6 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-headline">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>EDICIÓN GEOGRÁFICA DIÁSPORA (PAÍSES):</span>
                      </div>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">Selecciona tu país de interés</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap py-1">
                      {DIASPORA_COUNTRIES.map((country) => {
                        const isSelected = (!selectedCountry && country === 'Todas') || selectedCountry === country;
                        return (
                          <Link
                            key={country}
                            href={country === 'Todas' ? '/category/la-diaspora' : `/category/la-diaspora?pais=${encodeURIComponent(country)}`}
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                              isSelected
                                ? "bg-primary text-white shadow-sm font-black"
                                : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                            }`}>
                            {country}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {paginatedArticles.length > 0 ? (
                  <>
                    <ArticleList articles={paginatedArticles} />
                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination 
                          currentPage={page}
                          totalPages={totalPages}
                          basePath={`/category/${slug}`}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <p className="text-muted-foreground font-serif text-base">Aún no hay artículos disponibles para este criterio.</p>
                  </div>
                )}
              </section>
            </div>

            {/* Columna Lateral Derecha (4 a 3.5 de 12 cols) */}
            <aside className="col-span-12 lg:col-span-4 xl:col-span-3.5 flex flex-col gap-6 sticky top-24 h-fit">
                {mostReadArticles && mostReadArticles.length > 0 && (
                  <MostReadList items={mostReadArticles.map(a => ({ title: a.title, href: `/articles/${a.slug}` }))} />
                )}

                {adTop?.enabled && adTop.imageUrl && (
                    <SideHighlightAd
                        title={adTop.label || 'Vuelos y Turismo en el Caribe'}
                        imageUrl={adTop.imageUrl}
                        linkUrl={adTop.linkUrl || '#'}
                        onAdClick={async () => {
                          'use server';
                          if(adTop.linkUrl) await handleAdClick('sidebarMiddle', adTop.linkUrl);
                        }}
                    />
                )}

                {adBottom?.enabled && adBottom.imageUrl && (
                     <SideHighlightAd
                        title={adBottom.label || 'Banca y Remesas Internacionales'}
                        imageUrl={adBottom.imageUrl}
                        linkUrl={adBottom.linkUrl || '#'}
                         onAdClick={async () => {
                          'use server';
                          if(adBottom.linkUrl) await handleAdClick('sidebarBottom', adBottom.linkUrl);
                        }}
                    />
                )}
            </aside>
        </div>

        {settings?.ads?.footerHorizontal && (
          <div className="mt-8">
            <AdBannerClient ad={settings.ads.footerHorizontal} defaultSize="h-[110px]" adName="footerHorizontal" pageSlug={`category/${slug}`} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

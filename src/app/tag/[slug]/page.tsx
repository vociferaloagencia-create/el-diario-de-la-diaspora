import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories, getAllArticles } from "@/lib/firestore";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";

export const dynamic = 'force-dynamic';

interface TagPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.branding?.siteName || 'La Cifra';
  const tag = decodeURIComponent(params.slug);
  return {
    title: `#${tag} | ${siteName}`,
    description: `Artículos etiquetados con "${tag}"`,
    keywords: tag,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.slug);
  const [settings, categories, allArticles] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getAllArticles(),
  ]);

  const articles = allArticles
    .filter(a => a.status === 'published' && Array.isArray(a.tags) && a.tags.includes(tag))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (articles.length === 0) notFound();

  const visibleCategories = categories.filter(c => c.isVisible).sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={visibleCategories} />
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-10 flex-grow py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">#{tag}</h1>
            <p className="text-muted-foreground text-sm">
              {articles.length} {articles.length === 1 ? 'artículo' : 'artículos'} encontrados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link key={article._id} href={`/articles/${article.slug}`} className="group flex flex-col rounded-xl border overflow-hidden hover:shadow-md transition-shadow bg-card">
              <div className="relative aspect-video bg-muted overflow-hidden">
                {article.heroImageUrl ? (
                  <Image src={article.heroImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-4xl font-bold">
                    {article.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h2 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {article.tags?.map(t => (
                    <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${t === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

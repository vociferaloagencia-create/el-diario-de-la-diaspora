import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories, getUserById, getArticlesByAuthor } from "@/lib/firestore";
import type { Article, AppUser } from "@/lib/types";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/site/ArticleCard";
import { User, PenTool, BookOpen, Newspaper } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

interface ColumnistPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ColumnistPage({ params }: ColumnistPageProps) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);

  const [settings, categories, user] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getUserById(id),
  ]);

  if (!user) {
    notFound();
  }

  // Obtener todos los artículos publicados por este columnista
  const articles = await getArticlesByAuthor(user.uid || user.name || id);

  const displayName = user.name || user.username || "Columnista";
  const displayRole = user.authorRole || (user.role === 'superadmin' ? 'Superadministrador y Columnista' : 'Columnista');
  const displayBio = user.bio || `Columnista y colaborador editorial en El Diario de la Diáspora. Análisis, opinión y cobertura especializada.`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Header settings={settings} categories={categories.filter(c => c.isVisible).sort((a, b) => a.order - b.order)} />

      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Tarjeta de Perfil del Columnista */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-primary/20 bg-primary/10 flex items-center justify-center shrink-0 shadow-md">
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-headline">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <PenTool className="w-3 h-3" />
                  {displayRole}
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {displayBio}
              </p>

              <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  {articles.length} {articles.length === 1 ? 'artículo publicado' : 'artículos publicados'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Listado de Artículos del Columnista */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 dark:text-white">
              Publicaciones y Columnas de Opinión
            </h2>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article._id || article.id || article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Este columnista aún no tiene artículos publicados.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Vuelve pronto para leer sus próximos análisis de opinión.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

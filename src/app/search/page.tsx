import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSiteSettings, getCategories, getAllArticles } from "@/lib/firestore";
import { SearchClient } from "@/components/site/SearchClient";

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim().toLowerCase() ?? '';

  const [settings, categories, allArticles] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getAllArticles(),
  ]);

  const visibleCategories = categories.filter(c => c.isVisible).sort((a, b) => a.order - b.order);

  const results = query
    ? allArticles.filter(a => {
        if (a.status !== 'published') return false;
        const inTitle = a.title.toLowerCase().includes(query);
        const inSummary = a.summary?.toLowerCase().includes(query);
        const inTags = Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(query));
        return inTitle || inSummary || inTags;
      }).sort((a, b) => {
        // Exact tag match ranks higher
        const aTagMatch = Array.isArray(a.tags) && a.tags.some(t => t === query) ? 2 : 0;
        const bTagMatch = Array.isArray(b.tags) && b.tags.some(t => t === query) ? 2 : 0;
        const aTitleMatch = a.title.toLowerCase().includes(query) ? 1 : 0;
        const bTitleMatch = b.title.toLowerCase().includes(query) ? 1 : 0;
        return (bTagMatch + bTitleMatch) - (aTagMatch + aTitleMatch);
      })
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={visibleCategories} />
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-10 flex-grow py-8">
        <SearchClient initialQuery={searchParams.q ?? ''} results={results} />
      </main>
      <Footer />
    </div>
  );
}

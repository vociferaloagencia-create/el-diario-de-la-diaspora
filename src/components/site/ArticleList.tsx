import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/site/ArticleCard";

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No articles found for this category.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article._id || article.id} article={article} />
      ))}
    </div>
  );
}

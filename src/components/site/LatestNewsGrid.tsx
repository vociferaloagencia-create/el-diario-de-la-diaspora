import type { Article } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

interface LatestNewsGridProps {
    articles: Article[];
}

export function LatestNewsGrid({ articles }: LatestNewsGridProps) {
    if (!articles || articles.length === 0) {
        return null;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
                <ArticleCard key={article._id || article.id} article={article} />
            ))}
        </div>
    )
}

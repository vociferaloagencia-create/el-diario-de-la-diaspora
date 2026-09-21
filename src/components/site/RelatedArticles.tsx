import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface RelatedArticle {
    title: string;
    imageUrl: string;
    category: string;
    href: string;
}

interface RelatedArticlesProps {
    articles: RelatedArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
    if (articles.length === 0) {
        return null;
    }
    return (
        <div className="mt-0">
            <h2 className="text-2xl font-bold font-headline mb-4">Artículos Relacionados</h2>
            <div className="grid grid-cols-1 gap-4">
                {articles.map((article, index) => (
                    <Link key={`${article.href}-${index}`} href={article.href} className="group flex items-center gap-4">
                        <div className="relative w-24 h-24 shrink-0">
                            <Image src={article.imageUrl} alt={article.title} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover rounded-md"/>
                        </div>
                        <div className="flex flex-col gap-1">
                             <Badge variant="secondary" className="w-fit mb-1">{article.category}</Badge>
                             <h3 className="text-base font-bold leading-tight group-hover:text-primary dark:group-hover:text-primary line-clamp-3">{article.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

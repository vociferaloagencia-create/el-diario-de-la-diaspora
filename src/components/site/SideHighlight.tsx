import Link from "next/link";
import { Badge } from "../ui/badge";
import type { Article } from "@/lib/types";

interface SideHighlightProps {
    article: Article;
}

export function SideHighlight({ article }: SideHighlightProps) {
  if (!article) return null;
  
  return (
    <Link href={`/articles/${article.slug}`} className="group flex flex-col gap-2">
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url("${article.heroImageUrl}")` }}
      ></div>
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit text-xs uppercase">{article.categoryId}</Badge>
        <h3 className="font-bold leading-tight group-hover:text-primary dark:group-hover:text-primary line-clamp-2">{article.title}</h3>
      </div>
    </Link>
  );
}

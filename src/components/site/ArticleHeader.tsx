import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface ArticleHeaderProps {
  title: string;
  category: { name: string; slug: string };
  author: { name: string };
  publishedAt: string;
  readingTime: number;
}

export function ArticleHeader({ title, category, author, publishedAt, readingTime }: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      {category && (
        <Badge variant="secondary" className="mb-2">
          {category.name}
        </Badge>
      )}
      <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight mb-4">
        {title}
      </h1>
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <span>By {author.name}</span>
        <span>{format(new Date(publishedAt), 'MMMM d, yyyy')}</span>
        <span>{readingTime} min read</span>
      </div>
    </header>
  );
}

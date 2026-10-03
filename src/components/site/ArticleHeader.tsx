import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Clock, Tag } from "lucide-react";
import Link from 'next/link';

interface ArticleHeaderProps {
  title: string;
  category: { name: string; slug: string };
  author: { name: string; avatarUrl?: string };
  publishedAt: string;
  readingTime: number;
}

export function ArticleHeader({ title, category, author, publishedAt, readingTime }: ArticleHeaderProps) {
  let formattedDate = publishedAt;
  try {
    formattedDate = format(new Date(publishedAt), "d 'de' MMMM, yyyy", { locale: es });
  } catch (e) {
    // fallback
  }

  return (
    <header className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
      {category && (
        <Link href={`/category/${category.slug}`}>
          <Badge variant="default" className="mb-4 bg-primary text-white hover:bg-primary/90 text-xs uppercase tracking-wider px-3 py-1 font-bold">
            <Tag className="w-3 h-3 mr-1 inline" />
            {category.name}
          </Badge>
        </Link>
      )}
      <h1 className="text-3xl md:text-5xl font-extrabold font-headline leading-tight mb-6 text-slate-900 dark:text-white">
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-600 dark:text-slate-300 text-sm font-medium bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span>Por <strong className="text-slate-900 dark:text-white">{author.name || "Redacción"}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>{readingTime || 3} min de lectura</span>
        </div>
      </div>
    </header>
  );
}

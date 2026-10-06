import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Clock, User } from "lucide-react";
import { TranslatedCategoryName } from "./TranslatedCategoryName";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // Ocultar cualquier ID técnico o código criptográfico y mostrar el nombre real del autor
  const isTechnicalId = (val?: string) => !val || (val.length > 20 && !val.includes(' '));
  const journalistName = (!isTechnicalId(article.authorName) && article.authorName?.trim())
    ? article.authorName.trim()
    : 'Redacción El Diario';

  // Cálculo de tiempo de lectura real basado en palabras limpias
  const calculateReadingTime = () => {
    if (article.content) {
      const cleanText = article.content.replace(/<[^>]*>/g, ' ').trim();
      const words = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
      if (words > 0) {
        return Math.max(1, Math.ceil(words / 200));
      }
    }
    return article.readingTimeMinutes || 2;
  };

  const readingTime = calculateReadingTime();

  return (
    <a href={`/articles/${article.slug}`} className="flex flex-col gap-3 group rounded-xl">
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:shadow-md transition-shadow">
        {article.heroImageUrl ? (
          <Image
            src={article.heroImageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-blue-400 font-headline bg-primary/10 px-2 py-0.5 rounded">
            <TranslatedCategoryName name={article.categoryId ? article.categoryId.replace(/-/g, ' ') : 'Actualidad'} />
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date(article.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-serif font-bold leading-snug text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
        <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 text-xs font-headline">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md text-[11px]">
            <User className="h-3 w-3 text-primary shrink-0" />
            Periodista: <span className="font-semibold text-slate-900 dark:text-white">{journalistName}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
            <Clock className="h-3 w-3" />
            {readingTime} min
          </span>
        </div>
      </div>
    </a>
  );
}



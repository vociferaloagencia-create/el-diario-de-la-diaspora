import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, User } from "lucide-react";
import { TranslatedCategoryName } from "./TranslatedCategoryName";

interface HeroPrincipalProps {
  article: {
    slug: string;
    heroImageUrl: string;
    title: string;
    summary: string;
    categoryId: string;
    readingTimeMinutes?: number;
    publishedAt?: string;
    authorName?: string;
  };
}

export function HeroPrincipal({ article }: HeroPrincipalProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl h-[420px] md:h-[500px] flex flex-col justify-end shadow-xl border border-slate-200/40 dark:border-slate-800/80 bg-slate-900">
      {article.heroImageUrl && (
        <Image
          src={article.heroImageUrl}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 65vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      )}
      
      {/* Gradiente cinemático de alto contraste para máxima legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent z-[1]" />
      
      {/* Contenido Editorial */}
      <div className="relative z-10 flex w-full flex-col gap-3 p-5 sm:p-7 md:p-8 text-white">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge className="bg-primary text-white hover:bg-primary border border-white/20 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
            <TranslatedCategoryName name={article.categoryId.replace(/-/g, ' ')} />
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-100 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
            <User className="h-3 w-3 text-amber-300" />
            Periodista: {article.authorName || "Redacción El Diario"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/30">
            <Sparkles className="h-3 w-3" />
            Tema Principal
          </span>
          {article.readingTimeMinutes && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-300 font-medium">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTimeMinutes} min de lectura
            </span>
          )}
        </div>

        <Link href={`/articles/${article.slug}`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-serif font-extrabold leading-tight tracking-tight text-white hover:text-blue-200 transition-colors line-clamp-2 md:line-clamp-3 drop-shadow-sm">
            {article.title}
          </h1>
        </Link>

        <p className="hidden sm:block text-sm md:text-base font-normal text-slate-200/90 max-w-3xl line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
      </div>
    </div>
  );
}



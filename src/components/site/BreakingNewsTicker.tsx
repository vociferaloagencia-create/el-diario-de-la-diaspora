"use client";

import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getLatestArticles } from "@/lib/firestore";
import type { Article } from "@/lib/types";

interface BreakingNewsTickerProps {
  breakingTitle?: string;
  breakingUrl?: string;
  publishedAt?: string | any;
}

export function BreakingNewsTicker({
  breakingTitle,
  breakingUrl,
  publishedAt,
}: BreakingNewsTickerProps) {
  const [latestArticle, setLatestArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(!breakingTitle);

  useEffect(() => {
    if (breakingTitle) return;
    let isMounted = true;
    async function loadLatest() {
      try {
        const articles = await getLatestArticles(1);
        if (isMounted && articles.length > 0) {
          setLatestArticle(articles[0]);
        }
      } catch (e) {
        console.error("Error al cargar última hora:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLatest();
    return () => { isMounted = false; };
  }, [breakingTitle]);

  const title = breakingTitle || latestArticle?.title;
  const slug = latestArticle?.slug;
  const url = breakingUrl || (slug ? `/articles/${slug}` : null);
  const dateValue = publishedAt || latestArticle?.publishedAt;

  if (loading || !title || !url) return null;

  // Regla de 24 horas: si pasaron más de 24 horas sin nueva noticia, se oculta
  if (dateValue) {
    let publishedTime: number | null = null;
    if (typeof dateValue === 'string') {
      publishedTime = new Date(dateValue).getTime();
    } else if (dateValue?.seconds) {
      publishedTime = dateValue.seconds * 1000;
    } else if (dateValue instanceof Date) {
      publishedTime = dateValue.getTime();
    }

    if (publishedTime && !isNaN(publishedTime)) {
      const hoursAgo = (Date.now() - publishedTime) / (1000 * 60 * 60);
      if (hoursAgo > 24) {
        return null;
      }
    }
  }

  return (
    <div className="w-full bg-[#D32F2F] text-white py-1.5 px-4 shadow-sm border-b border-red-700/50">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Insignia ÚLTIMA HORA */}
          <span className="flex items-center gap-1 bg-black/25 text-white font-black uppercase text-[10px] sm:text-xs px-2 py-0.5 rounded tracking-wider shrink-0 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-yellow-300" />
            ÚLTIMA HORA
          </span>

          {/* Titular con enlace directo */}
          <Link
            href={url}
            className="font-serif font-bold text-white hover:underline truncate transition-all text-xs sm:text-[13px]"
            title={title}
          >
            {title}
          </Link>
        </div>

        {/* Botón Ver Más */}
        <Link
          href={url}
          className="hidden md:flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider text-white/90 hover:text-white shrink-0 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
        >
          <span>Leer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

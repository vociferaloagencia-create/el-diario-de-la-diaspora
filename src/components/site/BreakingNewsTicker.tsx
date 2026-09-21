"use client";

import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";

interface BreakingNewsTickerProps {
  breakingTitle?: string;
  breakingUrl?: string;
}

export function BreakingNewsTicker({
  breakingTitle = "Nuevos acuerdos de doble titulación y homologación laboral para profesionales migrantes entran en vigor",
  breakingUrl = "/articles/cumbre-iberoamericana-diaspora-2026",
}: BreakingNewsTickerProps) {
  if (!breakingTitle) return null;

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
            href={breakingUrl}
            className="font-serif font-bold text-white hover:underline truncate transition-all text-xs sm:text-[13px]"
            title={breakingTitle}
          >
            {breakingTitle}
          </Link>
        </div>

        {/* Botón Ver Más */}
        <Link
          href={breakingUrl}
          className="hidden md:flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider text-white/90 hover:text-white shrink-0 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
        >
          <span>Leer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

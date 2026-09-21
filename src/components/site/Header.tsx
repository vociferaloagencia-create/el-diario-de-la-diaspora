"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { SiteSettings, Category } from "@/lib/types";
import { Button } from "../ui/button";
import { AuthArea } from "./AuthArea";
import { Menu, Search, X, ChevronRight, ChevronDown, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../ui/sheet";
import { BreakingNewsTicker } from "./BreakingNewsTicker";

interface HeaderProps {
  settings: SiteSettings | null;
  categories: Category[];
}

const defaultNavCategories: Category[] = [
  { _id: 'actualidad', name: 'Actualidad', slug: 'actualidad', order: 1, isVisible: true },
  { _id: 'la-diaspora', name: 'La Diáspora', slug: 'la-diaspora', order: 2, isVisible: true },
  { _id: 'nacional', name: 'Nacional', slug: 'nacional', order: 3, isVisible: true },
  { _id: 'internacional', name: 'Internacional', slug: 'internacional', order: 4, isVisible: true },
  { _id: 'economia', name: 'Economía', slug: 'economia', order: 5, isVisible: true },
  { _id: 'deportes', name: 'Deportes', slug: 'deportes', order: 6, isVisible: true },
  { _id: 'cultura', name: 'Cultura', slug: 'cultura', order: 7, isVisible: true },
  { _id: 'la-comunidad', name: 'La Comunidad', slug: 'la-comunidad', order: 8, isVisible: true },
  { _id: 'opinion', name: 'Editorial / Opinión', slug: 'opinion', order: 9, isVisible: true },
];

const DIASPORA_COUNTRIES = [
  { name: 'República Dominicana', slug: 'republica-dominicana' },
  { name: 'México', slug: 'mexico' },
  { name: 'Brasil', slug: 'brasil' },
  { name: 'Chile', slug: 'chile' },
  { name: 'Cuba', slug: 'cuba' },
  { name: 'Bahamas', slug: 'bahamas' },
  { name: 'Venezuela', slug: 'venezuela' },
  { name: 'EE.UU.', slug: 'eeuu' },
  { name: 'Canadá', slug: 'canada' },
  { name: 'Francia', slug: 'francia' },
  { name: 'España', slug: 'espana' },
];

type Language = 'ES' | 'FR' | 'EN' | 'AR';

export function Header({ settings, categories }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('ES');
  const [isDiasporaMenuOpen, setIsDiasporaMenuOpen] = useState(true);
  const [dateStr, setDateStr] = useState("LUNES, 7 DE SEPTIEMBRE DE 2026");

  useEffect(() => {
    try {
      const now = new Date();
      const formatted = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setDateStr(formatted.toUpperCase());
    } catch (e) {
      // fallback
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
    }
  };

  const navCategories = (categories && categories.length > 0 ? categories : defaultNavCategories).map(c => {
    // Asegurar que Cultura nunca tenga '/ H'
    if (c.slug === 'cultura' || c.name.toLowerCase().includes('cultura')) {
      return { ...c, name: 'Cultura' };
    }
    return c;
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* 1. TOP ROW: Fecha a la Izquierda | LOGO EN EL CENTRO | Selector + Buscar + Suscríbete + Perfil a la Derecha */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Izquierda: Fecha formal y Edición Digital */}
          <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 font-headline flex-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {dateStr}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Edición Digital Internacional
            </span>
          </div>

          {/* Centro: EL LOGO EN EL CENTRO (Requerimiento de la clienta) */}
          <div className="flex items-center justify-center flex-shrink-0 flex-1 lg:flex-none">
            <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-90">
              <Image
                src="/logo-horizontal.png"
                alt={settings?.branding?.siteName || "El Diario de la Diáspora"}
                width={360}
                height={68}
                priority
                className="h-9 sm:h-11 md:h-12 w-auto object-contain dark:brightness-125"
              />
            </Link>
          </div>

          {/* Derecha: Selector 4 Idiomas + Buscar + Botón SUSCRÍBETE + Perfil */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
            
            {/* Selector de Idiomas: ES | FR | EN | AR */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-md p-0.5">
              {(['ES', 'FR', 'EN', 'AR'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setCurrentLang(lang)}
                  className={`px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded transition-all ${
                    currentLang === lang
                      ? 'bg-primary text-white shadow-sm font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'
                  }`}
                  title={`Cambiar a ${lang}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    autoFocus
                    className="h-8 w-28 sm:w-40 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-1.5 p-1.5 text-xs font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Buscar"
                  title="Buscar"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-semibold">Buscar</span>
                </button>
              )}
            </form>

            {/* Botón SUSCRÍBETE */}
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1 h-8 uppercase tracking-wider rounded shadow-sm whitespace-nowrap"
            >
              <Link href="/submit">SUSCRÍBETE</Link>
            </Button>

            {/* Ícono de Usuario / Perfil */}
            <AuthArea context="header" />
          </div>
        </div>
      </div>

      {/* 2. BOTTOM ROW (BARRA AZUL): ☰ MENÚ + Categorías horizontales con línea activa */}
      <div className="w-full bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 h-10">
          {/* Botón ☰ MENÚ */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-white/15 px-2.5 h-7 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 rounded-sm flex-shrink-0"
              >
                <Menu className="h-4 w-4" />
                <span className="font-headline font-bold">MENÚ</span>
              </Button>
            </SheetTrigger>

            {/* Menú Lateral (Drawer) */}
            <SheetContent side="left" className="w-[310px] sm:w-[360px] p-0 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
              <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <SheetTitle className="text-left">
                  <Image src="/logo-horizontal.png" alt="El Diario de la Diáspora" width={220} height={45} className="h-8 w-auto object-contain dark:brightness-125" />
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary mb-2.5 flex items-center gap-1.5">
                    <span>SECCIONES NOTICIAS</span>
                  </h3>
                  
                  {/* Lista de Categorías (Sin Última Hora, como indicó la clienta) */}
                  <div className="flex flex-col space-y-0.5">
                    {navCategories.map((item) => {
                      const isDiaspora = item.slug === 'la-diaspora';
                      return (
                        <div key={item.slug} className="border-b border-slate-100 dark:border-slate-800/60 last:border-none">
                          <div className="flex items-center justify-between py-2">
                            <Link
                              href={`/category/${item.slug}`}
                              onClick={() => setIsSheetOpen(false)}
                              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary flex-1"
                            >
                              {item.name}
                            </Link>

                            {/* Acordeón para países dentro de La Diáspora */}
                            {isDiaspora ? (
                              <button
                                type="button"
                                onClick={() => setIsDiasporaMenuOpen(!isDiasporaMenuOpen)}
                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                                title="Ver países de la Diáspora"
                              >
                                {isDiasporaMenuOpen ? (
                                  <ChevronDown className="h-4 w-4 text-primary" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                            )}
                          </div>

                          {/* Submenú de Países de la Diáspora (Requerimiento de la clienta) */}
                          {isDiaspora && isDiasporaMenuOpen && (
                            <div className="pl-3 pr-1 pb-2 pt-0.5 grid grid-cols-1 gap-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
                                Países de la Diáspora:
                              </span>
                              {DIASPORA_COUNTRIES.map((country) => (
                                <Link
                                  key={country.slug}
                                  href={`/category/la-diaspora?pais=${country.slug}`}
                                  onClick={() => setIsSheetOpen(false)}
                                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-800 px-2 py-1 rounded transition-colors flex items-center justify-between"
                                >
                                  <span>{country.name}</span>
                                  <span className="text-[9px] text-slate-400">→</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    INSTITUCIONAL
                  </h3>
                  <Link
                    href="/category/la-comunidad"
                    onClick={() => setIsSheetOpen(false)}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-primary py-1"
                  >
                    Nuestra Comunidad
                  </Link>
                  <Link
                    href="/category/la-diaspora"
                    onClick={() => setIsSheetOpen(false)}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-primary py-1"
                  >
                    Visión
                  </Link>
                </div>
              </div>

              {/* Pie del Menú Lateral */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-2">
                  <Link href="/submit" onClick={() => setIsSheetOpen(false)}>
                    SUSCRÍBETE AHORA
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Navegación horizontal de Categorías */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1">
            {navCategories.map((item) => {
              const isActive = pathname === `/category/${item.slug}`;
              return (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className={`relative text-xs sm:text-[13px] font-semibold uppercase tracking-wider px-2 sm:px-2.5 py-1.5 whitespace-nowrap transition-all duration-150 hover:bg-white/10 rounded ${
                    isActive ? "text-white font-bold" : "text-primary-foreground/90"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. LÍNEA ROJA DE ÚLTIMA HORA (Solicitada expresamente debajo del menú azul) */}
      <BreakingNewsTicker />
    </header>
  );
}

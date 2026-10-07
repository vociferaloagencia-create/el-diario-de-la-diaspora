"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { SiteSettings, Category } from "@/lib/types";
import { Button } from "../ui/button";
import { AuthArea } from "./AuthArea";
import { Menu, Search, X, ChevronRight, ChevronDown, Globe, Bell, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../ui/sheet";
import { BreakingNewsTicker } from "./BreakingNewsTicker";
import { BrowserNotificationPrompt } from "./BrowserNotificationPrompt";


import { LanguageTranslator, setPageLanguage, LANGUAGES_LIST } from "./LanguageTranslator";
import { TranslatedCategoryName } from "./TranslatedCategoryName";

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
  { _id: 'opinion', name: 'Editorial / Opinión', slug: 'opinion', order: 8, isVisible: true },
];

const DIASPORA_COUNTRIES = [
  { name: 'República Dominicana', slug: 'republica-dominicana' },
  { name: 'México', slug: 'mexico' },
  { name: 'Brasil', slug: 'brasil' },
  { name: 'República de Chile', slug: 'República de Chile' },
  { name: 'Cuba', slug: 'cuba' },
  { name: 'Bahamas', slug: 'bahamas' },
  { name: 'Venezuela', slug: 'venezuela' },
  { name: 'EE.UU.', slug: 'eeuu' },
  { name: 'Canadá', slug: 'canada' },
  { name: 'Francia', slug: 'francia' },
  { name: 'España', slug: 'espana' },
  { name: 'Argentina', slug: 'argentina' },
  { name: 'Guayana Francesa', slug: 'guayana-francesa' },
  { name: 'Suiza', slug: 'suiza' },
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

      // Sync active language from localStorage
      const savedLang = localStorage.getItem("selected_site_lang") as Language;
      if (savedLang && ['ES', 'FR', 'EN', 'AR'].includes(savedLang)) {
        setCurrentLang(savedLang);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    setPageLanguage(lang);
  };

  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationState(Notification.permission);
    } else if (typeof window !== 'undefined') {
      setNotificationState('unsupported');
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Tu navegador no admite notificaciones push.');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('¡Las notificaciones ya están activadas en este dispositivo!');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('Las notificaciones están bloqueadas en tu navegador. Puedes habilitarlas en el candado de la barra de direcciones.');
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setNotificationState(res);
      if (res === 'granted') {
        localStorage.setItem('browser_push_subscribed', 'true');
        try {
          new Notification('El Diario de la Diáspora', {
            body: '¡Notificaciones activadas! Recibirás noticias de última hora al instante.',
            icon: '/icon.png',
          });
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Error al solicitar notificaciones:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
    }
  };

  const navCategories = (categories && categories.length > 0 ? categories : defaultNavCategories)
    .filter(c => {
      const slug = (c.slug || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      return !slug.includes('comunidad') && !name.includes('comunidad') && !slug.includes('vision') && !name.includes('visiÃ³n');
    })
    .map(c => {
      if (c.slug === 'cultura' || c.name.toLowerCase().includes('cultura')) {
        return { ...c, name: 'Cultura' };
      }
      return c;
    });

  return (
    <>
      <LanguageTranslator />
      <BrowserNotificationPrompt />
      
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* 1. TOP ROW: Fecha a la Izquierda | LOGO EN EL CENTRO | Selector + Buscar + SuscrÃ­bete + Perfil a la Derecha */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Izquierda: Menu Movil + Fecha formal */}
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative z-50 hover:bg-slate-100 dark:hover:bg-slate-900">
                  <Menu className="h-6 w-6 text-slate-800 dark:text-slate-200" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[350px] p-0 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
                <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <SheetTitle className="text-left">
                    <Image src={settings?.branding?.logoUrl || "/logo-horizontal.png"} alt="El Diario de la Diáspora" width={220} height={45} className="h-8 w-auto object-contain dark:brightness-125" />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                  {/* Selector de Idioma Movil */}
                  <div className="flex flex-col gap-2 p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg mb-1 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-headline uppercase flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      Idioma / Language:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {LANGUAGES_LIST.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            handleLanguageChange(item.code);
                            setIsSheetOpen(false);
                          }}
                          className={`notranslate flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                            currentLang === item.code
                              ? 'bg-primary text-white border-primary shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                          }`}
                        >
                          <span className="font-bold">{item.code}</span>
                          <span className="text-[11px] opacity-80">({item.label})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary mb-2.5 flex items-center gap-1.5">
                    <span>SECCIONES NOTICIAS</span>
                  </h3>
                  
                  {/* Lista de Categorías (Sin Última Hora, como indicÃ³ la clienta) */}
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
                              <TranslatedCategoryName name={item.name} />
                            </Link>

                            {/* AcordeÃ³n para paÃ­ses dentro de La Diáspora */}
                            {isDiaspora ? (
                              <button
                                type="button"
                                onClick={() => setIsDiasporaMenuOpen(!isDiasporaMenuOpen)}
                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                                title="Ver paÃ­ses de la Diáspora"
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

                          {/* SubmenÃº de Países de la Diáspora (Requerimiento de la clienta) */}
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
                    href="/comunidad"
                    onClick={() => setIsSheetOpen(false)}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-primary py-1"
                  >
                    Nuestra Comunidad
                  </Link>

                </div>
              </div>

              {/* Pie del Menú Lateral */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider py-2.5 shadow-sm">
                  <Link href="/submit" onClick={() => setIsSheetOpen(false)}>
                    SUSCRÍBETE AL PERIÓDICO
                  </Link>
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleToggleNotifications();
                    setIsSheetOpen(false);
                  }}
                  className="w-full font-semibold text-xs py-2 gap-2 border-slate-200 dark:border-slate-800"
                >
                  <Bell className="w-4 h-4 text-primary" />
                  <span>{notificationState === 'granted' ? 'Notificaciones Activas' : 'Activar Notificaciones Web'}</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
            <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 font-headline">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {dateStr}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Edición Digital
            </span>
          </div>

          </div>

          {/* Centro: LOGO OFICIAL AMPLIO, DESTACADO Y GRUESO */}
          <div className="flex items-center justify-center flex-1 py-1 shrink-0">
            <Link href="/" className="inline-flex items-center transition-transform hover:scale-[1.01] px-2">
              <Image
                src={settings?.branding?.logoUrl || "/logo-horizontal.png"}
                alt={settings?.branding?.siteName || "El Diario de la Diáspora"}
                width={520}
                height={140}
                priority
                style={{ height: `${settings?.branding?.logoHeight || 60}px`, width: 'auto' }}
                className="w-auto max-w-full object-contain dark:brightness-125 drop-shadow-xs"
              />
            </Link>
          </div>

          {/* Derecha: Selector 4 Idiomas + Buscar + Boton SUSCRÍBETE + Perfil */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">
            
            {/* SELECTOR DE IDIOMA */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-0.5 mr-1 sm:mr-2 shadow-2xs">
              {LANGUAGES_LIST.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleLanguageChange(item.code)}
                  className={`notranslate px-2 py-0.5 rounded text-xs font-extrabold uppercase transition-all ${
                    currentLang === item.code
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'
                  }`}
                  title={item.label}
                >
                  {item.code}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="hidden md:flex relative group">
              <input
                type="search"
                placeholder="Buscar noticias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            </form>

            <Button 
              type="button" 
              onClick={handleToggleNotifications}
              variant="outline" 
              size="sm" 
              className="hidden md:flex rounded-full px-3 h-9 gap-1.5 border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-primary/50 transition-all shadow-xs"
              title={notificationState === 'granted' ? 'Notificaciones web activadas' : 'Activar notificaciones web'}
            >
              <Bell className={`w-3.5 h-3.5 ${notificationState === 'granted' ? 'text-emerald-500 fill-emerald-500' : 'text-slate-600 dark:text-slate-300'}`} />
              <span className="hidden lg:inline">{notificationState === 'granted' ? 'Alertas Activas' : 'Notificaciones'}</span>
            </Button>

            <Button asChild variant="default" size="sm" className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-5 shadow-sm hover:shadow transition-all">
              <Link href="/submit">SUSCRÍBETE</Link>
            </Button>
            
            <AuthArea context="header" />
            
            

          </div>
        </div>
      </div>

      {/* 2. SECOND ROW Navigation */}
      <div className="bg-primary w-full shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Navegacion horizontal de Categorias */}
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
                  <TranslatedCategoryName name={item.name} />
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. LÃNEA ROJA DE ÚLTIMA HORA (Solicitada expresamente debajo del menÃº azul) */}
      <BreakingNewsTicker tickerSettings={settings.ticker} />
    </header>
  </>
  );
}

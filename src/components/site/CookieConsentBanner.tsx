"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent_accepted");
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Si localStorage no está disponible, no forzar
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie_consent_accepted", "true");
    } catch {
      // Silenciar error en caso de modo incógnito estricto
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 text-sm text-slate-300">
          <div className="p-2 bg-primary/20 text-primary rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <Cookie className="h-5 w-5 text-amber-400" />
          </div>
          <p className="leading-relaxed">
            Utilizamos cookies propias y de terceros (incluyendo servicios de Google y redes publicitarias) para analizar el tráfico y mostrar anuncios personalizados según tus intereses. Puedes consultar los detalles en nuestra{" "}
            <Link href="/privacidad" className="text-white underline font-semibold hover:text-primary transition-colors">
              Política de Privacidad y Cookies
            </Link>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg text-sm transition-all shadow-md"
          >
            Aceptar Cookies
          </Button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Cerrar aviso"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

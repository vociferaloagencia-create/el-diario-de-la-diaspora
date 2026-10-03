"use client";

import { useState, useEffect } from "react";
import { Bell, BellRing, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrowserNotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const currentPerm = Notification.permission;
      setPermission(currentPerm);
      const isDismissed = localStorage.getItem("browser_push_dismissed") === "true";
      const isSubscribed = localStorage.getItem("browser_push_subscribed") === "true";

      // Show ONLY if NOT dismissed, NOT subscribed, and permission is default
      if (!isDismissed && !isSubscribed && currentPerm === "default") {
        setShowPrompt(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setIsSubmitting(true);
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        localStorage.setItem("browser_push_subscribed", "true");
        setShowPrompt(false);
        new Notification("El Diario de la Diáspora", {
          body: "¡Notificaciones de navegador activadas con éxito! Recibirás las noticias de última hora aquí.",
          icon: "/icon.png",
          badge: "/icon.png",
        });
      } else {
        localStorage.setItem("browser_push_dismissed", "true");
        setShowPrompt(false);
      }
    } catch (e) {
      console.warn("Notification permission error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("browser_push_dismissed", "true");
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="w-full bg-slate-900 text-white py-2.5 px-4 border-b border-slate-800 shadow-md transition-all">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 animate-pulse">
            <BellRing className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-white font-headline">NOTIFICACIONES DEL NAVEGADOR:</span>{" "}
            <span className="text-slate-300 text-xs">
              Recibe avisos al instante en tu pantalla cuando publiquemos una nueva noticia (Sin correos).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={requestNotificationPermission}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider h-8 px-4 rounded shadow-sm gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            Activar Notificaciones
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar aviso"
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

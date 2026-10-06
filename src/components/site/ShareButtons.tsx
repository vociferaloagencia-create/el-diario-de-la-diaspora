"use client";

import React, { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, MessageCircle, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(() => {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `https://eldiariodeladiaspora.com${cleanUrl}`;
  });
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.href);
      setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
    }
  }, [url]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast({
        title: "Enlace copiado",
        description: "El enlace de la noticia se ha copiado al portapapeles.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar automáticamente el enlace.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: fullUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    handleCopy();
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedWhatsAppText = encodeURIComponent(`${title}\n\n${fullUrl}`);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedWhatsAppText}`,
      color: "hover:bg-emerald-600 hover:text-white text-emerald-600 border-emerald-200 dark:border-emerald-800",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600 hover:text-white text-blue-600 border-blue-200 dark:border-blue-800",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-sky-500 hover:text-white text-sky-500 border-sky-200 dark:border-sky-800",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-700 hover:text-white text-blue-700 border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 my-8 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mr-1 flex items-center gap-1.5">
        <Share2 className="w-4 h-4 text-primary" />
        Compartir:
      </span>

      {/* Botón Compartir Nativo (Ideal para iPhone / Android) */}
      {canNativeShare && (
        <Button
          type="button"
          onClick={handleNativeShare}
          size="sm"
          className="h-9 px-3 gap-1.5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </Button>
      )}

      {/* Botones de Redes Sociales individuales */}
      {shareLinks.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.name}
            variant="outline"
            size="icon"
            className={`h-9 w-9 transition-colors shadow-2xs ${item.color}`}
            asChild
          >
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Compartir en ${item.name}`}
              title={`Compartir en ${item.name}`}
            >
              <Icon className="h-4 w-4" />
            </a>
          </Button>
        );
      })}

      {/* Botón Copiar Enlace Directo */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-9 px-2.5 text-xs text-slate-700 dark:text-slate-300 gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs"
        title="Copiar enlace al portapapeles"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold text-emerald-600">Copiado</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline font-medium">Copiar enlace</span>
          </>
        )}
      </Button>
    </div>
  );
}

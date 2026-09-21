"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { PopupAdSetting } from "@/lib/types";
import { Button } from "../ui/button";

interface PopupAdProps {
  ad: PopupAdSetting;
  onAdClick: (adName: string, adUrl: string) => void;
}

export function PopupAd({ ad, onAdClick }: PopupAdProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open the popup after a short delay to allow the page to render
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 1000); // 1 second delay before showing

    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (isOpen && ad.duration) {
      const closeTimer = setTimeout(() => {
        setIsOpen(false);
      }, ad.duration * 1000); // Convert seconds to milliseconds

      return () => clearTimeout(closeTimer);
    }
  }, [isOpen, ad.duration]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (ad.linkUrl) {
        e.preventDefault();
        onAdClick('popup', ad.linkUrl);
    }
  };

  if (!isOpen || !ad.enabled || !ad.imageUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="relative bg-background rounded-lg shadow-2xl w-full max-w-md p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(false)}
          className="absolute -top-4 -right-4 bg-white hover:bg-slate-100 rounded-full h-9 w-9 z-10"
        >
          <X className="h-5 w-5 text-slate-800" />
          <span className="sr-only">Cerrar anuncio</span>
        </Button>
        <a 
          href={ad.linkUrl}
          target="_blank" 
          rel="noopener noreferrer" 
          className="block rounded-md overflow-hidden"
          onClick={handleClick}
        >
          <Image
            src={ad.imageUrl}
            alt="Anuncio"
            width={ad.size?.width || 400}
            height={ad.size?.height || 400}
            className="w-full h-auto object-contain"
          />
        </a>
      </div>
    </div>
  );
}

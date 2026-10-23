
"use client";

import Image from "next/image";

interface SideHighlightAdProps {
    title?: string;
    imageUrl: string;
    linkUrl: string;
    onAdClick?: () => void;
}

export function SideHighlightAd({ title, imageUrl, linkUrl, onAdClick }: SideHighlightAdProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onAdClick) {
      e.preventDefault();
      onAdClick();
    }
    window.open(linkUrl, '_blank');
  };

  return (
    <a 
      href={linkUrl}
      target="_blank" 
      rel="noopener noreferrer" 
      className="group flex flex-col rounded-xl overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:shadow-md transition-all">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || "Publicidad"}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
        )}
        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded tracking-widest">
          Patrocinado
        </span>
      </div>
    </a>
  );
}


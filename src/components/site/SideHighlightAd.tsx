
"use client";

import Image from "next/image";

interface SideHighlightAdProps {
    title: string;
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
      className="group flex flex-col gap-2 rounded-xl overflow-hidden"
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
      <div className="flex flex-col gap-1">
        <h3 className="font-serif font-bold text-sm leading-tight text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>
      </div>
    </a>
  );
}



'use client';
import type { SiteSettings } from "@/lib/types";
import { trackAdClick } from "@/lib/firestore";

interface AdBannerClientProps {
  ad?: SiteSettings['ads']['homeHorizontal'];
  defaultSize?: string;
  isVertical?: boolean;
  adName: string;
  pageSlug: string;
}

export const AdBannerClient = ({ ad, defaultSize, isVertical, adName, pageSlug }: AdBannerClientProps) => {
    // If ad is disabled, undefined, or has no image, render nothing to keep the layout clean
    if (!ad || !ad.enabled || !ad.imageUrl) {
      return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (ad.linkUrl) {
            e.preventDefault();
            trackAdClick(adName, pageSlug, ad.linkUrl);
            window.open(ad.linkUrl, '_blank');
        }
    };

    return (
        <div className={`relative bg-slate-100 dark:bg-slate-900 rounded-xl flex justify-center items-center text-center my-6 overflow-hidden shadow-sm ${defaultSize || ''} border border-slate-200/80 dark:border-slate-800`}>
            <a 
              href={ad.linkUrl || '#'}
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative w-full h-full block group"
              onClick={handleClick}
            >
                <img src={ad.imageUrl} alt={ad.label || "Anuncio"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                <span className="absolute bottom-1.5 right-2 bg-black/60 backdrop-blur-sm text-[9px] uppercase font-bold text-white px-1.5 py-0.5 rounded tracking-widest">
                  {ad.label || "Publicidad"}
                </span>
            </a>
        </div>
    );
};


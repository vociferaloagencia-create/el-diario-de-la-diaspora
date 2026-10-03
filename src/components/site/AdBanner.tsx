
"use client";

import { trackAdClick } from "@/lib/firestore";
import type { AdSlotSetting } from "@/lib/types";

interface AdBannerProps {
  ad?: AdSlotSetting;
  adName: string;
  slug: string;
}

export const AdBanner = ({ ad, adName, slug }: AdBannerProps) => {
    if (ad && ad.enabled && ad.imageUrl) {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (ad.linkUrl) {
                e.preventDefault();
                trackAdClick(adName, slug, ad.linkUrl);
                window.open(ad.linkUrl, '_blank');
            }
        };

        return (
            <div className="w-full my-6">
                <a 
                  href={ad.linkUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full max-h-40 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex justify-center items-center"
                  onClick={handleClick}
                >
                    <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-contain" />
                </a>
            </div>
        );
    }

    return (
        <div className="w-full my-6 p-4 bg-amber-500/5 dark:bg-amber-950/20 border border-dashed border-amber-500/40 rounded-xl text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mb-1">
                PUBLICIDAD GOOGLE ADSENSE
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                728 x 90 px (Leaderboard en Artículo)
            </span>
        </div>
    );
};

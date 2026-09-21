
"use client";

import { trackAdClick } from "@/lib/firestore";
import type { AdSlotSetting } from "@/lib/types";

interface AdBannerProps {
  ad?: AdSlotSetting;
  adName: string;
  slug: string;
}

export const AdBanner = ({ ad, adName, slug }: AdBannerProps) => {
    if (!ad || !ad.enabled || !ad.imageUrl) return null;

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
    )
}

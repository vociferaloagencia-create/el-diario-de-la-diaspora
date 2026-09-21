
import { MostReadList } from "./MostReadList";
import type { SiteSettings, Article, AdSlotSetting } from "@/lib/types";
import { RelatedArticles } from "./RelatedArticles";

interface AdWidgetProps {
  ad?: AdSlotSetting;
  adName: string;
  onAdClick?: (adName: string, adUrl: string) => void;
}

const AdWidget = ({ ad, adName, onAdClick }: AdWidgetProps) => {
    if (!ad || !ad.enabled || !ad.imageUrl) {
        return null;
    }
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onAdClick && ad.linkUrl) {
        e.preventDefault();
        onAdClick(adName, ad.linkUrl);
        window.open(ad.linkUrl, '_blank');
      }
    };

    return (
         <div className="bg-slate-200 dark:bg-slate-800 rounded-lg flex justify-center items-center text-center overflow-hidden border border-slate-200 dark:border-slate-800">
            <a 
              href={ad.linkUrl}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full h-full"
              onClick={handleClick}
            >
                <img src={ad.imageUrl} alt="Advertisement" className="w-full h-full object-cover" />
            </a>
        </div>
    )
}

interface ArticleSidebarProps {
    ad_top?: SiteSettings['ads']['homeHeroSide'];
    ad_middle?: SiteSettings['ads']['sidebarMiddle'];
    relatedArticles?: Article[];
    mostRead?: Article[];
    onAdClick?: (adName: string, adUrl: string) => void;
}

export function ArticleSidebar({ ad_top, ad_middle, mostRead, relatedArticles, onAdClick }: ArticleSidebarProps) {
    const hasRelated = relatedArticles && relatedArticles.length > 0;
    const hasMostRead = mostRead && mostRead.length > 0;

    return (
        <aside className="sticky top-24 h-fit">
            <div className="flex flex-col gap-8">
                 <AdWidget ad={ad_top} adName="sidebarTop" onAdClick={onAdClick} />
                
                {hasRelated && (
                     <div>
                        <RelatedArticles articles={relatedArticles.map(a => ({
                            title: a.title,
                            imageUrl: a.heroImageUrl,
                            category: a.categoryId,
                            href: `/articles/${a.slug}`
                        }))} />
                    </div>
                )}
                
                <AdWidget ad={ad_middle} adName="sidebarMiddle" onAdClick={onAdClick} />

                {hasMostRead && (
                    <div>
                        <MostReadList items={mostRead.map(a => ({ title: a.title, href: `/articles/${a.slug}` }))} />
                    </div>
                )}
            </div>
        </aside>
    );
}

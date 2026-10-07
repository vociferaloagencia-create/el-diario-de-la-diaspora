
'use client';
import { AdBannerClient } from "./AdBannerClient";
import type { AdSlotSetting } from "@/lib/types";

interface ArticleBodyProps {
    content: string;
    inArticleAd?: AdSlotSetting;
    slug: string;
}

const MIN_CONTENT_LENGTH_FOR_AD = 1800; // Aprox 300 words

export function ArticleBody({ content, inArticleAd, slug }: ArticleBodyProps) {
    const showAd = inArticleAd?.enabled && content.length > MIN_CONTENT_LENGTH_FOR_AD;

    if (!showAd) {
        return (
             <div 
                className="prose prose-lg dark:prose-invert max-w-none flow-root clear-both [&_img]:max-h-[600px] [&_img]:rounded-xl [&_img]:shadow-sm"
                style={{ overflowWrap: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }
    
    // Find the midpoint of the content to insert the ad
    const midpoint = Math.floor(content.length / 2);
    let insertPosition = content.indexOf('</p>', midpoint);
    if (insertPosition === -1) {
        // Fallback if no closing paragraph tag is found after midpoint
        insertPosition = content.length;
    } else {
        insertPosition += 4; // After the </p> tag
    }

    const contentPart1 = content.substring(0, insertPosition);
    const contentPart2 = content.substring(insertPosition);

    return (
        <div className="prose prose-lg dark:prose-invert max-w-none flow-root clear-both [&_img]:max-h-[600px] [&_img]:rounded-xl [&_img]:shadow-sm" style={{ overflowWrap: 'break-word' }}>
            <div dangerouslySetInnerHTML={{ __html: contentPart1 }} />
            
            <div className="not-prose my-8 flex justify-center">
                 <AdBannerClient ad={inArticleAd} adName="inArticle" pageSlug={slug} defaultSize="w-full h-[350px]" />
            </div>

            <div dangerouslySetInnerHTML={{ __html: contentPart2 }} />
        </div>
    );
}

    
import { Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialNetworks = {
    facebook: { icon: Facebook, url: "https://www.facebook.com/sharer/sharer.php?u=" },
    twitter: { icon: Twitter, url: "https://twitter.com/intent/tweet?text=" },
    linkedin: { icon: Linkedin, url: "https://www.linkedin.com/shareArticle?mini=true&url=" },
    whatsapp: { icon: MessageCircle, url: "https://api.whatsapp.com/send?text=" },
}

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const absoluteUrl = typeof window !== 'undefined' ? new URL(url, window.location.origin).href : url;

  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedTitle = encodeURIComponent(title);

  const getShareUrl = (network: keyof typeof socialNetworks): string => {
    switch (network) {
      case 'twitter':
        return `${socialNetworks.twitter.url}${encodedTitle}&url=${encodedUrl}`;
      case 'whatsapp':
        return `${socialNetworks.whatsapp.url}${encodedTitle} ${encodedUrl}`;
      default:
        return `${socialNetworks[network].url}${encodedUrl}`;
    }
  }

  return (
    <div className="flex items-center gap-2 my-8">
        <p className="font-semibold text-sm mr-2">Compartir:</p>
        {(Object.keys(socialNetworks) as Array<keyof typeof socialNetworks>).map(network => {
            const Icon = socialNetworks[network].icon;
            const shareUrl = getShareUrl(network);

            return (
                <Button key={network} variant="outline" size="icon" asChild>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" aria-label={`Compartir en ${network}`}>
                        <Icon className="h-5 w-5" />
                    </a>
                </Button>
            )
        })}
    </div>
  );
}

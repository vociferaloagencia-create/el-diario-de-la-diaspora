

import Link from "next/link";
import type { SocialNetwork } from "@/lib/types";
import { getSiteSettings } from "@/lib/firestore";
import { Facebook, Twitter, Instagram, Youtube, User, MessageCircle } from "lucide-react";
import Image from "next/image";
import { AuthArea } from "./AuthArea";

const socialIconMap: Record<SocialNetwork, React.ComponentType<{ className?: string }>> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    tiktok: () => <User/>, // Placeholder, lucide-react doesn't have a TikTok icon
    linkedin: () => <User/>, // Placeholder
    whatsapp: () => <User/>, // Placeholder
};


export async function Footer() {
  const settings = await getSiteSettings();

  const socialLinks: { network: SocialNetwork; url: string }[] = [
    { network: 'facebook', url: settings.socialLinks?.facebookUrl || "https://facebook.com" },
    { network: 'instagram', url: settings.socialLinks?.instagramUrl || "https://instagram.com" },
    { network: 'twitter', url: settings.socialLinks?.twitterUrl || "https://twitter.com" },
    { network: 'youtube', url: settings.socialLinks?.youtubeUrl || "https://youtube.com" },
  ].filter(item => item.url);
    
  const logoUrl = settings.branding.logoFooterUrl || settings.branding.logoUrl;
  const logoWidth = settings.branding.logoFooterWidth || settings.branding.logoWidth || 80;
  const logoHeight = settings.branding.logoFooterHeight || settings.branding.logoHeight || 22;


  return (
    <footer className="bg-slate-900 text-slate-50 py-4 sm:py-5 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Link href="/">
                    <Image
                        src={logoUrl || "/logo-footer-white.png"}
                        alt={settings.branding.siteName || "El Diario de la Diáspora"}
                        width={logoWidth || 480}
                        height={logoHeight || 130}
                        priority
                        style={{ height: `${logoHeight || 70}px`, width: 'auto' }}
                        className="w-auto max-w-full object-contain hover:opacity-95 transition-opacity drop-shadow-md"
                    />
                </Link>
            </div>

            <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                {settings.footer?.links && settings.footer.links.length > 0 ? (
                  settings.footer.links.filter(l => l.isVisible).sort((a,b) => a.order - b.order).map(link => (
                    <Link key={link.id} href={link.href} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                      {link.label?.replace(/Pol[^\s]+tica/gi, 'Política') || link.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/contacto" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                        Contacto
                    </Link>
                    <Link href="/privacidad" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                        Política de Privacidad
                    </Link>
                  </>
                )}
            </nav>

            <div className="flex items-center gap-3 text-slate-300 flex-wrap justify-center">
                {/* Botón WhatsApp con exactamente el mismo estilo de redes sociales */}
                <a
                  href="https://wa.me/?text=Hola%20El%20Diario%20de%20la%20Di%C3%A1spora,%20quisiera%20m%C3%A1s%20informaci%C3%B3n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-1.5 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                {socialLinks.map(({ network, url }) => {
                    const Icon = socialIconMap[network];
                    return (
                        <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1.5 bg-slate-800 rounded-full hover:bg-slate-700">
                            <Icon className="h-5 w-5" />
                        </a>
                    )
                })}
            </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {settings.footer?.showCopyright !== false && (
              <span>{settings.footer?.copyrightText || `© ${new Date().getFullYear()} El Diario de la Diáspora. Todos los derechos reservados.`}</span>
            )}
            <div className="inline-block"><AuthArea context="footer" /></div>
        </div>
      </div>
    </footer>
  );
}

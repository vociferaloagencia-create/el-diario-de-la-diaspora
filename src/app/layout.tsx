import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { getSiteSettings } from '@/lib/firestore';
import { AuthProvider } from '@/hooks/use-auth';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.branding?.siteName || 'El Diario de la Diáspora';
  return {
    title: {
      default: `${siteName}: Últimas Noticias`,
      template: `%s | ${siteName}`,
    },
    description: settings?.branding?.tagline || 'Información independiente.',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png' },
      ],
      apple: '/icon.png',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5775211801944130"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}

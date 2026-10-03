"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Settings, BarChart3, Users, Globe, LayoutGrid, Palette, Share2, Home, FileText, Megaphone, ArrowDownToLine, Menu, LayoutDashboard, Flame } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function SettingsSubMenu() {
  const pathname = usePathname();
  const isSettingsPath = pathname.startsWith('/dashboard/settings');

  const groups = [
    {
      label: "APARIENCIA",
      links: [
        { href: "/dashboard/settings/branding", label: "Marca", icon: Palette },
        { href: "/dashboard/settings/footer", label: "Pie de Página", icon: ArrowDownToLine },
      ]
    },
    {
      label: "CONTENIDO",
      links: [
        { href: "/dashboard/settings/homepage", label: "Portada", icon: Home },
        { href: "/dashboard/settings/ticker", label: "Última Hora", icon: Flame },
        { href: "/dashboard/settings/comunidad", label: "Nuestra Comunidad", icon: Users },
        { href: "/dashboard/settings/articlepage", label: "Artículo", icon: FileText },
        { href: "/dashboard/settings/navigation", label: "Menú", icon: Menu },
      ]
    },
    {
      label: "REDES",
      links: [
        { href: "/dashboard/settings/social", label: "Redes Sociales", icon: Share2 },
      ]
    },
    {
      label: "MONETIZACIÓN",
      links: [
        { href: "/dashboard/settings/ads", label: "Anuncios", icon: Megaphone },
      ]
    },
  ];

  return (
    <Collapsible defaultOpen={isSettingsPath}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className={`w-full justify-start ${isSettingsPath ? 'font-semibold text-primary' : ''}`} isActive={isSettingsPath}>
            <Settings className={isSettingsPath ? 'text-primary' : ''} />
            Ajustes del Sitio
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pt-2 space-y-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.links.map(link => {
                const isActive = pathname === link.href;
                return (
                  <div key={link.href}>
                    <SidebarMenuButton 
                      asChild 
                      size="sm" 
                      className={`w-full justify-start rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary hover:text-primary-foreground' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`} 
                      isActive={isActive}
                    >
                      <Link href={link.href} className="flex items-center gap-3">
                        <link.icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { authUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !authUser) {
      if (typeof document !== 'undefined') {
        document.cookie = 'firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      }
      router.push('/login');
    }
  }, [loading, authUser, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="sr-only">Cargando panel...</p>
      </div>
    );
  }

  const isExplicitSuperAdmin = authUser?.email?.toLowerCase() === 'admin@eldiariodeladiaspora.com';
  const cookieRole = typeof document !== 'undefined'
    ? document.cookie.split('; ').find(row => row.startsWith('userRole='))?.split('=')[1]
    : undefined;
  const resolvedRole = userProfile?.role || (cookieRole as any) || (isExplicitSuperAdmin ? 'superadmin' : 'user');

  const effectiveProfile = userProfile || (authUser ? {
    uid: authUser.uid,
    email: authUser.email || '',
    role: resolvedRole,
    name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario Lector',
    photoUrl: authUser.photoURL || '',
    createdAt: new Date().toISOString(),
  } : null);

  const isStaff = effectiveProfile?.role === "admin" || effectiveProfile?.role === "editor" || effectiveProfile?.role === "superadmin";

  useEffect(() => {
    if (!loading && effectiveProfile && !isStaff && pathname !== '/dashboard/profile') {
      router.replace('/dashboard/profile');
    }
  }, [loading, effectiveProfile, isStaff, pathname, router]);
  
  if (!effectiveProfile) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Reader view: Strictly shield admin sidebar, show reader profile only
  if (!isStaff) {
    if (pathname !== '/dashboard/profile') {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4 text-sm text-muted-foreground">Redirigiendo a tu perfil...</p>
        </div>
      );
    }

    return (
      <SidebarProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white dark:bg-slate-900 px-6 shadow-xs">
            <Link href="/" className="font-headline text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              El Diario de la Diáspora
            </Link>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Volver al Periódico</Link>
              </Button>
              <DashboardHeader />
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>
        </div>
      </SidebarProvider>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="dashboard-wrapper flex w-full h-screen overflow-hidden bg-[#F7F9FC] dark:bg-slate-950">
        <Sidebar className="shrink-0 border-r border-slate-200 dark:border-slate-800">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b dark:border-slate-800 flex justify-center">
                   <Button asChild variant="outline">
                      <Link href="/" target="_blank">
                        <Globe className="mr-2 h-4 w-4"/>
                        Ver Sitio
                      </Link>
                   </Button>
                </div>
                 <Suspense fallback={<p className="p-4">Cargando navegación...</p>}>
                    <SidebarMenu className="p-4 flex-grow space-y-0.5">
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'} className={pathname === '/dashboard' ? 'bg-primary/10 text-primary font-bold' : ''}>
                                <Link href="/dashboard">
                                    <LayoutDashboard />
                                    Panel Principal
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <Separator className="my-2" />

                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pb-1">
                          CONTENIDO
                        </p>
                        {(effectiveProfile.role === 'admin' || effectiveProfile.role === 'editor' || effectiveProfile.role === 'superadmin') && (
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/articles')} className={pathname.startsWith('/dashboard/articles') ? 'bg-primary/10 text-primary font-bold' : ''}>
                                    <Link href="/dashboard/articles">
                                        <Newspaper />
                                        Artículos
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {(effectiveProfile.role === 'admin' || effectiveProfile.role === 'superadmin') && (
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/categories')} className={pathname.startsWith('/dashboard/categories') ? 'bg-primary/10 text-primary font-bold' : ''}>
                                    <Link href="/dashboard/categories">
                                        <LayoutGrid />
                                        Categorías
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}

                        <Separator className="my-2" />

                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pb-1">
                          ADMINISTRACIÓN
                        </p>
                        {(effectiveProfile.role === 'admin' || effectiveProfile.role === 'superadmin') && (
                          <>
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/statistics')} className={pathname.startsWith('/dashboard/statistics') ? 'bg-primary/10 text-primary font-bold' : ''}>
                                    <Link href="/dashboard/statistics">
                                        <BarChart3 />
                                        Estadísticas
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/users')} className={pathname.startsWith('/dashboard/users') ? 'bg-primary/10 text-primary font-bold' : ''}>
                                    <Link href="/dashboard/users">
                                        <Users />
                                        Usuarios
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                               <SettingsSubMenu />
                            </SidebarMenuItem>
                          </>
                        )}
                    </SidebarMenu>
                 </Suspense>
            </div>
        </Sidebar>
        
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto min-h-0">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
                    {children}
                </div>
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

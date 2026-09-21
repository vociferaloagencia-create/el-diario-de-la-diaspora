"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Settings, BarChart3, Users, Globe, LayoutGrid, Palette, Share2, Home, FileText, Megaphone, ArrowDownToLine, Menu, LayoutDashboard } from 'lucide-react';
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
        <SidebarMenuButton className="w-full justify-start" isActive={isSettingsPath}>
            <Settings />
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
              {group.links.map(link => (
                <div key={link.href}>
                  <SidebarMenuButton asChild size="sm" className="w-full justify-start rounded-md" isActive={pathname === link.href}>
                    <Link href={link.href} className="flex items-center gap-3">
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </div>
              ))}
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
  
  if (!userProfile) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (userProfile.role !== "admin" && userProfile.role !== "editor") {
    router.push('/');
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4">No tienes permiso para ver esta página. Redirigiendo...</p>
        </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="dashboard-wrapper flex w-full h-screen bg-[#F7F9FC] dark:bg-slate-950">
        <Sidebar>
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
                            <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
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
                        {(userProfile.role === 'admin' || userProfile.role === 'editor') && (
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/articles')}>
                                    <Link href="/dashboard/articles">
                                        <Newspaper />
                                        Artículos
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {userProfile.role === 'admin' && (
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/categories')}>
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
                        {userProfile.role === 'admin' && (
                          <>
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/statistics')}>
                                    <Link href="/dashboard/statistics">
                                        <BarChart3 />
                                        Estadísticas
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/users')}>
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
        
        <div className="flex flex-col flex-1 h-full min-w-0">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

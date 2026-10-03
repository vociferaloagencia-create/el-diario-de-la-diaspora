"use client";
import type { HomePageSettings, Article } from "@/lib/types";
import { getAllArticles, updateArticle } from "@/lib/firestore";
import { revalidateHomepage } from "@/app/actions";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, Home, Search, Newspaper, ExternalLink, Plus, X, Eye, GripVertical, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HomeLayoutFormProps {
  initialData: HomePageSettings;
}

function SortableHeroCard({ article, index, onRemove, disabled }: { article: Article; index: number; onRemove: (id: string) => void; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: article._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
      <button type="button" className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded shrink-0 touch-none" {...attributes} {...listeners} title="Arrastrar para reordenar">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="w-14 h-10 rounded overflow-hidden shrink-0 bg-muted relative">
        {article.heroImageUrl ? (
          <Image src={article.heroImageUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-mono shrink-0">
        {index + 1}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{article.title}</p>
        <p className="text-xs text-muted-foreground truncate">{article.summary}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(article._id!)}
        disabled={disabled}
        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Quitar de portada"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function HomeLayoutForm({ initialData }: HomeLayoutFormProps) {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    async function fetch() {
      try {
        const all = await getAllArticles();
        setArticles(all.filter(a => a.status === 'published'));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const heroArticles = useMemo(() => {
    return articles
      .filter(a => a.isMainHero)
      .sort((a, b) => (a.heroOrder ?? 99) - (b.heroOrder ?? 99));
  }, [articles]);

  const heroIds = useMemo(() => heroArticles.map(a => a._id!).filter(Boolean), [heroArticles]);

  const availableArticles = useMemo(() => {
    const q = search.toLowerCase().trim();
    return articles.filter(a =>
      !heroIds.includes(a._id!) &&
      (!q || a.title.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q))
    );
  }, [articles, heroIds, search]);

  const toggleHero = useCallback(async (articleId: string) => {
    if (pendingId) return;
    const isHero = heroIds.includes(articleId);
    setPendingId(articleId);
    try {
      if (isHero) {
        await updateArticle(articleId, { isMainHero: false, heroOrder: 99 });
        const remaining = heroArticles.filter(a => a._id !== articleId).sort((a, b) => (a.heroOrder ?? 99) - (b.heroOrder ?? 99));
        await Promise.all(
          remaining.map((a, i) => updateArticle(a._id!, { isMainHero: true, heroOrder: i }))
        );
        setArticles(prev => prev.map(a => {
          if (a._id === articleId) return { ...a, isMainHero: false, heroOrder: undefined };
          const idx = remaining.findIndex(r => r._id === a._id);
          return idx !== -1 ? { ...a, heroOrder: idx } : a;
        }));
        await revalidateHomepage();
        toast({ title: "Quitado de portada", description: "El artículo ya no se muestra como principal." });
      } else {
        const nextOrder = heroArticles.length;
        await updateArticle(articleId, { isMainHero: true, heroOrder: nextOrder });
        setArticles(prev => prev.map(a => a._id === articleId ? { ...a, isMainHero: true, heroOrder: nextOrder } : a));
        await revalidateHomepage();
        toast({ title: "Agregado a portada ✓", description: "El artículo ya aparece como principal en el sitio." });
      }
    } catch (err) {
      console.error("Error al guardar portada:", err);
      toast({ title: "Error al guardar", description: "No se pudo actualizar la portada. Revisa la consola.", variant: "destructive" });
    } finally {
      setPendingId(null);
    }
  }, [pendingId, heroIds, heroArticles, toast]);

  const syncAll = useCallback(async () => {
    if (syncing || heroArticles.length === 0) return;
    setSyncing(true);
    try {
      const heroIdSet = new Set(heroArticles.map(a => a._id));
      const notHeroes = articles.filter(a => !heroIdSet.has(a._id) && a.isMainHero);
      await Promise.all([
        ...heroArticles.map((a, i) => updateArticle(a._id!, { isMainHero: true, heroOrder: i })),
        ...notHeroes.map(a => updateArticle(a._id!, { isMainHero: false, heroOrder: 99 }))
      ]);
      await revalidateHomepage();
      toast({ title: "Portada sincronizada ✓", description: `${heroArticles.length} artículo(s) actualizados correctamente.` });
    } catch (err) {
      console.error("Error al sincronizar:", err);
      toast({ title: "Error al sincronizar", description: "Revisa la consola.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }, [syncing, heroArticles, articles, toast]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = heroArticles.findIndex(a => a._id === active.id);
    const newIndex = heroArticles.findIndex(a => a._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(heroArticles, oldIndex, newIndex);
    setSaving(true);
    try {
      // Update all articles unconditionally to avoid type mismatch issues
      await Promise.all(
        reordered.map((article, i) => updateArticle(article._id!, { isMainHero: true, heroOrder: i }))
      );
      setArticles(prev => prev.map(a => {
        const idx = reordered.findIndex(r => r._id === a._id);
        return idx !== -1 ? { ...a, heroOrder: idx } : a;
      }));
      await revalidateHomepage();
      toast({ title: "Orden guardado ✓", description: "El nuevo orden de portada se guardó correctamente." });
    } catch {
      toast({ title: "Error al reordenar", description: "No se pudo guardar el orden.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [heroArticles, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Home className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portada</h2>
          <p className="text-sm text-muted-foreground">
            Haz clic en <strong>Agregar</strong> para añadir un artículo. Arrastra para reordenar. Los cambios se guardan automáticamente.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Artículos en portada
                {(saving || syncing) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </CardTitle>
              <CardDescription>
                {heroArticles.length > 0
                  ? `${heroArticles.length} artículo(s) — el #1 aparece como hero principal`
                  : "Ningún artículo seleccionado"}
              </CardDescription>
            </div>
            {heroArticles.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 shrink-0"
                onClick={syncAll}
                disabled={syncing || !!pendingId}
                title="Fuerza el guardado del orden actual y actualiza el sitio"
              >
                {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Aplicar portada
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {heroArticles.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={heroIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {heroArticles.map((article, i) => (
                    <SortableHeroCard key={article._id} article={article} index={i} onRemove={toggleHero} disabled={!!pendingId} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg">
              <Eye className="h-8 w-8 opacity-30 mb-1" />
              <p className="text-sm">No hay artículos en portada</p>
              <p className="text-xs">Selecciona desde abajo para agregar</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                Artículos publicados
              </CardTitle>
              <CardDescription>
                {availableArticles.length} disponible(s) para agregar a portada.
              </CardDescription>
            </div>
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 w-44 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {availableArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Search className="h-8 w-8 opacity-30 mb-1" />
              <p className="text-sm">
                {search ? "Sin resultados." : "No hay más artículos disponibles."}
              </p>
            </div>
          ) : (
            <div className="divide-y max-h-[360px] overflow-y-auto">
              {availableArticles.slice(0, 20).map((article) => (
                <div key={article._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group">
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-muted relative">
                    {article.heroImageUrl ? (
                      <Image src={article.heroImageUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{article.summary}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild title="Editar">
                      <Link href={`/dashboard/articles/${article._id}/edit`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => toggleHero(article._id!)}
                      disabled={!!pendingId}
                      title="Agregar a portada"
                    >
                      {pendingId === article._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Agregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

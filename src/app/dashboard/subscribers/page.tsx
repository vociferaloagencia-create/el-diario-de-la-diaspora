"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequireRole } from "@/components/auth/RequireRole";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MailCheck,
  Download,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
} from "lucide-react";
import type { Subscriber } from "@/lib/types";

interface EnrichedSubscriber extends Subscriber {
  formattedDate: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<EnrichedSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const q = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch {
        // Fallback en caso de que la colección no tenga aún índice o esté recién creada
        snapshot = await getDocs(collection(db, "subscribers"));
      }

      const list: EnrichedSubscriber[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let formattedDate = "Sin fecha";
        if (data.subscribedAt?.toDate) {
          formattedDate = data.subscribedAt.toDate().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (data.subscribedAt) {
          formattedDate = new Date(data.subscribedAt).toLocaleDateString("es-ES");
        }

        return {
          id: docSnap.id,
          name: data.name || "Sin nombre",
          email: data.email || "",
          phone: data.phone || null,
          frequency: data.frequency || "diario",
          preferredDay: data.preferredDay || "Todos los días",
          subscribedAt: data.subscribedAt,
          source: data.source || "web",
          formattedDate,
        };
      });

      setSubscribers(list);
    } catch (error) {
      console.error("Error al obtener suscriptores:", error);
      toast({
        title: "Error al cargar suscriptores",
        description: "No se pudieron obtener los datos de la base de datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return subscribers;
    const term = search.toLowerCase();
    return subscribers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.phone && s.phone.toLowerCase().includes(term))
    );
  }, [subscribers, search]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Estás seguro de eliminar a ${name} de la lista de suscriptores?`)) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "subscribers", id));
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Suscriptor eliminado",
        description: `Se eliminó a ${name} correctamente.`,
      });
    } catch (error) {
      console.error("Error al eliminar suscriptor:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el suscriptor de Firestore.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function handleExportCSV() {
    if (subscribers.length === 0) {
      toast({
        title: "Lista vacía",
        description: "No hay suscriptores para exportar.",
      });
      return;
    }

    const headers = ["Nombre", "Correo", "Teléfono", "Fecha de Registro", "Origen"];
    const rows = subscribers.map((s) => [
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"${(s.phone || "No especificado").replace(/"/g, '""')}"`,
      `"${s.formattedDate}"`,
      `"${(s.source || "Web").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `suscriptores-el-diario-de-la-diaspora-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Archivo generado",
      description: "La lista de suscriptores se ha descargado en formato CSV compatible con Excel.",
    });
  }

  const withPhoneCount = subscribers.filter((s) => s.phone && s.phone.trim()).length;

  return (
    <RequireRole role="admin">
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <MailCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Suscriptores
              </h1>
              <p className="text-sm text-muted-foreground">
                Lista oficial de lectores registrados para noticias y boletines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubscribers}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Actualizar</span>
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={subscribers.length === 0}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Descargar CSV (Excel)</span>
            </Button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg text-blue-600 bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{subscribers.length}</p>
              <p className="text-xs text-muted-foreground">Total Suscriptores</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{withPhoneCount}</p>
              <p className="text-xs text-muted-foreground">Con Teléfono / WhatsApp</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg text-purple-600 bg-purple-100 dark:bg-purple-900/30">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold truncate max-w-[180px]">
                {subscribers[0]?.formattedDate || "Sin registros"}
              </p>
              <p className="text-xs text-muted-foreground">Última Suscripción</p>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="text-xs">
              Limpiar filtro
            </Button>
          )}
        </div>

        {/* Tabla */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex h-64 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Cargando suscriptores...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <MailCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {search ? "No se encontraron resultados" : "No hay suscriptores registrados todavía"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {search
                  ? "Intenta con otro término de búsqueda."
                  : "Cuando los lectores completen el formulario del botón SUSCRÍBETE en la web, aparecerán automáticamente en esta lista."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="font-bold">Lector</TableHead>
                  <TableHead className="font-bold">Correo Electrónico</TableHead>
                  <TableHead className="font-bold">Teléfono</TableHead>
                  <TableHead className="font-bold">Frecuencia y Día</TableHead>
                  <TableHead className="font-bold">Fecha de Registro</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {sub.name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${sub.email}`}
                        className="text-primary hover:underline flex items-center gap-1.5 font-mono text-xs"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {sub.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {sub.phone ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {sub.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No provisto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                          {sub.frequency === 'semanal' ? 'Semanal' : 'Diario'}
                        </span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {sub.preferredDay || (sub.frequency === 'semanal' ? 'Lunes' : 'Todos los días')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.formattedDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 gap-1 text-[11px]"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sub.id, sub.name)}
                        disabled={deletingId === sub.id}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Eliminar de la lista"
                      >
                        {deletingId === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </RequireRole>
  );
}

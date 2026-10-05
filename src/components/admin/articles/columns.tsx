"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Trash2, ExternalLink, Pencil, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteArticle } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export type ArticleForTable = Pick<Article, '_id' | 'title' | 'slug' | 'status' | 'publishedAt'>;

interface CellActionsProps {
  article: ArticleForTable;
  onDeleted?: (id: string) => void;
}

const CellActions = ({ article, onDeleted }: CellActionsProps) => {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        if (!article._id || isDeleting) return;
        setIsDeleting(true);
        try {
            await deleteArticle(article._id);
            toast({
                title: "Artículo eliminado",
                description: `El artículo "${article.title}" ha sido eliminado permanentemente.`,
            });
            if (onDeleted) {
                onDeleted(article._id);
            }
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error al eliminar el artículo:", error);
            toast({
                title: "Error al eliminar",
                description: "No se pudo eliminar el artículo. Por favor, inténtalo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/articles/${article.slug}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/articles/${article._id}/edit`} className="flex items-center gap-2 cursor-pointer">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setOpen(true);
                      }}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/40 flex items-center gap-2 cursor-pointer"
                    >
                         <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. El artículo &quot;{article.title}&quot; será eliminado permanentemente.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          "Sí, eliminar"
                        )}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export const getColumns = (onDeleted?: (id: string) => void): ColumnDef<ArticleForTable>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold uppercase text-xs -ml-2"
        >
          Título
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
        return <div className="font-medium text-sm truncate max-w-[300px]">{row.getValue("title")}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'published' ? 'default' : 'secondary';
        return <Badge variant={variant} className="capitalize text-xs px-2.5 py-0.5">{status}</Badge>
    }
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold uppercase text-xs -ml-2"
        >
          Fecha
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("publishedAt"))
      const formatted = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
      return <div className="text-sm text-muted-foreground">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const article = row.original
      return (
        <div className="text-right">
           <CellActions article={article} onDeleted={onDeleted} />
        </div>
      )
    },
  },
]

export const columns = getColumns();

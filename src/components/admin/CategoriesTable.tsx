import type { Category } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Trash2, Eye, EyeOff, Hash } from "lucide-react";
import { deleteCategory } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card";

interface CategoriesTableProps {
  categories: Category[];
  onCategoryDeleted: (categoryId: string) => void;
}

export function CategoriesTable({ categories, onCategoryDeleted }: CategoriesTableProps) {
  const { toast } = useToast();
  
  const handleDelete = async (category: Category) => {
    const result = await deleteCategory(category._id);
    if (result.success) {
      toast({
        title: "Categoría eliminada",
        description: `La categoría "${category.name}" ha sido eliminada.`,
      });
      onCategoryDeleted(category._id);
    } else {
      toast({
        title: "Error al eliminar",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[80px] text-xs font-semibold uppercase tracking-wider">Orden</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Nombre</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Slug</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Estado</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, i) => (
                <TableRow key={category._id} className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Hash className="h-3.5 w-3.5" />
                      {category.order}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{category.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">/{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant={category.isVisible ? 'default' : 'outline'} className="gap-1.5 text-xs">
                      {category.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {category.isVisible ? 'Visible' : 'Oculto'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. No podrás eliminarla si hay artículos asociados.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Sí, eliminar
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <p className="text-sm">No hay categorías todavía. Crea una nueva.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

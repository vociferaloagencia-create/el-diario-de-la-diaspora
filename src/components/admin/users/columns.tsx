"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, KeyRound, ShieldCheck, User, Shield, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import type { AppUser } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
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
import { sendPasswordResetEmail, updateUserRole } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export type UserForTable = Pick<AppUser, 'uid' | 'email' | 'role' | 'createdAt'>;

const CellActions = ({ user }: { user: UserForTable }) => {
    const { toast } = useToast();
    const router = useRouter();

    const handlePasswordReset = async () => {
        if (!user.email) return;
        try {
            await sendPasswordResetEmail(user.email);
            toast({
                title: "Correo enviado",
                description: `Se ha enviado un enlace de restablecimiento a ${user.email}.`,
            });
        } catch (error) {
            console.error("Error al enviar correo de restablecimiento:", error);
            toast({
                title: "Error",
                description: "No se pudo enviar el correo.",
                variant: "destructive",
            });
        }
    };

    const handleChangeRole = async (newRole: 'admin' | 'editor') => {
        if (user.role === newRole) return;
        try {
            await updateUserRole(user.uid, newRole);
            toast({
                title: "Rol actualizado",
                description: `El rol de ${user.email} ahora es ${newRole}.`,
            });
            router.refresh();
        } catch (error) {
            console.error("Error al cambiar el rol:", error);
            toast({
                title: "Error",
                description: "No se pudo cambiar el rol del usuario.",
                variant: "destructive",
            });
        }
    }

    return (
        <AlertDialog>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2">
                            <Shield className="h-3.5 w-3.5" />
                            Cambiar Rol
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleChangeRole('admin')} disabled={user.role === 'admin'} className="gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole('editor')} disabled={user.role === 'editor'} className="gap-2">
                                <User className="h-3.5 w-3.5" />
                                Editor
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="gap-2">
                            <KeyRound className="h-3.5 w-3.5" />
                            Restablecer Contraseña
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Restablecer contraseña</AlertDialogTitle>
                    <AlertDialogDescription>
                        Se enviará un correo a <strong>{user.email}</strong> con un enlace para crear una nueva contraseña.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordReset}>
                        Sí, enviar correo
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export const columns: ColumnDef<UserForTable>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold uppercase text-xs -ml-2"
        >
          <Mail className="h-3.5 w-3.5 mr-1.5" />
          Email
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
        return <div className="font-medium text-sm">{row.getValue("email")}</div>
    }
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const variant = role === 'admin' ? 'default' : 'secondary';
        return (
          <Badge variant={variant} className="capitalize gap-1.5 text-xs">
            {role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {role}
          </Badge>
        )
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold uppercase text-xs -ml-2"
        >
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          Creado
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateString = row.getValue("createdAt") as string;
      if (!dateString) return <span className="text-sm text-muted-foreground">N/A</span>;
      const date = new Date(dateString)
      const formatted = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
      return <div className="text-sm text-muted-foreground">{formatted}</div>
    },
  },
   {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="text-right">
           <CellActions user={user} />
        </div>
      )
    },
  },
]

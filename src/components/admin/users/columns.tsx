"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, KeyRound, ShieldCheck, ShieldAlert, User, Shield, Mail, Calendar, PenTool } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth"

export type UserForTable = Pick<AppUser, 'uid' | 'email' | 'name' | 'username' | 'role' | 'createdAt'>;

const CellActions = ({ user }: { user: UserForTable }) => {
    const { toast } = useToast();
    const router = useRouter();
    const { userProfile } = useAuth();
    const isSuperAdmin = userProfile?.role === 'superadmin';

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

    const handleChangeRole = async (newRole: AppUser['role']) => {
        if (user.role === newRole) return;
        try {
            await updateUserRole(user.uid, newRole);
            toast({
                title: "Rol actualizado",
                description: `El rol de ${user.email} ahora es ${newRole}.`,
            });
            // Force a hard reload to reflect role changes everywhere if needed
            window.location.reload();
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
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2">
                            <Shield className="h-3.5 w-3.5" />
                            Cambiar Rol
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {isSuperAdmin && (
                                <DropdownMenuItem onClick={() => handleChangeRole('superadmin')} disabled={user.role === 'superadmin'} className="gap-2 text-red-600 focus:text-red-700">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    Super Admin y Columnista
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleChangeRole('columnista')} disabled={user.role === 'columnista'} className="gap-2 text-blue-600 focus:text-blue-700">
                                <PenTool className="h-3.5 w-3.5" />
                                Columnista
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole('admin')} disabled={user.role === 'admin'} className="gap-2">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Administrador
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole('editor')} disabled={user.role === 'editor'} className="gap-2">
                                <User className="h-3.5 w-3.5" />
                                Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole('user')} disabled={user.role === 'user'} className="gap-2">
                                <User className="h-3.5 w-3.5" />
                                Usuario Normal
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
    accessorKey: "username",
    header: "Usuario",
    cell: ({ row }) => {
      const username = row.original.username;
      if (!username) return <span className="text-xs text-muted-foreground italic">Sin asignar</span>;
      return <span className="font-mono text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded border">{username}</span>;
    }
  },
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
        
        if (role === 'superadmin') {
          return (
            <Badge variant="destructive" className="gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium">
              <ShieldAlert className="h-3 w-3" />
              Superadministrador y Columnista
            </Badge>
          );
        }
        if (role === 'columnista') {
          return (
            <Badge variant="secondary" className="gap-1.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
              <PenTool className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              Columnista
            </Badge>
          );
        }
        if (role === 'admin') {
          return (
            <Badge variant="default" className="gap-1.5 text-xs font-medium">
              <ShieldCheck className="h-3 w-3" />
              Administrador
            </Badge>
          );
        }
        if (role === 'editor') {
          return (
            <Badge variant="secondary" className="gap-1.5 text-xs font-medium">
              <User className="h-3 w-3" />
              Editor
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="capitalize gap-1.5 text-xs">
            <User className="h-3 w-3" />
            {role || 'Usuario'}
          </Badge>
        );
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

"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/auth";
import { UsersClient } from "@/components/admin/users/UsersClient";
import { RequireRole } from "@/components/auth/RequireRole";
import type { AppUser } from "@/lib/types";
import { Loader2, Users, Shield, UserCog, PenTool } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const superadmins = users.filter(u => u.role === 'superadmin');
  const admins = users.filter(u => u.role === 'admin');
  const columnistas = users.filter(u => u.role === 'columnista' || u.role === 'superadmin');

  const stats = [
    { label: "Total usuarios", value: users.length, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Columnistas", value: columnistas.length, icon: PenTool, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
    { label: "Superadmins & Admins", value: superadmins.length + admins.length, icon: Shield, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
    { label: "Editores", value: users.filter(u => u.role === 'editor').length, icon: UserCog, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  ];

  return (
    <RequireRole role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-sm text-muted-foreground">Gestiona los usuarios de tu plataforma.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <UsersClient initialUsers={users} />
      </div>
    </RequireRole>
  );
}

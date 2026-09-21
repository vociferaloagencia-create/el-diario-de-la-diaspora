"use client";

import { useState } from 'react';
import type { AppUser } from '@/lib/types';
import { AddUserForm } from './AddUserForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { columns } from './columns';
import { DataTable } from '../articles/data-table';
import { Users, PlusCircle, UserPlus } from 'lucide-react';

interface UsersClientProps {
    initialUsers: AppUser[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState<AppUser[]>(initialUsers);

    const handleUserAdded = (newUser: AppUser) => {
        setUsers(prev => [newUser, ...prev]);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
                <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            Usuarios existentes
                        </CardTitle>
                        <CardDescription>{users.length} usuario(s) registrados en la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable columns={columns} data={users} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                            Nuevo usuario
                        </CardTitle>
                        <CardDescription>Crea una cuenta de editor.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AddUserForm onUserAdded={handleUserAdded} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

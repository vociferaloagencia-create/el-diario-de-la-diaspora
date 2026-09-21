"use client";

import { useState } from 'react';
import type { Category } from '@/lib/types';
import { AddCategoryForm } from './AddCategoryForm';
import { CategoriesTable } from './CategoriesTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PlusCircle, ListTree } from 'lucide-react';

interface CategoryClientProps {
    initialCategories: Category[];
}

export function CategoryClient({ initialCategories }: CategoryClientProps) {
    const [categories, setCategories] = useState<Category[]>(initialCategories.sort((a,b) => a.order - b.order));

    const handleCategoryAdded = (newCategory: Category) => {
        setCategories(prev => [...prev, newCategory].sort((a, b) => a.order - b.order));
    }

    const handleCategoryDeleted = (deletedCategoryId: string) => {
        setCategories(prev => prev.filter(c => c._id !== deletedCategoryId));
    }

    return (
        <div className="grid gap-6 md:grid-cols-3 items-start">
            <div className="md:col-span-1">
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <PlusCircle className="h-5 w-5 text-muted-foreground" />
                            Nueva categoría
                        </CardTitle>
                        <CardDescription>Crea una nueva categoría para tus artículos.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <AddCategoryForm onCategoryAdded={handleCategoryAdded} existingCategories={categories} />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                 <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ListTree className="h-5 w-5 text-muted-foreground" />
                            Categorías existentes
                        </CardTitle>
                        <CardDescription>{categories.length} categoría(s) configuradas.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <CategoriesTable categories={categories} onCategoryDeleted={handleCategoryDeleted} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

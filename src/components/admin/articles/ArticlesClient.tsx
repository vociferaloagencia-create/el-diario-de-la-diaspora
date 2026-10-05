"use client";

import { useState, useMemo, useEffect } from "react";
import type { Article, Category } from "@/lib/types";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ArticlesClientProps {
  initialArticles: Article[];
  categories: Category[];
}

export function ArticlesClient({ initialArticles, categories }: ArticlesClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a._id !== id));
  };

  const columns = useMemo(() => getColumns(handleDeleteArticle), []);

  const filteredArticles = useMemo(() => {
    let list = articles;

    if (selectedCategory !== "all") {
      list = list.filter(article => article.categoryId === selectedCategory);
    }

    if (filterText) {
      list = list.filter(article =>
        article.title.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    return list;
  }, [articles, selectedCategory, filterText]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                    <SelectItem key={category._id} value={category.slug}>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Input
            placeholder="Filtrar por título..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-sm"
        />
      </div>
      <DataTable columns={columns} data={filteredArticles} />
    </div>
  );
}

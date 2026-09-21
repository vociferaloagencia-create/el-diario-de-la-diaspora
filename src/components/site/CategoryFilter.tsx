"use client";

import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Landmark, Trophy, Cpu, Globe, Mic2 } from "lucide-react";
import { useMemo } from "react";

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Politics: Landmark,
  Sports: Trophy,
  Technology: Cpu,
  Internacional: Globe,
  Opinion: Mic2,
};


interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | "All";
  onSelectCategory: (category: string | "All") => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categoryList = useMemo(() => {
    return categories.filter(c => c.isVisible && !c.parentCategoryId);
  }, [categories]);

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
      <Button
        variant={selectedCategory === "All" ? "default" : "outline"}
        onClick={() => onSelectCategory("All")}
        className="rounded-full"
      >
        All Categories
      </Button>
      {categoryList.map((category) => {
        const Icon = iconMap[category.name] || Landmark;
        return (
          <Button
            key={category._id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            onClick={() => onSelectCategory(category.slug)}
            className="rounded-full"
          >
            <Icon className="mr-2 h-4 w-4" />
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}

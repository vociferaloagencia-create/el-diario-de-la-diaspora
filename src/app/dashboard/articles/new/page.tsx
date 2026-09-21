import { ArticleForm } from "@/components/admin/articles/ArticleForm";
import { getCategories } from "@/lib/firestore";
import type { Category } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const categories: Category[] = await getCategories();

  return (
    <div className="flex-1 space-y-4">
      <ArticleForm 
        article={{}}
        categories={categories}
      />
    </div>
  );
}

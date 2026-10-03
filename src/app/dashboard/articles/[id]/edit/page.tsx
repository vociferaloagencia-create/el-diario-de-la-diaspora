import { getCategories, getArticlesByIds } from "@/lib/firestore";
import { ArticleForm } from "@/components/admin/articles/ArticleForm";
import type { Article, Category } from "@/lib/types";
import { notFound } from "next/navigation";

interface EditArticlePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = await params;
  const categories: Category[] = await getCategories();
  const articles = await getArticlesByIds([resolvedParams.id]);
  const article = articles[0];

  if (!article) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4">
      <ArticleForm 
        article={article}
        categories={categories}
      />
    </div>
  );
}

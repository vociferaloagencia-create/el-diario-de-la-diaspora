'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Article } from '@/lib/types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';

interface SearchClientProps {
  initialQuery: string;
  results: Article[];
}

export function SearchClient({ initialQuery, results }: SearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  // Sync input when the URL param changes (e.g. back/forward navigation)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed !== initialQuery) {
        router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, initialQuery, router]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar noticias, temas, palabras clave..."
          className="pl-12 h-12 text-base rounded-xl"
        />
      </div>

      {initialQuery && (
        <p className="text-sm text-muted-foreground">
          {results.length > 0
            ? <><span className="font-semibold text-foreground">{results.length}</span> {results.length === 1 ? 'resultado' : 'resultados'} para <span className="font-semibold text-foreground">&ldquo;{initialQuery}&rdquo;</span></>
            : <>Sin resultados para <span className="font-semibold text-foreground">&ldquo;{initialQuery}&rdquo;</span></>
          }
        </p>
      )}

      {!initialQuery && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Search className="h-12 w-12 opacity-20" />
          <p className="text-lg">Escribe algo para buscar</p>
          <p className="text-sm">Busca por título, resumen o etiquetas</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map(article => (
          <Link key={article._id} href={`/articles/${article.slug}`}
            className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-shadow group">
            {article.heroImageUrl && (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                <Image src={article.heroImageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              {article.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{article.summary}</p>
              )}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.tags.map(tag => (
                    <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tag.toLowerCase() === initialQuery.toLowerCase() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

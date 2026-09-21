"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, User, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface ArticleCommentsProps {
  articleSlug: string;
}

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "c-1",
    author: "Carlos Méndez (Madrid)",
    content: "Excelente cobertura sobre los acuerdos migratorios y de homologación de títulos. Como ingeniero en el exterior, esto nos beneficia enormemente.",
    createdAt: "Hace 2 horas",
    likes: 14,
  },
  {
    id: "c-2",
    author: "Elena Vasquez (Nueva York)",
    content: "Muy importante mantener informada a la comunidad de la diáspora. El Diario de la Diáspora se está convirtiendo en el medio de referencia obligado.",
    createdAt: "Hace 4 horas",
    likes: 8,
  },
];

export function ArticleComments({ articleSlug }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storageKey = `comments_${articleSlug}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch (e) {
      // fallback to default
    }
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: name.trim() || "Lector Anónimo",
      content: commentText.trim(),
      createdAt: "Justo ahora",
      likes: 0,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      // local storage error handle
    }

    setCommentText("");
    setName("");
    setIsSubmitting(false);
  };

  const handleLike = (id: string) => {
    const updated = comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c);
    setComments(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  return (
    <section className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-serif font-black tracking-tight text-slate-900 dark:text-white uppercase">
          Comentarios de los Lectores ({comments.length})
        </h3>
      </div>

      {/* Formulario para publicar comentario */}
      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 mb-8 shadow-sm">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Deja tu opinión sobre este artículo
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input
            type="text"
            placeholder="Tu nombre o alias (ej. María R.)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white dark:bg-slate-950 text-xs"
          />
        </div>
        <Textarea
          placeholder="Escribe tu comentario respetuoso y constructivo aquí..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
          required
          className="bg-white dark:bg-slate-950 text-xs mb-3 resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !commentText.trim()}
          className="font-bold text-xs uppercase tracking-wider gap-1.5 bg-primary hover:bg-primary/90"
        >
          <Send className="w-3.5 h-3.5" />
          Publicar Comentario
        </Button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 font-headline">
                  {comment.author}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{comment.createdAt}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed mb-3">
              {comment.content}
            </p>

            <button
              type="button"
              onClick={() => handleLike(comment.id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary transition-colors"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{comment.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

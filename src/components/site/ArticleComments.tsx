"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, User, ThumbsUp, LogIn, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: string;
  author: string;
  authorPhoto?: string;
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
  const { authUser, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS);
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
    if (!commentText.trim() || !authUser) return;

    setIsSubmitting(true);
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: userProfile?.name || authUser.displayName || "Lector",
      authorPhoto: userProfile?.photoUrl || authUser.photoURL || undefined,
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

      {authUser ? (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 mb-8 shadow-xs">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={userProfile?.photoUrl || authUser.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {(userProfile?.name || authUser.displayName || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe tu comentario sobre esta noticia..."
                className="min-h-[80px] text-sm resize-y bg-white dark:bg-slate-950"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="font-bold text-xs uppercase tracking-wider h-9 px-5 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar Comentario
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 mb-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-headline">
              ¿Quieres participar en la conversación?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Inicia sesión con tu cuenta para dejar tu comentario verificado en esta noticia.
            </p>
          </div>
          <Link href={`/login?redirect=/articles/${articleSlug}`} className="mt-1">
            <Button
              type="button"
              size="default"
              className="font-bold text-xs uppercase tracking-wider gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm px-6 h-10 rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión para Comentar
            </Button>
          </Link>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {comment.authorPhoto ? (
                  <img src={comment.authorPhoto} alt={comment.author} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
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

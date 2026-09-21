import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface MostReadListProps {
  items: {
    title: string;
    href: string;
  }[];
}

export function MostReadList({ items }: MostReadListProps) {
  return (
    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold uppercase tracking-wider font-headline text-slate-900 dark:text-white">
          Lo más leído
        </h3>
      </div>
      <ul className="space-y-3.5">
        {items.slice(0, 4).map((item, index) => (
          <li key={item.href} className="flex items-start gap-3 group">
            <span className="font-serif font-black text-2xl text-primary/40 dark:text-blue-400/40 leading-none pt-0.5 w-6 flex-shrink-0">
              0{index + 1}
            </span>
            <Link href={item.href} className="flex-1">
              <p className="text-sm font-serif font-bold leading-snug text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

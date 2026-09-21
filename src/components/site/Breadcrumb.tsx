import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbProps {
    items: {
        label: string;
        href: string;
    }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                {items.map((item, index) => (
                    <Fragment key={item.href}>
                        <li>
                            <Link href={item.href} className="hover:text-primary transition-colors">
                                {item.label}
                            </Link>
                        </li>
                        {index < items.length - 1 && (
                            <li>
                                <ChevronRight className="h-4 w-4" />
                            </li>
                        )}
                    </Fragment>
                ))}
            </ol>
        </nav>
    );
}

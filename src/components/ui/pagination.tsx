import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage: number, endPage: number;
    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
        const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="flex items-center justify-center space-x-2">
            {currentPage > 1 && (
                <Link
                    href={`${basePath}?page=${currentPage - 1}`}
                    className={cn(buttonVariants({ variant: 'outline' }), "gap-1 pl-2.5")}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </Link>
            )}

            {pageNumbers.map((page) => (
                <Link
                    key={page}
                    href={`${basePath}?page=${page}`}
                    className={cn(
                        buttonVariants({ variant: currentPage === page ? 'default' : 'outline', size: 'icon' })
                    )}
                >
                    {page}
                </Link>
            ))}

            {currentPage < totalPages && (
                <Link
                    href={`${basePath}?page=${currentPage + 1}`}
                    className={cn(buttonVariants({ variant: 'outline' }), "gap-1 pr-2.5")}
                >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                </Link>
            )}
        </nav>
    );
}

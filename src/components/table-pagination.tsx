"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
    page: number;
    totalPages: number;
    totalElements: number;
    size: number;
    first: boolean;
    last: boolean;
    onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current <= 3) return [0, 1, 2, 3, 4, '...', total - 1];
    if (current >= total - 4) return [0, '...', total - 5, total - 4, total - 3, total - 2, total - 1];
    return [0, '...', current - 1, current, current + 1, '...', total - 1];
}

export function TablePagination({
    page,
    totalPages,
    totalElements,
    size,
    first,
    last,
    onPageChange,
}: TablePaginationProps) {
    const showingFrom = totalElements === 0 ? 0 : page * size + 1;
    const showingTo = Math.min(page * size + size, totalElements);
    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
                {totalElements === 0 ? 'No results' : `Showing ${showingFrom}–${showingTo} of ${totalElements}`}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page - 1)}
                    disabled={first}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers.map((p, i) =>
                    p === '...' ? (
                        <span key={`dots-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8 text-sm"
                            onClick={() => onPageChange(p as number)}
                        >
                            {(p as number) + 1}
                        </Button>
                    )
                )}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page + 1)}
                    disabled={last}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

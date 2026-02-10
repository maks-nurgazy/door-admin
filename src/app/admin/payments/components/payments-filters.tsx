"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' },
];

export function PaymentsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [status, setStatus] = useState(searchParams.get("status") || "all");

    const updateFilters = useCallback(
        (params: Record<string, string | null>) => {
            const next = new URLSearchParams(searchParams.toString());
            let changed = false;
            for (const [key, value] of Object.entries(params)) {
                if (!value || value === "all") {
                    if (next.has(key)) { next.delete(key); changed = true; }
                } else if (next.get(key) !== value) {
                    next.set(key, value); changed = true;
                }
            }
            if (changed) {
                next.delete("page");
                startTransition(() => router.push(`?${next.toString()}`));
            }
        },
        [router, searchParams]
    );

    return (
        <div className="flex gap-4 flex-wrap">
            <Select
                value={status}
                onValueChange={(value) => { setStatus(value); updateFilters({ status: value }); }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

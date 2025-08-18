"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function PaymentsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "all");

    const updateFilters = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            let somethingChanged = false;

            for (const [key, value] of Object.entries(params)) {
                const oldValue = newSearchParams.get(key) || "all";
                const normalized = (oldValue === "all") ? null : oldValue;

                if (value === null || value === "all") {
                    if (normalized !== null) {
                        newSearchParams.delete(key);
                        somethingChanged = true;
                    }
                } else {
                    if (value !== normalized) {
                        newSearchParams.set(key, value);
                        somethingChanged = true;
                    }
                }
            }

            if (somethingChanged) {
                if (Object.keys(params).some((key) => key !== "page")) {
                    newSearchParams.delete("page");
                }
                startTransition(() => {
                    router.push(`?${newSearchParams.toString()}`);
                });
            }
        },
        [router, searchParams]
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search) {
                updateFilters({ search });
            } else {
                updateFilters({ search: null });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, updateFilters]);

    return (
        <div className="flex gap-4 flex-wrap">
            <Input
                placeholder="Search by user name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
            />
            <Select
                value={status}
                onValueChange={(value) => {
                    setStatus(value);
                    updateFilters({ status: value });
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
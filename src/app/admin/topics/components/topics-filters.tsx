"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function TopicsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    const updateFilters = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            let somethingChanged = false;

            for (const [key, value] of Object.entries(params)) {
                const oldValue = newSearchParams.get(key);
                if (value === null) {
                    if (oldValue !== null) {
                        newSearchParams.delete(key);
                        somethingChanged = true;
                    }
                } else {
                    if (value !== oldValue) {
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
        <div className="flex gap-4">
            <Input
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />
        </div>
    );
}
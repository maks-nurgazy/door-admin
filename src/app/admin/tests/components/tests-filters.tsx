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

export function TestsFilters() {
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

    const handleStatusChange = (value: string) => {
        updateFilters({ status: value === "all" ? null : value });
    };

    const handleTestTypeChange = (value: string) => {
        updateFilters({ testType: value === "all" ? null : value });
    };

    return (
        <div className="flex gap-4 flex-wrap">
            <Input
                placeholder="Search tests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />
            <Select
                value={searchParams.get("status") || "all"}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="IN_ACTIVE">Inactive</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={searchParams.get("testType") || "all"}
                onValueChange={handleTestTypeChange}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Test Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

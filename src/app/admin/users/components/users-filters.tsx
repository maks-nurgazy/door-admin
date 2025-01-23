"use client";

import {useCallback, useEffect, useState, useTransition} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

export function UsersFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(searchParams.get("name") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "all");
    const [paymentStatus, setPaymentStatus] = useState(searchParams.get("paymentStatus") || "all");

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === "all") {
                    newSearchParams.delete(key);
                } else {
                    newSearchParams.set(key, value);
                }
            });

            // Reset page when filters change
            if (Object.keys(params).some(key => key !== 'page')) {
                newSearchParams.delete('page');
            }

            return newSearchParams.toString();
        },
        [searchParams]
    );

    const updateFilters = useCallback((params: Record<string, string | null>) => {
        startTransition(() => {
            const queryString = createQueryString(params);
            router.push(`?${queryString}`);
        });
    }, [router, createQueryString]);

    // Debounce name search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (name) {
                updateFilters({name});
            } else {
                updateFilters({name: null});
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [name, updateFilters]);

    return (
        <div className="flex gap-4 flex-wrap">
            <Input
                placeholder="Search by name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
            />
            <Select
                value={status}
                onValueChange={(value) => {
                    setStatus(value);
                    updateFilters({status: value});
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="BANNED">Banned</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={paymentStatus}
                onValueChange={(value) => {
                    setPaymentStatus(value);
                    updateFilters({paymentStatus: value});
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by payment"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
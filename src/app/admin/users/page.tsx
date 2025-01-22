"use client";

import { Suspense, useState, useCallback } from "react";
import { UsersTable } from "./components/users-table";
import { UsersHeader } from "./components/users-header";
import { UsersFilters } from "./components/users-filters";
import { UserFilters } from "@/lib/api/users";

export default function UsersPage() {
    const [filters, setFilters] = useState<UserFilters>({});

    const handleFiltersChange = useCallback((newFilters: UserFilters) => {
        setFilters(newFilters);

        // Update URL with filters
        const searchParams = new URLSearchParams(window.location.search);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                searchParams.set(key, value);
            } else {
                searchParams.delete(key);
            }
        });
        window.history.pushState(
            {},
            '',
            `${window.location.pathname}?${searchParams.toString()}`
        );
    }, []);

    return (
        <div className="space-y-6">
            <UsersHeader />
            <Suspense fallback={<div>Loading filters...</div>}>
                <UsersFilters onFiltersChange={handleFiltersChange} />
            </Suspense>
            <Suspense fallback={<div>Loading users...</div>}>
                <UsersTable filters={filters} />
            </Suspense>
        </div>
    );
}
import {Suspense} from "react";
import {UsersTable} from "./components/users-table";
import {UsersHeader} from "./components/users-header";
import {UsersFilters} from "./components/users-filters";
import {usersApi} from "@/lib/api/users";
import Loading from "@/app/admin/users/loading";

interface PageProps {
    searchParams: Promise<{
        name?: string;
        status?: string;
        paymentStatus?: string;
        page?: string;
    }>;
}

export default async function UsersPage({searchParams}: PageProps) {
    // Parse search params
    const parameters = await searchParams;
    const filters = {
        name: parameters.name,
        status: parameters.status as any,
        paymentStatus: parameters.paymentStatus as any,
        page: parameters.page ? parseInt(parameters.page) - 1 : 0,
    };

    const initialData = await usersApi.getUsers(filters);

    return (
        <div className="space-y-6">
            <UsersHeader />
            <Suspense fallback={<div className="flex gap-4 flex-wrap">
                <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
            </div>}>
                <UsersFilters />
            </Suspense>
            <Suspense fallback={<Loading />}>
                <UsersTable initialData={initialData} />
            </Suspense>
        </div>
    );
}
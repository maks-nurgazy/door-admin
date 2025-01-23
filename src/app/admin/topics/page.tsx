import {Suspense} from "react";
import {TopicsTable} from "./components/topics-table";
import {TopicsHeader} from "./components/topics-header";
import {TopicsFilters} from "./components/topics-filters";
import {topicsApi} from "@/lib/api/topics";
import Loading from "@/app/admin/users/loading";

interface PageProps {
    searchParams: {
        search?: string;
        page?: string;
    };
}

export default async function TopicsPage({searchParams}: PageProps) {
    const filters = {
        search: searchParams.search,
        page: searchParams.page ? parseInt(searchParams.page) - 1 : 0,
    };

    const initialData = await topicsApi.getTopics(filters);

    return (
        <div className="space-y-6">
            <TopicsHeader/>
            <Suspense fallback={<div className="flex gap-4">
                <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md"/>
            </div>}>
                <TopicsFilters/>
            </Suspense>
            <Suspense fallback={<Loading/>}>
                <TopicsTable initialData={initialData}/>
            </Suspense>
        </div>
    );
}
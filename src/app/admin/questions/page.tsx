import { Suspense } from "react";
import { QuestionsTable } from "./components/questions-table";
import { QuestionsHeader } from "./components/questions-header";
import { QuestionsFilters } from "./components/questions-filters";
import { questionsApi } from "@/lib/api/questions";
import { sectionsApi } from "@/lib/api/sections";
import { topicsApi } from "@/lib/api/topics";
import Loading from "./loading";

interface PageProps {
    searchParams: {
        search?: string;
        section?: string;
        topic?: string;
        page?: string;
    };
}

export default async function QuestionsPage({ searchParams }: PageProps) {
    const filters = {
        search: searchParams.search,
        page: searchParams.page ? parseInt(searchParams.page) - 1 : 0,
    };

    const [initialData, sections, topics] = await Promise.all([
        questionsApi.getQuestions(filters),
        sectionsApi.getAllSections(),
        topicsApi.getAllTopics()
    ]);

    return (
        <div className="space-y-6">
            <QuestionsHeader sections={sections} topics={topics} />
            <Suspense fallback={<div className="flex gap-4">
                <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
            </div>}>
                <QuestionsFilters sections={sections} topics={topics} />
            </Suspense>
            <Suspense fallback={<Loading />}>
                <QuestionsTable initialData={initialData} />
            </Suspense>
        </div>
    );
}
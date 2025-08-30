"use client";

import { Suspense } from "react";
import { QuestionsTable } from "./components/questions-table";
import { QuestionsHeader } from "./components/questions-header";
import { QuestionsFilters } from "./components/questions-filters";
import { questionsApi } from "@/lib/api/questions";
import { sectionsApi } from "@/lib/api/sections";
import { topicsApi } from "@/lib/api/topics";
import Loading from "./loading";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function QuestionsPage() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<{
        questions: any;
        sections: any[];
        topics: any[];
    }>({
        questions: null,
        sections: [],
        topics: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const filters = {
                    search: searchParams.get("search") || undefined,
                    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0,
                    topicId: searchParams.get("topic") && searchParams.get("topic") !== "all" 
                        ? parseInt(searchParams.get("topic")!) 
                        : undefined,
                    sectionId: searchParams.get("section") && searchParams.get("section") !== "all" 
                        ? parseInt(searchParams.get("section")!) 
                        : undefined,
                    sortBy: searchParams.get("sortBy") || "createdAt",
                    sortOrder: (searchParams.get("sortOrder") as 'asc' | 'desc') || "desc",
                };

                const [questions, sections, topics] = await Promise.all([
                    questionsApi.getQuestions(filters),
                    sectionsApi.getAllSections(),
                    topicsApi.getAllTopics()
                ]);

                setData({
                    questions,
                    sections,
                    topics
                });
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [searchParams]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <QuestionsHeader topics={data.topics} />
            <Suspense fallback={<div className="flex gap-4">
                <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
            </div>}>
                <QuestionsFilters sections={data.sections} topics={data.topics} />
            </Suspense>
            <Suspense fallback={<Loading />}>
                {data.questions && (
                    <QuestionsTable initialData={data.questions} topics={data.topics} />
                )}
            </Suspense>
        </div>
    );
}
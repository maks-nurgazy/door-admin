"use client";

import {Suspense} from "react";
import {QuestionsTable} from "./components/questions-table";
import {QuestionsHeader} from "./components/questions-header";
import {QuestionsFilters} from "./components/questions-filters";
import {questionsApi} from "@/lib/api/questions";
import {sectionTemplatesApi} from "@/lib/api/section-templates";
import {topicsApi} from "@/lib/api/topics";
import {testsApi} from "@/lib/api/tests";
import Loading from "./loading";
import {useEffect, useState, useCallback} from "react";
import {useSearchParams} from "next/navigation";

export default function QuestionsPage() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<{
        questions: any;
        sections: any[];
        topics: any[];
        tests: any[];
    }>({
        questions: null,
        sections: [],
        topics: [],
        tests: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const filters = {
                search: searchParams.get("search") || undefined,
                page: searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0,
                topicId: searchParams.get("topic") && searchParams.get("topic") !== "all"
                    ? parseInt(searchParams.get("topic")!)
                    : undefined,
                testId: searchParams.get("test") && searchParams.get("test") !== "all"
                    ? parseInt(searchParams.get("test")!)
                    : undefined,
                sectionId: searchParams.get("section") && searchParams.get("section") !== "all"
                    ? parseInt(searchParams.get("section")!)
                    : undefined,
                sortBy: searchParams.get("sortBy") || "createdAt",
                sortOrder: (searchParams.get("sortOrder") as 'asc' | 'desc') || "desc",
            };

            const [questions, sections, topics, tests] = await Promise.all([
                questionsApi.getQuestions(filters),
                sectionTemplatesApi.getAllSectionTemplates(),
                topicsApi.getAllTopics(),
                testsApi.getTests({ size: 100 })
            ]);

            setData({
                questions,
                sections,
                topics,
                tests: tests.data
            });
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSuccess = useCallback(() => {
        // Reload data after successful question creation/update
        loadData();
    }, [loadData]);

    if (isLoading) {
        return <Loading/>;
    }

    return (
        <div className="space-y-6">
            <QuestionsHeader
                topics={data.topics}
                onSuccess={handleSuccess}
            />
            <Suspense fallback={<div className="flex gap-4">
                <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md"/>
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md"/>
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md"/>
                <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md"/>
            </div>}>
                <QuestionsFilters sections={data.sections} topics={data.topics} tests={data.tests}/>
            </Suspense>
            <Suspense fallback={<Loading/>}>
                {data.questions && (
                    <QuestionsTable
                        key={`questions-${data.questions.currentPage}-${data.questions.totalItems}`}
                        initialData={data.questions}
                        topics={data.topics}
                    />
                )}
            </Suspense>
        </div>
    );
}
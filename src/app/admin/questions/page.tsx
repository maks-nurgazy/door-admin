import { Suspense } from "react";
import { QuestionsTable } from "./components/questions-table";
import { QuestionsHeader } from "./components/questions-header";
import { QuestionsFilters } from "./components/questions-filters";
import { questionsApi, QuestionType } from "@/lib/api/questions";
import { topicsApi } from "@/lib/api/topics";
import { sectionTemplatesApi } from "@/lib/api/section-templates";
import Loading from "./loading";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        topic?: string;
        questionType?: string;
        page?: string;
    }>;
}

export default async function QuestionsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const filters = {
        search: params.search,
        topicId: params.topic && params.topic !== "all" ? parseInt(params.topic) : undefined,
        questionType: params.questionType && params.questionType !== "all"
            ? params.questionType as QuestionType
            : undefined,
        page: params.page ? parseInt(params.page) - 1 : 0,
    };

    const [questions, topics, sections] = await Promise.all([
        questionsApi.getQuestions(filters),
        topicsApi.getTopics(),
        sectionTemplatesApi.getSectionTemplates(),
    ]);

    return (
        <div className="space-y-6">
            <QuestionsHeader topics={topics} sections={sections} />
            <Suspense fallback={
                <div className="flex gap-4">
                    <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
                    <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
                    <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
                </div>
            }>
                <QuestionsFilters topics={topics} />
            </Suspense>
            <Suspense fallback={<Loading />}>
                <QuestionsTable initialData={questions} topics={topics} sections={sections} />
            </Suspense>
        </div>
    );
}

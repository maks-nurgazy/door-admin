import { Suspense } from "react";
import { TopicsTable } from "./components/topics-table";
import { TopicsHeader } from "./components/topics-header";
import { topicsApi } from "@/lib/api/topics";
import Loading from "@/app/admin/users/loading";

export default async function TopicsPage() {
    const topics = await topicsApi.getTopics();

    return (
        <div className="space-y-6">
            <TopicsHeader />
            <Suspense fallback={<Loading />}>
                <TopicsTable initialData={topics} />
            </Suspense>
        </div>
    );
}

import { Suspense } from "react";
import { readingPassagesApi } from "@/lib/api/reading-passages";
import { PassagesTable } from "./components/passages-table";
import { PassagesHeader } from "./components/passages-header";

export default async function ReadingPassagesPage() {
    const data = await readingPassagesApi.getPassages({ page: 0, size: 50 });

    return (
        <div className="space-y-6">
            <PassagesHeader />
            <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
                <PassagesTable initialData={data.content} />
            </Suspense>
        </div>
    );
}

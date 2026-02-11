import { Suspense } from "react";
import { SectionsTable } from "./components/sections-table";
import { SectionsHeader } from "./components/sections-header";
import { sectionTemplatesApi } from "@/lib/api/section-templates";
import Loading from "./loading";

export default async function SectionsPage() {
    const sections = await sectionTemplatesApi.getSectionTemplates();

    return (
        <div className="space-y-6">
            <SectionsHeader currentCount={sections.length} />
            <Suspense fallback={<Loading />}>
                <SectionsTable initialData={sections} />
            </Suspense>
        </div>
    );
}

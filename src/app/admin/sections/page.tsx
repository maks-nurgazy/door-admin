import { Suspense } from "react";
import { SectionsTable } from "./components/sections-table";
import { SectionsHeader } from "./components/sections-header";
import { SectionsFilters } from "./components/sections-filters";
import { sectionsApi } from "@/lib/api/sections";
import Loading from "./loading";

interface PageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

export default async function SectionsPage({ searchParams }: PageProps) {
  const filters = {
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page) - 1 : 0,
  };

  const initialData = await sectionsApi.getSections(filters);

  return (
      <div className="space-y-6">
        <SectionsHeader />
        <Suspense fallback={<div className="flex gap-4">
          <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
        </div>}>
          <SectionsFilters />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <SectionsTable initialData={initialData} />
        </Suspense>
      </div>
  );
}
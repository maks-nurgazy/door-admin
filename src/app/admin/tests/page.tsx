import { Suspense } from "react";
import { TestsTable } from "./components/tests-table";
import { TestsHeader } from "./components/tests-header";
import { TestsFilters } from "./components/tests-filters";
import { testsApi } from "@/lib/api/tests";
import Loading from "./loading";

interface PageProps {
  searchParams: Promise<{
      search?: string;
      page?: string;
  }>;
}

export default async function TestsPage({ searchParams }: PageProps) {
    const searchParameters = await searchParams;
  const filters = {
    search: searchParameters.search,
    page: searchParameters.page ? parseInt(searchParameters.page) - 1 : 0,
  };

  const initialData = await testsApi.getTests(filters);

  return (
      <div className="space-y-6">
        <TestsHeader />
        <Suspense fallback={<div className="flex gap-4">
          <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
        </div>}>
          <TestsFilters />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <TestsTable initialData={initialData} />
        </Suspense>
      </div>
  );
}
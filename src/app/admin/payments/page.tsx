import { Suspense } from "react";
import { PaymentsTable } from "./components/payments-table";
import { PaymentsHeader } from "./components/payments-header";
import { PaymentsFilters } from "./components/payments-filters";
import { paymentsApi } from "@/lib/api/payments";
import Loading from "./loading";

interface PageProps {
  searchParams: Promise<{
      search?: string;
      status?: string;
      page?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const searchParameters = await searchParams;

  const filters = {
    search: searchParameters.search,
    status: searchParameters.status as any,
    page: searchParameters.page ? parseInt(searchParameters.page) - 1 : 0,
  };

  let initialData;
  try {
    initialData = await paymentsApi.getPayments(filters);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    throw new Error('Failed to load payments data. Please try again.');
  }

  if (!initialData) {
    throw new Error('No data received from the server');
  }

  return (
      <div className="space-y-6">
        <PaymentsHeader />
        <Suspense fallback={<div className="flex gap-4 flex-wrap">
          <div className="h-10 w-[300px] bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />
        </div>}>
          <PaymentsFilters />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <PaymentsTable initialData={initialData} />
        </Suspense>
      </div>
  );
}
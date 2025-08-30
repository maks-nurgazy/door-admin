"use client";

import { Suspense, useEffect, useState } from "react";
import { UserTestAccessTable } from "./components/user-test-access-table";
import { UserTestAccessHeader } from "./components/user-test-access-header";
import { userTestAccessApi, UserTestAccessResponse } from "@/lib/api/user-test-access";
import Loading from "./loading";

export default function UserTestAccessPage() {
    const [data, setData] = useState<UserTestAccessResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const accessData = await userTestAccessApi.getAllAccess(0, 10);
                setData(accessData);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSuccess = async () => {
        // Reload data after successful operation
        try {
            const accessData = await userTestAccessApi.getAllAccess(0, 10);
            setData(accessData);
        } catch (error) {
            console.error('Failed to reload data:', error);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            <UserTestAccessHeader onSuccess={handleSuccess} />
            <Suspense fallback={<Loading />}>
                {data && (
                    <UserTestAccessTable 
                        initialData={data} 
                        onSuccess={handleSuccess}
                    />
                )}
            </Suspense>
        </div>
    );
}

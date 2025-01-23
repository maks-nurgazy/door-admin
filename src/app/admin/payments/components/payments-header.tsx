"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function PaymentsHeader() {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Payments Management</h1>
            <Button asChild>
                <Link href="/admin/payments/manual">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Payment
                </Link>
            </Button>
        </div>
    );
}
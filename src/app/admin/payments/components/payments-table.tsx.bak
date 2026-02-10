"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Payment, PaymentsResponse, paymentsApi } from "@/lib/api/payments";
import { Skeleton } from "@/components/ui/skeleton";
import {format} from "date-fns";

interface PaymentsTableProps {
    initialData: PaymentsResponse;
}

export function PaymentsTable({ initialData:paymentsData }: PaymentsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const currentPage = searchParams.get("page")
        ? parseInt(searchParams.get("page")!) - 1
        : 0;

    const handlePageChange = async (newPage: number) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", (newPage + 1).toString());
            router.push(`${pathname}?${params.toString()}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        setIsLoading(true);
        try {
            await paymentsApi.updatePaymentStatus(id, status);
            const params = new URLSearchParams(searchParams.toString());
            await paymentsApi.getPayments({
                search: params.get("search") || undefined,
                status: params.get("status") || undefined,
                page: currentPage,
            });
        } catch (error) {
            console.error('Failed to update payment status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return <Badge className="bg-green-500">Paid</Badge>;
            case "UNPAID":
                return <Badge variant="destructive">Unpaid</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    const formatUserName = (user: Payment['user']) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.username || 'Unknown User';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payments List</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            paymentsData.data.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">
                                        {formatUserName(payment.user)}
                                    </TableCell>
                                    <TableCell>{payment.user.phone || '-'}</TableCell>
                                    <TableCell>{`${payment.amount} ${payment.currency}`}</TableCell>
                                    <TableCell>{payment.paymentMethod}</TableCell>
                                    <TableCell>{format(new Date(payment.paymentDate), "MMM dd, yyyy")}</TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {payment.receipt && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(payment.receipt!, '_blank')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleStatusChange(payment.id, "approve")}
                                                disabled={payment.status === "PAID"}
                                                className="text-green-500"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleStatusChange(payment.id, "reject")}
                                                disabled={payment.status === "UNPAID"}
                                                className="text-red-500"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {paymentsData.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                        >
                            Previous
                        </Button>
                        <span className="py-2 px-4">
              Page {currentPage + 1} of {paymentsData.totalPages}
            </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === paymentsData.totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}